// Salesforce Lead sync — best-effort, gated behind SF_SYNC_ENABLED. Uses the
// OAuth 2.0 client-credentials flow. Never throws; returns {id} or {error} so
// the caller can persist the outcome without blocking the lead.

import type { LeadTier } from "@/lib/leads";

export type SalesforceLead = {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  projectName?: string | null;
  projectLocation?: string | null;
  notes?: string | null;
  tier: LeadTier;
  inquiryType?: string | null;
  propertyRole?: string | null;
  projectNumber?: string | null;
  documentId?: string | null;
  contactAddress?: string | null;
  contactMethod?: string[] | null;
};

export async function syncLeadToSalesforce(
  lead: SalesforceLead
): Promise<{ id?: string; error?: string }> {
  const clientId = process.env.SF_CLIENT_ID;
  const clientSecret = process.env.SF_CLIENT_SECRET;
  const loginUrl = process.env.SF_LOGIN_URL ?? "https://login.salesforce.com";
  const apiVersion = process.env.SF_API_VERSION ?? "v60.0";

  if (!clientId || !clientSecret) return { error: "Salesforce not configured" };

  try {
    const tokenRes = await fetch(`${loginUrl}/services/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    if (!tokenRes.ok) return { error: `SF token ${tokenRes.status}` };
    const token = (await tokenRes.json()) as { access_token?: string; instance_url?: string };
    if (!token.access_token || !token.instance_url) return { error: "SF token missing fields" };

    const parts = lead.name.trim().split(/\s+/);
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : lead.name;
    const firstName = parts.length > 1 ? parts[0] : undefined;

    const res = await fetch(
      `${token.instance_url}/services/data/${apiVersion}/sobjects/Lead`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(firstName && { FirstName: firstName }),
          LastName: lastName,
          Company: lead.company || "Residential enquiry",
          Email: lead.email,
          ...(lead.phone && { Phone: lead.phone }),
          ...(lead.role && { Title: lead.role }),
          LeadSource: "Website — Quote form",
          Rating: lead.tier === "tier1" ? "Hot" : lead.tier === "tier2" ? "Warm" : "Cold",
          Description: [
            lead.inquiryType && `Inquiry type: ${lead.inquiryType}`,
            lead.projectName && `Project: ${lead.projectName}`,
            lead.projectLocation && `Location: ${lead.projectLocation}`,
            lead.propertyRole && `Property role: ${lead.propertyRole}`,
            lead.projectNumber && `Project/OPT number: ${lead.projectNumber}`,
            lead.documentId && `Document ID: ${lead.documentId}`,
            lead.contactAddress && `Address: ${lead.contactAddress}`,
            lead.contactMethod?.length && `Preferred contact: ${lead.contactMethod.join(", ")}`,
            `Tier: ${lead.tier}`,
            lead.notes && `Notes: ${lead.notes}`,
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      }
    );
    const data = (await res.json()) as { id?: string };
    if (!res.ok) return { error: `SF lead ${res.status}` };
    return { id: data.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
