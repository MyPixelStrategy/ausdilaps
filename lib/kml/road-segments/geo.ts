import type { LatLng } from "@/lib/kml/types";

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function pathLengthKm(points: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversineKm(points[i - 1], points[i]);
  return total;
}

// Council footpath registers commonly total BOTH sides of the road, so the sheet's
// length is expected to land anywhere from ~1x (footpath on one side only) to ~2x
// (both sides) the traced centerline length — only flag genuine outliers either side.
const LENGTH_MISMATCH_MIN_RATIO = 0.5;
const LENGTH_MISMATCH_MAX_RATIO = 2.5;

export function lengthMismatchFlag(tracedKm: number, sheetKm: number | null | undefined): string | null {
  if (sheetKm == null || sheetKm <= 0 || tracedKm <= 0) return null;
  const ratio = sheetKm / tracedKm;
  if (ratio < LENGTH_MISMATCH_MIN_RATIO || ratio > LENGTH_MISMATCH_MAX_RATIO) {
    return `traced ${tracedKm.toFixed(2)}km vs sheet's ${sheetKm.toFixed(2)}km — verify`;
  }
  return null;
}
