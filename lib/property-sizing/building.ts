// Building attributes — estimated levels + dwelling floor area, FREE best-effort.
// Primary source (Sunshine Coast): Council's LiDAR-derived Building Footprints —
// real footprint area (m²) + roof height (m). Footprints are filtered to the
// parcel by centroid so neighbouring buildings don't inflate the total. Storeys
// = roofHeight ÷ ~3.1. Dwelling GFA ≈ footprint × storeys (detached) or that ÷
// unit count (strata). Every value carries a confidence % and, when low, a
// "verify in CoreLogic" flag. Falls back to a lot-coverage estimate off-coverage.

import type { AuStateCode } from "./types";

const SCC_FOOTPRINTS_URL =
  "https://services-ap1.arcgis.com/YQyt7djuXN7rQyg4/arcgis/rest/services/Building_Footprints_2022/FeatureServer/0/query";

const FLOOR_TO_FLOOR_M = 3.1;
const DETACHED_COVERAGE = 0.32; // rough footprint/lot ratio for a detached house
const COMPLEX_COVERAGE = 0.45; // denser coverage for a multi-unit site

export interface BuildingInput {
  state?: AuStateCode;
  lon?: number;
  lat?: number;
  parcelRings?: number[][][];
  lotSizeSqm: number | null;
  isUnit: boolean;
  unitsOnParcel: number; // number of dwellings sharing this parcel (>1 = strata)
}

export interface BuildingEstimate {
  levels: number | null;
  levelsConfidence: number | null; // 0–100
  dwellingAreaSqm: number | null;
  dwellingAreaConfidence: number | null; // 0–100
  flags: string[];
}

interface Footprint {
  totalAreaSqm: number;
  roofHeightAvg: number | null;
  roofHeightMax: number | null;
  count: number;
}

interface FootprintResp {
  features?: {
    attributes?: { Building_Footprint_Area_SQM?: number; Roof_Height_Max?: number; Roof_Height_Avg?: number };
    centroid?: { x: number; y: number };
  }[];
}

function storeysFromHeight(h: number | null): number | null {
  if (h == null || h <= 0) return null;
  return Math.max(1, Math.round(h / FLOOR_TO_FLOOR_M));
}

/** Ray-casting point-in-polygon against a single ring of [lon,lat] pairs. */
function pointInPolygon(x: number, y: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Query Council building footprints on the parcel (Sunshine Coast coverage).
 * Uses the parcel polygon when available and keeps only footprints whose centroid
 * lies inside the parcel (so adjacent complexes don't inflate the total). Returns
 * null outside coverage or on error.
 */
async function queryFootprint(input: BuildingInput): Promise<Footprint | null> {
  const params = new URLSearchParams({
    geometryType: input.parcelRings ? "esriGeometryPolygon" : "esriGeometryPoint",
    inSR: "4326",
    outSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "Building_Footprint_Area_SQM,Roof_Height_Max,Roof_Height_Avg",
    returnGeometry: "false",
    returnCentroid: "true",
    f: "json",
  });
  if (input.parcelRings) {
    params.set("geometry", JSON.stringify({ rings: input.parcelRings, spatialReference: { wkid: 4326 } }));
  } else if (input.lon != null && input.lat != null) {
    params.set("geometry", `${input.lon},${input.lat}`);
    params.set("distance", "25");
    params.set("units", "esriSRUnit_Meter");
  } else {
    return null;
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(SCC_FOOTPRINTS_URL, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: params.toString(),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as FootprintResp;
    let feats = data.features ?? [];
    if (!feats.length) return null;

    // Prefer footprints centred inside the parcel (drops boundary neighbours). Some
    // strata/GTP parcels are common property that weaves between the buildings, so
    // no footprint centroid is inside — if the filter empties the set, keep the
    // unfiltered hits (still gives a representative roof height for the levels est).
    const ring = input.parcelRings?.[0];
    if (ring && feats.some((f) => f.centroid)) {
      const inside = feats.filter((f) => f.centroid && pointInPolygon(f.centroid.x, f.centroid.y, ring));
      if (inside.length) feats = inside;
    }
    if (!feats.length) return null;

    let total = 0;
    let maxH: number | null = null;
    let avgH: number | null = null;
    for (const f of feats) {
      const a = f.attributes?.Building_Footprint_Area_SQM;
      if (typeof a === "number") total += a;
      const hm = f.attributes?.Roof_Height_Max;
      if (typeof hm === "number") maxH = maxH == null ? hm : Math.max(maxH, hm);
      const ha = f.attributes?.Roof_Height_Avg;
      if (typeof ha === "number") avgH = avgH == null ? ha : Math.max(avgH, ha);
    }
    if (total <= 0) return null;
    return { totalAreaSqm: total, roofHeightAvg: avgH, roofHeightMax: maxH, count: feats.length };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function estimateBuilding(input: BuildingInput): Promise<BuildingEstimate> {
  const fp = await queryFootprint(input);
  const strata = input.isUnit || input.unitsOnParcel > 1;
  return strata ? estimateStrata(input, fp) : estimateDetached(input, fp);
}

function estimateDetached(input: BuildingInput, fp: Footprint | null): BuildingEstimate {
  const heightStoreys = fp ? storeysFromHeight(fp.roofHeightAvg ?? fp.roofHeightMax) : null;
  const levels = heightStoreys ?? 1; // prior: most detached QLD homes are single-storey

  let footprint: number;
  let areaConf: number;
  let basis: string;
  if (fp) {
    footprint = fp.totalAreaSqm;
    areaConf = heightStoreys != null ? 72 : 60;
    basis = "council footprint (LiDAR)";
  } else if (input.lotSizeSqm != null) {
    footprint = Math.round(input.lotSizeSqm * DETACHED_COVERAGE);
    areaConf = 40;
    basis = "estimated from lot coverage";
  } else {
    return blank(["no footprint or lot size — measure manually"]);
  }

  const dwelling = Math.round(footprint * levels);
  const flags = areaConf < 55 ? [`dwelling area estimated (${basis}) — verify (CoreLogic)`] : [];
  return {
    levels,
    levelsConfidence: heightStoreys != null ? 80 : 45,
    dwellingAreaSqm: dwelling,
    dwellingAreaConfidence: areaConf,
    flags,
  };
}

function estimateStrata(input: BuildingInput, fp: Footprint | null): BuildingEstimate {
  // Per-unit floor area from free data is unreliable: a footprint covers the whole
  // complex incl. common area, and strata/GTP parcel geometry is messy. So we take
  // storeys from the LiDAR roof height, estimate per-unit area from site coverage ÷
  // units, and flag it for CoreLogic (recorded per-unit area) — the tier-2 workflow.
  const heightStoreys = fp ? storeysFromHeight(fp.roofHeightAvg ?? fp.roofHeightMax) : null;
  const levels = heightStoreys ?? 2;
  const units = Math.max(1, input.unitsOnParcel);

  const perUnit =
    input.lotSizeSqm != null ? Math.round((input.lotSizeSqm * COMPLEX_COVERAGE * levels) / units) : null;

  return {
    levels,
    levelsConfidence: heightStoreys != null ? 60 : 35,
    dwellingAreaSqm: perUnit,
    dwellingAreaConfidence: perUnit == null ? null : 30,
    flags: ["per-unit floor area is an estimate (site coverage ÷ units) — verify in CoreLogic"],
  };
}

function blank(flags: string[]): BuildingEstimate {
  return { levels: null, levelsConfidence: null, dwellingAreaSqm: null, dwellingAreaConfidence: null, flags };
}
