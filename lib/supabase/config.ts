export const appEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM ?? "Pure Physique <noreply@example.com>",
  storageBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "progress-photos",
  cronSecret: process.env.CRON_SECRET,
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

export const isEmailEnabled = Boolean(appEnv.resendApiKey);
