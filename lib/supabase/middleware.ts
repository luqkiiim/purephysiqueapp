import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { appEnv, isSupabaseAuthEnabled } from "@/lib/supabase/config";

type SupabaseCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function updateSession(request: NextRequest) {
  if (!isSupabaseAuthEnabled) {
    return NextResponse.next({
      request,
    });
  }

  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(appEnv.supabaseUrl!, appEnv.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}
