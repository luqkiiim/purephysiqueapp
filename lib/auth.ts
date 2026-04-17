import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import {
  getClientAccessValidationById,
  getClientBundleById,
  getCoachByAuthUserId,
  getCoachByEmail,
  linkCoachAuthIdentityByEmail,
} from "@/lib/database/queries";
import { demoClients, demoCoachProfile } from "@/lib/demo/data";
import type { Client, CoachProfile } from "@/lib/types/app";
import { hasSupabaseAuthCookies } from "@/lib/supabase/auth-cookies";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface CoachSession {
  coach: CoachProfile;
  isDemo: boolean;
}

interface ClientSession {
  client: Client;
  isDemo: boolean;
}

async function resolveAuthenticatedAppPathForUser(user: User) {
  let coach = await getCoachByAuthUserId(user.id);

  if (!coach && user.email) {
    await linkCoachAuthIdentityByEmail(user.id, user.email);
    coach = await getCoachByEmail(user.email);
  }

  if (coach) {
    return "/coach";
  }

  const clientId =
    typeof user.app_metadata?.client_id === "string" ? user.app_metadata.client_id : null;

  if (!clientId || user.app_metadata?.role !== "client") {
    return null;
  }

  const client = await getClientAccessValidationById(clientId);

  if (!client || client.activeStatus !== "active") {
    return null;
  }

  if (client.authUserId && client.authUserId !== user.id) {
    return null;
  }

  return "/client";
}

const getAuthenticatedSupabaseUser = cache(async () => {
  if (!isLiveAppEnabled) {
    return null;
  }

  const cookieStore = await cookies();

  if (!hasSupabaseAuthCookies(cookieStore)) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export async function getAuthenticatedAppPath() {
  const user = await getAuthenticatedSupabaseUser();

  if (!user) {
    return null;
  }

  return resolveAuthenticatedAppPathForUser(user);
}

export async function requireCoach(): Promise<CoachSession> {
  if (!isLiveAppEnabled) {
    return {
      coach: demoCoachProfile,
      isDemo: true,
    };
  }

  const user = await getAuthenticatedSupabaseUser();

  if (!user) {
    redirect("/");
  }

  let coach = await getCoachByAuthUserId(user.id);

  if (!coach && user.email) {
    await linkCoachAuthIdentityByEmail(user.id, user.email);
    coach = await getCoachByEmail(user.email);
  }

  if (!coach) {
    redirect("/?error=missing-profile");
  }

  return {
    coach,
    isDemo: false,
  };
}

export async function requireClient(): Promise<ClientSession> {
  if (!isLiveAppEnabled) {
    return {
      client: demoClients[0],
      isDemo: true,
    };
  }

  const user = await getAuthenticatedSupabaseUser();

  if (!user) {
    redirect("/");
  }

  const clientId =
    typeof user.app_metadata?.client_id === "string" ? user.app_metadata.client_id : null;

  if (!clientId) {
    redirect("/?error=client-session-required");
  }

  const client = await getClientBundleById(clientId);

  if (!client || client.activeStatus !== "active") {
    redirect("/?error=invalid-client-session");
  }

  if (client.authUserId && client.authUserId !== user.id) {
    redirect("/?error=invalid-client-session");
  }

  return {
    client,
    isDemo: false,
  };
}
