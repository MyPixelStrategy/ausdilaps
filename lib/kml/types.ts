export interface LatLng {
  lat: number;
  lng: number;
}

export interface KmlPathInput {
  name: string;
  /** Ordered points along the path — 2 for a straight line, more for a traced road. */
  coordinates: LatLng[];
  /** Extra fields shown as KML ExtendedData (e.g. zone, location, footpath length). */
  metadata?: Record<string, string>;
}
