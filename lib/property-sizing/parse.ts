// Address parsing — turn free text / OCR components into ParsedAddress records.

import type { AuStateCode, ParsedAddress } from "./types";

const STATES: AuStateCode[] = ["QLD", "NSW", "VIC", "SA", "WA", "TAS", "ACT", "NT"];
const STATE_RE = new RegExp(`\\b(${STATES.join("|")})\\b`, "i");
const POSTCODE_RE = /\b(\d{4})\b/;

// Leading unit designators: "UNIT 103/8 …", "Unit 12 88 …", "U 5/10 …", "103/8 …".
// Longest keyword first, and the unit token must be a number (so "u" can't eat the
// "U" of "Unit" and leave "nit" as the unit).
const UNIT_RE = /^\s*(?:unit|apartment|apt|u)\s*\.?\s*(\d+[a-z]?)\s*[/,]?\s*(?=\d)/i;
const SLASH_UNIT_RE = /^\s*(\d+[a-z]?)\s*\/\s*(?=\d)/i;

const STATE_ALIASES: Record<string, AuStateCode> = {
  queensland: "QLD",
  "new south wales": "NSW",
  victoria: "VIC",
  "south australia": "SA",
  "western australia": "WA",
  tasmania: "TAS",
  "australian capital territory": "ACT",
  "northern territory": "NT",
};

export function normalizeState(s?: string | null): AuStateCode | undefined {
  if (!s) return undefined;
  const t = s.trim();
  const upper = t.toUpperCase();
  if ((STATES as string[]).includes(upper)) return upper as AuStateCode;
  return STATE_ALIASES[t.toLowerCase()];
}

export function parseAddressLine(raw: string, id?: string): ParsedAddress | null {
  const original = raw.trim();
  if (!original) return null;
  let work = original.replace(/\s+/g, " ");

  // Unit / strata.
  let unit: string | undefined;
  const u = work.match(UNIT_RE);
  if (u) {
    unit = u[1];
    work = work.slice(u[0].length).trim();
  } else {
    const sl = work.match(SLASH_UNIT_RE);
    if (sl) {
      unit = sl[1];
      work = work.slice(sl[0].length).trim();
    }
  }

  const state = normalizeState(work.match(STATE_RE)?.[1]);
  const postcode = work.match(POSTCODE_RE)?.[1];

  // Split street vs suburb — prefer the last comma as the boundary.
  let street = work;
  let suburb = "";
  const lastComma = work.lastIndexOf(",");
  if (lastComma >= 0) {
    street = work.slice(0, lastComma).trim();
    suburb = work
      .slice(lastComma + 1)
      .replace(STATE_RE, " ")
      .replace(POSTCODE_RE, " ")
      .replace(/\s+/g, " ")
      .trim();
  } else if (state) {
    // No comma: strip trailing "STATE POSTCODE" and take the last word as suburb.
    let tail = work;
    if (postcode) tail = tail.replace(new RegExp(`\\s*${postcode}\\s*$`), "").trim();
    const idx = tail.toUpperCase().lastIndexOf(state);
    if (idx > 0) {
      const beforeState = tail.slice(0, idx).trim();
      const parts = beforeState.split(" ");
      suburb = parts.slice(-1).join(" ");
      street = parts.slice(0, -1).join(" ");
    }
  }

  street = street.replace(/,+\s*$/, "").trim();
  return { id, raw: original, unit, street, suburb, state, postcode };
}

/** Parse a pasted block: one address per line, optional leading "ID<tab>ADDRESS". */
export function parseAddressBlock(text: string): ParsedAddress[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(\S+)(?:\t+|\s{2,})(.+)$/);
      if (m && /\d/.test(m[2]) && (/,/.test(m[2]) || STATE_RE.test(m[2]))) {
        return parseAddressLine(m[2], m[1]);
      }
      return parseAddressLine(line);
    })
    .filter((a): a is ParsedAddress => !!a);
}
