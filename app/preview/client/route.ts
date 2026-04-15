import { NextResponse } from "next/server";

import { isLiveAppEnabled } from "@/lib/supabase/config";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL(isLiveAppEnabled ? "/access" : "/client", request.url));
}
