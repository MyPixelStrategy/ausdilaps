import type { LatLng } from "@/lib/kml/types";

/** One row of a council footpath/road register (e.g. ZONE, LOCATION, ROAD NAME, FROM DESC, TO DESC, FOOTPATH LENGTH). */
export interface RoadSegmentInput {
  id?: string;
  zone?: string;
  /** Suburb/locality, e.g. "Kuraby". */
  location: string;
  roadNo?: string;
  roadName: string;
  fromDesc: string;
  toDesc: string;
  /** As printed on the sheet — "N/A" or blank means no footpath on this segment. */
  footpathLengthKm?: number | null;
}

export type RoadTraceStatus = "ok" | "geocode_failed" | "route_failed" | "error";

export interface RoadTraceResult {
  input: RoadSegmentInput;
  status: RoadTraceStatus;
  /** Traced road centerline between the FROM and TO points, in order. Null unless status is "ok". */
  coordinates: LatLng[] | null;
  /** Length of the traced coordinates, in km, for comparison against the sheet's footpath length. */
  tracedLengthKm: number | null;
  /** Human-readable notes: geocode/route failures, length-mismatch sanity check, etc. */
  flags: string[];
}
