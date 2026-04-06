import { cookies } from "next/headers";

const CLIENT_SESSION_COOKIE = "pure_physique_client_access";
const CLIENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function buildCookieOptions(maxAge = CLIENT_SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function getClientSessionInviteToken() {
  const cookieStore = await cookies();
  const inviteToken = cookieStore.get(CLIENT_SESSION_COOKIE)?.value?.trim();
  return inviteToken || null;
}

export async function setClientSessionInviteToken(inviteToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(CLIENT_SESSION_COOKIE, inviteToken, buildCookieOptions());
}

export async function clearClientSessionInviteToken() {
  const cookieStore = await cookies();
  cookieStore.set(CLIENT_SESSION_COOKIE, "", buildCookieOptions(0));
}
