import Papa from "papaparse";
import { surveyHeadingRow, type SurveyHeadingRow } from "./schema";

export interface ParsedRow {
  rowNumber: number; // 1-based, matches the CSV line the user would see in Excel
  data: SurveyHeadingRow;
}

export interface RowError {
  row: number;
  message: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: RowError[];
}

// Accept both the raw Salesforce field API names (the confirmed upload format —
// see sample bulkQuery_result_*.csv) and human-readable variants for robustness.
const LOCATION_HEADERS = ["name", "location", "heading"];
const FIGURE_NUMBER_HEADERS = ["figure_number__c", "figure number", "figure #", "figure no", "figure no."];

function normalise(header: string): string {
  return header.trim().toLowerCase();
}

export function parseSurveyHeadingCsv(csvText: string): ParseResult {
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true });

  if (parsed.data.length === 0) {
    throw new Error("The CSV file is empty.");
  }

  const header = parsed.data[0].map(normalise);
  const locationIndex = header.findIndex((h) => LOCATION_HEADERS.includes(h));
  const figureNumberIndex = header.findIndex((h) => FIGURE_NUMBER_HEADERS.includes(h));

  if (locationIndex === -1 || figureNumberIndex === -1) {
    throw new Error(
      `Missing required columns. Expected a "Location" column and a "Figure Number" column, found: ${parsed.data[0].join(", ")}`
    );
  }

  const rows: ParsedRow[] = [];
  const errors: RowError[] = [];

  for (let i = 1; i < parsed.data.length; i++) {
    const rowNumber = i + 1; // account for the header row
    const raw = {
      location: parsed.data[i][locationIndex] ?? "",
      figureNumber: parsed.data[i][figureNumberIndex] ?? "",
    };

    const result = surveyHeadingRow.safeParse(raw);
    if (result.success) {
      rows.push({ rowNumber, data: result.data });
    } else {
      errors.push({ row: rowNumber, message: result.error.issues[0].message });
    }
  }

  return { rows, errors };
}
