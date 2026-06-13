// Run all SQL migrations in supabase/migrations/ against DATABASE_URL.
// Usage: `npm run migrate`  (reads DATABASE_URL from .env.local or the env)
//
// Get the connection string from Supabase → Project Settings → Database →
// Connection string → "URI" (it includes the password). Use the *session*
// pooler / direct connection for DDL. Add it to .env.local as:
//   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.<ref>.supabase.co:5432/postgres
// The migrations are idempotent, so re-running is safe.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!url) {
  console.error(
    "✗ No DATABASE_URL. Add the Supabase Postgres connection URI to .env.local as DATABASE_URL\n" +
      "  (Supabase → Project Settings → Database → Connection string → URI)."
  );
  process.exit(1);
}

const dir = "supabase/migrations";
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({
  connectionString: url,
  // Supabase requires TLS; the cert chain is trusted but be lenient for poolers.
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  for (const f of files) {
    process.stdout.write(`→ ${f} ... `);
    await client.query(readFileSync(join(dir, f), "utf8"));
    console.log("ok");
  }
  console.log(`✓ ${files.length} migration(s) applied.`);
} catch (e) {
  console.error("✗ Migration failed:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
