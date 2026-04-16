"use server";

import { redirect } from "next/navigation";

import {
  getClientBundleById,
  getCoachByAuthUserId,
  getCoachByEmail,
  linkCoachAuthIdentityByEmail,
  syncClientAuthIdentity,
} from "@/lib/database/queries";
import { demoCoachCredentials } from "@/lib/demo/credentials";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import { coachLoginSchema } from "@/lib/validation/forms";

function redirectToLogin(error: string): never {
  redirect(`/?error=${encodeURIComponent(error)}`);
}

export async function loginAppAction(formData: FormData) {
  const rawValues = Object.fromEntries(formData.entries());

  if (!isLiveAppEnabled) {
    const values = coachLoginSchema.safeParse(rawValues);

    if (
      !values.success ||
      values.data.email.toLowerCase() !== demoCoachCredentials.email.toLowerCase() ||
      values.data.password !== demoCoachCredentials.password
    ) {
      redirectToLogin("demo-login-only");
    }

    redirect("/coach");
  }

  const values = coachLoginSchema.safeParse(rawValues);

  if (!values.success) {
    redirectToLogin("invalid-login");
  }

  const normalizedEmail = values.data.email.trim().toLowerCase();
  const supabase = await createServerSupabaseClient();
  const signInResult = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: values.data.password,
  });

  if (signInResult.error || !signInResult.data.user) {
    redirectToLogin("invalid-login");
  }

  const signedInUser = signInResult.data.user;
  let coach = await getCoachByAuthUserId(signedInUser.id);

  if (!coach && signedInUser.email) {
    await linkCoachAuthIdentityByEmail(signedInUser.id, signedInUser.email);
    coach = await getCoachByEmail(signedInUser.email);
  }

  if (coach) {
    redirect("/coach");
  }

  const clientId =
    typeof signedInUser.app_metadata?.client_id === "string"
      ? signedInUser.app_metadata.client_id
      : null;

  if (signedInUser.app_metadata?.role === "client" && clientId) {
    const client = await getClientBundleById(clientId);

    if (!client || client.activeStatus !== "active") {
      await supabase.auth.signOut();
      redirectToLogin("inactive-client-account");
    }

    if (client.authUserId && client.authUserId !== signedInUser.id) {
      await supabase.auth.signOut();
      redirectToLogin("invalid-login");
    }

    await syncClientAuthIdentity(client.id, signedInUser.id, normalizedEmail, new Date().toISOString());
    redirect("/client");
  }

  await supabase.auth.signOut();
  redirectToLogin("no-app-access");
}

export async function loginCoachAction(formData: FormData) {
  await loginAppAction(formData);
}

export async function logoutAction() {
  if (isLiveAppEnabled) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
