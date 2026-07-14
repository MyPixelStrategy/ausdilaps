import { NextRequest, NextResponse } from "next/server";
import { isStaff } from "@/lib/auth/is-staff";
import { parseSurveyHeadingCsv } from "@/lib/survey-heading-uploader/parse-csv";
import {
  findSurveyByDocumentId,
  countHeadingsForSurvey,
  insertHeadings,
} from "@/lib/survey-heading-uploader/salesforce";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!(await isStaff("SURVEY_HEADING_UPLOADER_ALLOW_UNAUTHED"))) {
    return NextResponse.json(
      { ok: false, error: "Not authorised — staff login required." },
      { status: 401 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  const surveyNumber = form.get("surveyNumber");

  if (!(file instanceof File) || typeof surveyNumber !== "string" || !surveyNumber.trim()) {
    return NextResponse.json(
      { ok: false, error: "Provide a CSV file and a Survey Document ID." },
      { status: 400 }
    );
  }

  let parsed: ReturnType<typeof parseSurveyHeadingCsv>;
  try {
    parsed = parseSurveyHeadingCsv(await file.text());
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }

  if (parsed.rows.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No valid rows found in the CSV.", rowErrors: parsed.errors },
      { status: 422 }
    );
  }

  const survey = await findSurveyByDocumentId(surveyNumber.trim());
  if (!survey) {
    return NextResponse.json(
      { ok: false, error: `No Survey found for Document ID "${surveyNumber}".` },
      { status: 404 }
    );
  }

  const existingCount = await countHeadingsForSurvey(survey.id);
  if (existingCount > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `This Survey already has ${existingCount} heading${existingCount === 1 ? "" : "s"}. Delete the existing ones in Salesforce first if you need to redo this upload.`,
      },
      { status: 409 }
    );
  }

  const outcomes = await insertHeadings(survey.id, parsed.rows);
  const created = outcomes.filter((o) => o.success).length;
  const insertErrors = outcomes
    .filter((o) => !o.success)
    .map((o) => ({ row: o.row, message: o.error ?? "Unknown error" }));

  return NextResponse.json({
    ok: true,
    surveyName: survey.name,
    created,
    errors: [...parsed.errors, ...insertErrors],
  });
}
