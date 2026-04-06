"use client";

import { createBrowserClient } from "@supabase/ssr";

import { appEnv, isSupabaseAuthEnabled } from "@/lib/supabase/config";

export function createBrowserSupabaseClient() {
  if (!isSupabaseAuthEnabled) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createBrowserClient(appEnv.supabaseUrl!, appEnv.supabaseAnonKey!);
}
