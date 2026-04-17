export const appEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  storageBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "progress-photos",
  cronSecret: process.env.CRON_SECRET,
  enableTestQuickLogin: process.env.ENABLE_TEST_QUICK_LOGIN,
  testCoachEmail: process.env.TEST_COACH_EMAIL,
  testCoachPassword: process.env.TEST_COACH_PASSWORD,
  testClientEmail: process.env.TEST_CLIENT_EMAIL,
  testClientPassword: process.env.TEST_CLIENT_PASSWORD,
};

export const isSupabaseAuthEnabled = Boolean(
  appEnv.supabaseUrl && appEnv.supabaseAnonKey,
);

export const isSupabaseAdminEnabled = Boolean(
  appEnv.supabaseUrl && appEnv.supabaseServiceRoleKey,
);

export const isLiveAppEnabled = Boolean(
  isSupabaseAuthEnabled && isSupabaseAdminEnabled,
);

export const isTestQuickLoginEnabled = Boolean(
  isLiveAppEnabled &&
    appEnv.enableTestQuickLogin?.toLowerCase() === "true" &&
    appEnv.testCoachEmail &&
    appEnv.testCoachPassword &&
    appEnv.testClientEmail &&
    appEnv.testClientPassword,
);

export const supabaseCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 400 * 24 * 60 * 60,
};
