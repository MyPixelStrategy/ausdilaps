// Queensland lot-size lookup — free, no API key.
// Pipeline (validated live): address -> QldLocator geocode -> point-in-polygon
// query against the DCDB (Land Parcel Property Framework) -> lot_area in m².
// Returns the parcel geometry too, for the building-attributes step.

import type { LotResult } from "./types";

const GEOCODE_URL =
  "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Location/QldLocator/GeocodeServer/findAddressCandidates";
const CADASTRE_URL =
  "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LandParcelPropertyFramework/MapServer/4/query";

interface GeocodeResp {
  candidates?: { address?: string; score?: number; location?: { x: number; y: number } }[];
}
interface CadastreResp {
  features?: { attributes?: Record<string, unknown>; geometry?: { rings?: number[][][] } }[];
}

async function fetchJson<T>(url: string, timeoutMs = 12000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

export async function lookupQld(addr: { street: string; suburb: string; postcode?: string }): Promise<LotResult> {
  const singleLine = [addr.street, addr.suburb, "QLD", addr.postcode].filter(Boolean).join(", ");

  let cand: NonNullable<GeocodeResp["candidates"]>[number] | undefined;
  try {
    const g = await fetchJson<GeocodeResp>(
      `${GEOCODE_URL}?SingleLine=${encodeURIComponent(singleLine)}&f=json&outSR=4326&maxLocations=1`
    );
    cand = g.candidates?.[0];
  } catch (e) {
    return { status: "error", flags: [`geocode failed: ${(e as Error).message}`] };
  }
  if (!cand?.location) {
    return { status: "not_found", flags: ["address not found — verify / measure manually"] };
  }

  const { x, y } = cand.location;
  const matchedAddress = cand.address ?? null;
  const matchScore = typeof cand.score === "number" ? cand.score : null;

  try {
    const c = await fetchJson<CadastreResp>(
      `${CADASTRE_URL}?geometry=${x},${y}&geometryType=esriGeometryPoint&inSR=4326` +
        `&spatialRel=esriSpatialRelIntersects&outFields=lot,plan,lotplan,lot_area,locality` +
        `&returnGeometry=true&outSR=4326&f=json`
    );
    const feat = c.features?.[0];
    const attrs = feat?.attributes;
    const area = attrs?.lot_area;
    if (!attrs || area == null) {
      return {
        status: "no_parcel",
        matchedAddress,
        matchScore,
        _lon: x,
        _lat: y,
        flags: ["no titled parcel at this point — measure manually"],
      };
    }
    return {
      status: "ok",
      lotSizeSqm: Math.round(Number(area)),
      lotPlan: (attrs.lotplan as string) ?? null,
      matchedAddress,
      matchScore,
      source: "QLD DCDB",
      _lon: x,
      _lat: y,
      _parcelRings: feat?.geometry?.rings,
      flags: [],
    };
  } catch (e) {
    return { status: "error", matchedAddress, matchScore, _lon: x, _lat: y, flags: [`cadastre failed: ${(e as Error).message}`] };
  }
}
