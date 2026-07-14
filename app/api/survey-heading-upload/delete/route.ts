import { NextRequest, NextResponse } from "next/server";
import { isStaff } from "@/lib/auth/is-staff";
import {
  findSurveyByDocumentId,
  countHeadingsForSurvey,
  deleteHeadingsForSurvey,
} from "@/lib/survey-heading-uploader/salesforce";

export const runtime = "nodejs";
export const maxDuration = 60;

// Two-phase: call without `confirm` to preview the count, call again with
// `confirm` matching the Survey Document ID exactly to actually delete.
export async function POST(req: NextRequest) {
  if (!(await isStaff("SURVEY_HEADING_UPLOADER_ALLOW_UNAUTHED"))) {
    return NextResponse.json(
      { ok: false, error: "Not authorised — staff login required." },
      { status: 401 }
    );
  }

  const body = (await req.json()) as { surveyNumber?: string; confirm?: string };
  const surveyNumber = body.surveyNumber?.trim();
  if (!surveyNumber) {
    return NextResponse.json({ ok: false, error: "Provide a Survey Document ID." }, { status: 400 });
  }

  const survey = await findSurveyByDocumentId(surveyNumber);
  if (!survey) {
    return NextResponse.json(
      { ok: false, error: `No Survey found for Document ID "${surveyNumber}".` },
      { status: 404 }
    );
  }

  const existingCount = await countHeadingsForSurvey(survey.id);

  // Preview only — no confirmation text supplied yet.
  if (!body.confirm) {
    return NextResponse.json({ ok: true, preview: true, surveyName: survey.name, count: existingCount });
  }

  if (body.confirm.trim() !== surveyNumber) {
    return NextResponse.json(
      { ok: false, error: "Confirmation text doesn't match the Survey Document ID." },
      { status: 400 }
    );
  }

  if (existingCount === 0) {
    return NextResponse.json({ ok: true, surveyName: survey.name, deleted: 0 });
  }

  const deleted = await deleteHeadingsForSurvey(survey.id);
  return NextResponse.json({ ok: true, surveyName: survey.name, deleted });
}
