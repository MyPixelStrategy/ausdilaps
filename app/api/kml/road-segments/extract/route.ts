import { NextRequest, NextResponse } from "next/server";
import { isStaff } from "@/lib/auth/is-staff";
import { imageExtractRequestSchema } from "@/lib/kml/road-segments/schema";
import { extractRoadSegmentsFromImage, ocrConfigured } from "@/lib/kml/road-segments/ocr";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  const parsed = imageExtractRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (!ocrConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Screenshot reading isn't configured yet — enter rows manually instead." },
      { status: 422 }
    );
  }

  try {
    const segments = await extractRoadSegmentsFromImage(parsed.data.image.data, parsed.data.image.mediaType);
    return NextResponse.json({ ok: true, count: segments.length, segments });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
