import { NextResponse } from "next/server";

import { setClientSessionInviteToken } from "@/lib/client-session";
import { demoClientCredentials } from "@/lib/demo/credentials";

export async function GET(request: Request) {
  await setClientSessionInviteToken(demoClientCredentials.inviteToken);

  return NextResponse.redirect(new URL("/client", request.url));
}
