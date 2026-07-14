import { createClient } from "@/lib/supabase/server";

/**
 * Staff gate shared by internal admin API routes. Full admin auth (login UI)
 * lands with the Phase-6 admin backend; until then, each tool has its own
 * `*_ALLOW_UNAUTHED=true` env escape hatch for local dev. When a Supabase
 * session exists, only internal staff (admin/superadmin) pass.
 */
export async function isStaff(allowUnauthedEnvVar: string): Promise<boolean> {
  if (process.env[allowUnauthedEnvVar] === "true") return true;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    return profile?.role === "admin" || profile?.role === "superadmin";
  } catch {
    return false;
  }
}
