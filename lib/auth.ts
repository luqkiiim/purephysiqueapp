import { redirect } from "next/navigation";

import {
  getClientBundleById,
  getCoachByAuthUserId,
  getCoachByEmail,
  linkCoachAuthIdentityByEmail,
} from "@/lib/database/queries";
import { demoClients, demoCoachProfile } from "@/lib/demo/data";
import type { Client, CoachProfile } from "@/lib/types/app";
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

export async function requireCoach(): Promise<CoachSession> {
  if (!isLiveAppEnabled) {
    return {
      coach: demoCoachProfile,
      isDemo: true,
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/coach/login");
  }

  let coach = await getCoachByAuthUserId(user.id);

  if (!coach && user.email) {
    await linkCoachAuthIdentityByEmail(user.id, user.email);
    coach = await getCoachByEmail(user.email);
  }

  if (!coach) {
    redirect("/coach/login?error=missing-profile");
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

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/access");
  }

  const clientId =
    typeof user.app_metadata?.client_id === "string" ? user.app_metadata.client_id : null;

  if (!clientId) {
    redirect("/access?mode=login&error=client-session-required");
  }

  const client = await getClientBundleById(clientId);

  if (!client || client.activeStatus !== "active") {
    redirect("/access?mode=login&error=invalid-client-session");
  }

  return {
    client,
    isDemo: false,
  };
}
