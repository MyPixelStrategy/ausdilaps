// Orchestrator: traces each road-register row's real road geometry using OSM data only.
//
// Approach (revised after live testing against real council data — see comments below):
// 1. Geocode each unique LOCATION (suburb) once via Nominatim, purely to get a bounding
//    box to search within. Suburb-level geocoding is reliable; per-street geocoding of
//    cross-streets was NOT — Nominatim's free-text search mis-ranked or missed several
//    real cross-streets from the sample sheet (e.g. it returned a park instead of a
//    street for "St Andrews St", and couldn't find "Logan Rd"/"Rochedale Rd" when
//    combined with "Kuraby" even though both roads exist and border the suburb).
// 2. Fetch every named road referenced by that location's rows (the main road name AND
//    both cross-street names) from Overpass in one call, keeping each way's real OSM name.
// 3. For each row: find where the target road's own graph is physically closest to the
//    FROM/TO cross-street's way geometry — i.e. the real intersection — with no
//    geocoding of the cross-street at all. Then trace the shortest path between those
//    two points, constrained to the target road's own graph only.

import type { RoadSegmentInput, RoadTraceResult } from "./types";
import { mapPool } from "@/lib/util/map-pool";
import { geocodeSuburb } from "./geocode";
import { fetchRoadsByNames, bboxAround, nameMatches, type OsmWay } from "./overpass";
import { buildRoadGraph, nearestNodeToWays, shortestPath } from "./graph";
import { pathLengthKm } from "./geo";

const SNAP_TOLERANCE_KM = 0.3;
// Council footpath registers commonly total BOTH sides of the road, so the sheet's
// length is expected to land anywhere from ~1x (footpath on one side only) to ~2x
// (both sides) the traced centerline length — only flag genuine outliers either side.
const LENGTH_MISMATCH_MIN_RATIO = 0.5;
const LENGTH_MISMATCH_MAX_RATIO = 2.5;

function waysNamed(ways: OsmWay[], targetName: string): OsmWay[] {
  return ways.filter((w) => nameMatches(w.name, targetName));
}

function traceOne(segment: RoadSegmentInput, locationWays: OsmWay[] | null): RoadTraceResult {
  const flags: string[] = [];

  if (!locationWays) {
    flags.push(`couldn't locate "${segment.location}" — verify manually`);
    return { input: segment, status: "geocode_failed", coordinates: null, tracedLengthKm: null, flags };
  }

  const targetWays = waysNamed(locationWays, segment.roadName);
  if (targetWays.length === 0) {
    flags.push(`no OSM road named "${segment.roadName}" found near ${segment.location} — verify manually`);
    return { input: segment, status: "route_failed", coordinates: null, tracedLengthKm: null, flags };
  }

  const fromWays = waysNamed(locationWays, segment.fromDesc);
  const toWays = waysNamed(locationWays, segment.toDesc);
  if (fromWays.length === 0) flags.push(`no OSM road named "${segment.fromDesc}" found near ${segment.location} — verify manually`);
  if (toWays.length === 0) flags.push(`no OSM road named "${segment.toDesc}" found near ${segment.location} — verify manually`);
  if (fromWays.length === 0 || toWays.length === 0) {
    return { input: segment, status: "route_failed", coordinates: null, tracedLengthKm: null, flags };
  }

  const graph = buildRoadGraph(targetWays);
  const fromNode = nearestNodeToWays(graph, fromWays);
  const toNode = nearestNodeToWays(graph, toWays);
  if (!fromNode || !toNode) {
    flags.push("could not find where the cross-streets meet the road — verify manually");
    return { input: segment, status: "route_failed", coordinates: null, tracedLengthKm: null, flags };
  }
  if (fromNode.distanceKm > SNAP_TOLERANCE_KM) {
    flags.push(`"${segment.fromDesc}" is ${(fromNode.distanceKm * 1000).toFixed(0)}m from ${segment.roadName} — verify`);
  }
  if (toNode.distanceKm > SNAP_TOLERANCE_KM) {
    flags.push(`"${segment.toDesc}" is ${(toNode.distanceKm * 1000).toFixed(0)}m from ${segment.roadName} — verify`);
  }

  const path = shortestPath(graph, fromNode.key, toNode.key);
  if (!path) {
    flags.push(`couldn't trace a continuous path along ${segment.roadName} between these points — verify manually`);
    return { input: segment, status: "route_failed", coordinates: null, tracedLengthKm: null, flags };
  }

  const tracedLengthKm = pathLengthKm(path);
  if (segment.footpathLengthKm != null && segment.footpathLengthKm > 0) {
    const ratio = Math.abs(tracedLengthKm - segment.footpathLengthKm) / segment.footpathLengthKm;
    if (ratio > LENGTH_MISMATCH_RATIO) {
      flags.push(`traced ${tracedLengthKm.toFixed(2)}km vs sheet's ${segment.footpathLengthKm.toFixed(2)}km — verify`);
    }
  }

  return { input: segment, status: "ok", coordinates: path, tracedLengthKm, flags };
}

export async function traceRoadSegments(segments: RoadSegmentInput[]): Promise<RoadTraceResult[]> {
  const groups = new Map<string, RoadSegmentInput[]>();
  for (const s of segments) {
    const key = s.location.trim().toLowerCase();
    const arr = groups.get(key);
    if (arr) arr.push(s);
    else groups.set(key, [s]);
  }

  // One suburb-level geocode + one Overpass fetch per unique location, shared by every row there.
  const waysByLocation = new Map<string, OsmWay[] | null>();
  await mapPool(Array.from(groups.entries()), 2, async ([key, rows]) => {
    const anchor = await geocodeSuburb(rows[0].location);
    if (!anchor) {
      waysByLocation.set(key, null);
      return;
    }
    const names = Array.from(new Set(rows.flatMap((r) => [r.roadName, r.fromDesc, r.toDesc])));
    try {
      waysByLocation.set(key, await fetchRoadsByNames(names, bboxAround(anchor, 4)));
    } catch {
      waysByLocation.set(key, []);
    }
  });

  return segments.map((s) => traceOne(s, waysByLocation.get(s.location.trim().toLowerCase()) ?? null));
}
