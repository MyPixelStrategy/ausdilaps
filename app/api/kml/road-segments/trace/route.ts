import { NextRequest, NextResponse } from "next/server";
import { isStaff } from "@/lib/auth/is-staff";
import { roadSegmentTraceRequestSchema } from "@/lib/kml/road-segments/schema";
import { traceRoadSegments } from "@/lib/kml/road-segments/trace";

export const runtime = "nodejs";
// Nominatim's 1 req/sec policy means large batches take a while (~2s/row) — give it room.
export const maxDuration = 290;

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
    const results = await traceRoadSegments(parsed.data.segments);
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
