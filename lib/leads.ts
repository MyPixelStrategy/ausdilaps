import { z } from "zod";

export const INQUIRY_TYPES = [
  "New Quote",
  "I Received An Access Letter",
  "Report Inquiry",
  "General Inquiry",
] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const PROPERTY_ROLES = ["Tenant", "Property Owner", "Property Agent", "Other"] as const;
export type PropertyRole = (typeof PROPERTY_ROLES)[number];

export const CONTACT_METHODS = ["SMS", "Call", "Email"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

/** Quote form payload. The server is the source of truth for validation; the
 *  client form mirrors these rules for UX.
 *
 *  `inquiryType` branches which fields are relevant (mirrors the legacy
 *  ausdilaps.com.au consultation form): New Quote uses the project-scoping
 *  fields; the other three are lighter-weight enquiries. All branch-specific
 *  fields stay optional server-side since the client only shows/requires the
 *  ones for the selected branch. */
export const quoteSchema = z.object({
  inquiryType: z.enum(INQUIRY_TYPES),
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional().default(""),
  role: z.string().trim().optional().default(""),
  company: z.string().trim().optional().default(""),
  projectName: z.string().trim().optional().default(""),
  projectLocation: z.string().trim().optional().default(""),
  /** number of adjoining properties — string from the form, coerced */
  adjoiningCount: z.coerce.number().int().nonnegative().max(100000).optional(),
  requiredStart: z.string().trim().optional().default(""),
  daConditionRef: z.string().trim().optional().default(""),
  // "I Received An Access Letter" branch
  propertyRole: z.enum(PROPERTY_ROLES).optional(),
  // "Report Inquiry" / "General Inquiry" branches
  projectNumber: z.string().trim().optional().default(""),
  documentId: z.string().trim().optional().default(""),
  // "I Received An Access Letter" / "General Inquiry" branches
  contactAddress: z.string().trim().optional().default(""),
  contactMethod: z.array(z.enum(CONTACT_METHODS)).optional().default([]),
  notes: z.string().trim().max(5000).optional().default(""),
  // anti-spam
  company_website: z.string().optional().default(""), // honeypot — must stay empty
  turnstileToken: z.string().optional().default(""),
  sourcePage: z.string().optional().default(""),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

export type LeadTier = "tier1" | "tier2" | "residential" | "unclassified";

const TIER1_SIGNALS = [
  "government",
  "council",
  "department",
  "transport for",
  "tier 1",
  "tier1",
  "alliance",
  "joint venture",
  " jv",
  "lendlease",
  "cpb",
  "john holland",
  "fulton hogan",
  "georgiou",
  "downer",
  "laing o",
  "infrastructure",
  "constructions",
  "civil",
  "principal contractor",
  "project manager",
  "contracts administrator",
  "contracts admin",
  "risk officer",
];

/**
 * Classify the lead so sales can triage. Tier-1 = government / major-contractor
 * signals or many adjoining properties (defensible, high-value work). Tier-2 =
 * a commercial enquiry (has a company). Residential = an individual.
 */
export function classifyTier(input: {
  role?: string;
  company?: string;
  adjoiningCount?: number;
}): LeadTier {
  const text = `${input.role ?? ""} ${input.company ?? ""}`.toLowerCase();
  const count = input.adjoiningCount ?? 0;

  if (count >= 20) return "tier1";
  if (TIER1_SIGNALS.some((k) => text.includes(k))) return "tier1";
  if ((input.company ?? "").trim().length > 1) return "tier2";
  if (count >= 1 || (input.role ?? "").trim().length > 1) return "residential";
  return "unclassified";
}
