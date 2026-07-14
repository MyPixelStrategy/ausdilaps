// Confirms a Directions API route actually travels along the named road (not just a
// shortest path that happens to start/end near it) — the Directions response has no
// structured road-name field, so road names only show up embedded in each step's
// `html_instructions` HTML string. Confirmed live against real council data, including
// the case that broke the free OSM tracer (a divided road, Logan Rd) and a road OSM
// didn't have mapped at all (St Andrews St) — Google's own routing handled both.

import type { LatLng } from "@/lib/kml/types";
import { roadNameVariants } from "./overpass";
import { decodePolyline } from "./polyline";
import { GoogleMapsConfigError } from "./google-geocode";

const DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json";

interface DirectionsResponse {
  status: string;
  error_message?: string;
  routes?: {
    overview_polyline: { points: string };
    legs: { steps: { html_instructions: string }[] }[];
  }[];
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ");
}

/** Sheet road names and Google's canonical names sometimes differ by a trailing plural
 *  (sheet's "St Andrews St" vs Google's "St Andrew St") on top of the usual Rd/Road-style
 *  abbreviation differences — cheap enough to just generate both and check either. */
function desingularizeWords(value: string): string {
  return value.replace(/\b(\w{4,})s\b/gi, "$1");
}

function looseNameKeys(roadName: string): string[] {
  const base = roadNameVariants(roadName);
  const extra = base.map(desingularizeWords);
  return Array.from(new Set([...base, ...extra])).map((v) => v.toLowerCase());
}

function routeFollowsRoad(steps: { html_instructions: string }[], roadName: string): boolean {
  const text = steps
    .map((s) => stripHtml(s.html_instructions))
    .join(" ")
    .toLowerCase();
  return looseNameKeys(roadName).some((key) => text.includes(key));
}

async function fetchDirections(params: Record<string, string>): Promise<DirectionsResponse> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new GoogleMapsConfigError("GOOGLE_MAPS_API_KEY not configured");

  const url = new URL(DIRECTIONS_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("region", "au");
  url.searchParams.set("key", key);

  const res = await fetch(url);
  const data = (await res.json()) as DirectionsResponse;
  if (data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST") {
    throw new GoogleMapsConfigError(
      `Google Directions ${data.status}: ${data.error_message ?? "check GOOGLE_MAPS_API_KEY and that the API + billing are enabled"}`
    );
  }
  return data;
}

export interface RoadFollowingRoute {
  polyline: LatLng[];
  followsRoad: boolean;
}

/**
 * Gets directions between two points and checks the route actually uses `roadName`.
 * If the first attempt doesn't, retries once with a waypoint at the midpoint — a
 * best-effort nudge, not a guarantee; `followsRoad: false` on the returned route means
 * the caller should flag it for manual verification rather than trust it silently.
 */
export async function findRoadFollowingRoute(
  origin: LatLng,
  destination: LatLng,
  roadName: string
): Promise<RoadFollowingRoute | null> {
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;

  const first = await fetchDirections({ origin: originStr, destination: destStr });
  let route = first.routes?.[0];
  if (route && routeFollowsRoad(route.legs.flatMap((l) => l.steps), roadName)) {
    return { polyline: decodePolyline(route.overview_polyline.points), followsRoad: true };
  }

  const mid = { lat: (origin.lat + destination.lat) / 2, lng: (origin.lng + destination.lng) / 2 };
  const retried = await fetchDirections({
    origin: originStr,
    destination: destStr,
    waypoints: `${mid.lat},${mid.lng}`,
  });
  route = retried.routes?.[0] ?? route;
  if (!route) return null;

  return {
    polyline: decodePolyline(route.overview_polyline.points),
    followsRoad: routeFollowsRoad(route.legs.flatMap((l) => l.steps), roadName),
  };
}
