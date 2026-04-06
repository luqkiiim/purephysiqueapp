import { createClient } from "@supabase/supabase-js";

import { appEnv, isSupabaseAdminEnabled } from "@/lib/supabase/config";

export function createSupabaseAdminClient() {
  if (!isSupabaseAdminEnabled) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  return createClient(appEnv.supabaseUrl!, appEnv.supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
