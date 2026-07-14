import { z } from "zod";

// Figure Number holds a range expression, sometimes multiple disjoint ranges,
// e.g. "0001 - 0215, 0333 - 0353". Validated as a pattern, not coerced to a number.
const FIGURE_NUMBER_PATTERN = /^\d+(\s*-\s*\d+)?(\s*,\s*\d+(\s*-\s*\d+)?)*$/;

export const surveyHeadingRow = z.object({
  location: z.string().trim().min(1, "Location is required"),
  figureNumber: z
    .string()
    .trim()
    .min(1, "Figure Number is required")
    .regex(FIGURE_NUMBER_PATTERN, "Figure Number must be a number or range, e.g. \"0001 - 0215, 0333 - 0353\""),
});

export type SurveyHeadingRow = z.infer<typeof surveyHeadingRow>;
