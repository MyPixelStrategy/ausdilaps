// Dispatcher: Google is the primary tracer when GOOGLE_MAPS_API_KEY is configured (more
// reliable — see trace-google.ts); otherwise falls back to the free OSM tracer
// (trace-osm.ts) so the tool still works without billing set up.

import type { RoadSegmentInput, RoadTraceResult } from "./types";
import { traceRoadSegmentsGoogle } from "./trace-google";
import { traceRoadSegmentsOsm } from "./trace-osm";

export async function traceRoadSegments(segments: RoadSegmentInput[]): Promise<RoadTraceResult[]> {
  if (process.env.GOOGLE_MAPS_API_KEY) {
    return traceRoadSegmentsGoogle(segments);
  }
  return traceRoadSegmentsOsm(segments);
}
