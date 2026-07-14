import { NextRequest, NextResponse } from "next/server";
import { kmlRequestSchema } from "@/lib/kml/schema";
import { buildKml } from "@/lib/kml/build";

export const runtime = "nodejs";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "paths"
  );
}

// Staff gate is off for now — no admin login UI exists yet (Phase 6). Re-add
// `isStaff("KML_BUILDER_ALLOW_UNAUTHED")` from lib/auth/is-staff.ts before
// this tool is exposed on a domain the public can reach.
export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = kmlRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { documentName, paths } = parsed.data;
  const kml = buildKml(paths, documentName);
  const filename = `${slugify(documentName)}.kml`;

  return new NextResponse(kml, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.google-earth.kml+xml",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
