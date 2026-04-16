import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { appEnv, isSupabaseAuthEnabled, supabaseCookieOptions } from "@/lib/supabase/config";

type SupabaseCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function createServerSupabaseClient() {
  if (!isSupabaseAuthEnabled) {
    throw new Error("Supabase environment variables are missing.");
  }

  const cookieStore = await cookies();

  return createServerClient(appEnv.supabaseUrl!, appEnv.supabaseAnonKey!, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore write attempts from read-only server component contexts.
        }
      },
    },
  });
}
