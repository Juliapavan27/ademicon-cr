import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@ademicon/database-types";

/**
 * service_role client — bypasses RLS entirely. Import only from server-only
 * code (Route Handlers, Server Actions). The `server-only` import makes any
 * accidental client-bundle inclusion a build error instead of a leaked secret.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
