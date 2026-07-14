import type { KmlPathInput } from "./types";

export interface CsvParseError {
  line: number;
  reason: string;
}

export interface CsvParseResult {
  paths: KmlPathInput[];
  errors: CsvParseError[];
}

const REQUIRED_COLUMNS = ["name", "start_lat", "start_lng", "end_lat", "end_lng"] as const;

export const SAMPLE_CSV =
  "name,start_lat,start_lng,end_lat,end_lng\n" +
  "Site Access Road,-27.4200,153.0300,-27.4250,153.0360\n";

/** Splits one CSV line into fields, honouring double-quoted fields with embedded commas. */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

/**
 * Parses a CSV with a header row containing name,start_lat,start_lng,end_lat,end_lng
 * (case-insensitive, order-independent). Bad rows are reported with their line number
 * rather than silently dropped.
 */
export function parseKmlCsv(text: string): CsvParseResult {
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
  const errors: CsvParseError[] = [];
  if (lines.length === 0) {
    return { paths: [], errors: [{ line: 0, reason: "The file is empty." }] };
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const colIndex: Record<string, number> = {};
  for (const col of REQUIRED_COLUMNS) {
    const idx = header.indexOf(col);
    if (idx === -1) {
      errors.push({ line: 1, reason: `Missing required column "${col}"` });
    } else {
      colIndex[col] = idx;
    }
  }
  if (errors.length > 0) return { paths: [], errors };

  const paths: KmlPathInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const lineNumber = i + 1;
    const fields = splitCsvLine(lines[i]);

    const name = fields[colIndex.name]?.trim();
    if (!name) {
      errors.push({ line: lineNumber, reason: "Missing name" });
      continue;
    }

    const nums: Record<string, number> = {};
    let numsOk = true;
    for (const col of ["start_lat", "start_lng", "end_lat", "end_lng"] as const) {
      const raw = fields[colIndex[col]];
      const n = Number(raw);
      if (raw === undefined || raw === "" || Number.isNaN(n)) {
        errors.push({ line: lineNumber, reason: `"${col}" is not a number` });
        numsOk = false;
        break;
      }
      nums[col] = n;
    }
    if (!numsOk) continue;

    if (Math.abs(nums.start_lat) > 90 || Math.abs(nums.end_lat) > 90) {
      errors.push({ line: lineNumber, reason: "Latitude must be between -90 and 90" });
      continue;
    }
    if (Math.abs(nums.start_lng) > 180 || Math.abs(nums.end_lng) > 180) {
      errors.push({ line: lineNumber, reason: "Longitude must be between -180 and 180" });
      continue;
    }

    paths.push({
      name,
      coordinates: [
        { lat: nums.start_lat, lng: nums.start_lng },
        { lat: nums.end_lat, lng: nums.end_lng },
      ],
    });
  }

  return { paths, errors };
}
