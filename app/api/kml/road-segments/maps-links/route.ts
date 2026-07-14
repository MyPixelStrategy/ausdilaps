import { NextRequest, NextResponse } from "next/server";
import { isStaff } from "@/lib/auth/is-staff";
import { roadSegmentTraceRequestSchema } from "@/lib/kml/road-segments/schema";
import { findMapsLinks } from "@/lib/kml/road-segments/maps-links";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  if (!(await isStaff("KML_ROAD_TRACE_ALLOW_UNAUTHED"))) {
    return NextResponse.json({ ok: false, error: "Not authorised." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = roadSegmentTraceRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const results = await findMapsLinks(parsed.data.segments);
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    // Covers both per-batch failures and GoogleMapsConfigError (bad key / API or billing
    // not enabled) — its message is already descriptive, so one generic catch is enough.
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
