import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Server-only — never import into a client component.
 * Used by API routes for privileged writes (leads, report metadata, releases)
 * that bypass RLS after an explicit server-side access check.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      `Supabase env vars missing. URL=${url ? "ok" : "MISSING"} KEY=${key ? "ok" : "MISSING"}`
    );
  }
  return createClient(url, key);
}
