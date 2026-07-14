// Orchestrator: for each road-register row, resolve its FROM/TO points + road-following
// route (google-route.ts) and build a Google Maps directions deep-link — no API key
// needed to open the link itself, only to resolve the coordinates and check the route.

import type { LatLng } from "@/lib/kml/types";
import type { RoadSegmentInput, MapsLinkResult } from "./types";
import { mapPool } from "@/lib/util/map-pool";
import { resolveSegmentRoute } from "./google-route";

const WAYPOINT_SAMPLE_COUNT = 6;

function sampleEvenly<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const step = (items.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => items[Math.round(i * step)]);
}

function buildMapsUrl(origin: LatLng, destination: LatLng, waypoints: LatLng[]): string {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  url.searchParams.set("travelmode", "driving");
  if (waypoints.length > 0) {
    url.searchParams.set("waypoints", waypoints.map((w) => `${w.lat},${w.lng}`).join("|"));
  }
  return url.toString();
}

async function findOne(segment: RoadSegmentInput): Promise<MapsLinkResult> {
  const { origin, destination, route, flags } = await resolveSegmentRoute(segment);

  if (!origin || !destination) {
    return { input: segment, status: "not_found", origin, destination, mapsUrl: null, followsRoad: false, flags };
  }

  const waypoints = route ? sampleEvenly(route.polyline, WAYPOINT_SAMPLE_COUNT) : [];
  return {
    input: segment,
    status: "ok",
    origin,
    destination,
    mapsUrl: buildMapsUrl(origin, destination, waypoints),
    followsRoad: route?.followsRoad ?? false,
    flags,
  };
}

export async function findMapsLinks(segments: RoadSegmentInput[]): Promise<MapsLinkResult[]> {
  return mapPool(segments, 8, findOne);
}
