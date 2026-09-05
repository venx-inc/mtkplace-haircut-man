import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente com a service role key: ignora RLS e enxerga auth.users.
 * Só pode ser importado em código server-only (Server Actions/Route Handlers)
 * — nunca em um Client Component, a chave nunca deve chegar ao browser.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
