"use server";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import {
  getClientAccessValidationById,
  getCoachByAuthUserId,
  getCoachByEmail,
  linkCoachAuthIdentityByEmail,
  syncClientAuthIdentity,
} from "@/lib/database/queries";
import { demoCoachCredentials } from "@/lib/demo/credentials";
import { appEnv, isLiveAppEnabled, isTestQuickLoginEnabled } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { coachLoginSchema } from "@/lib/validation/forms";

function redirectToLogin(error: string): never {
  redirect(`/?error=${encodeURIComponent(error)}`);
}

async function completeAppLogin(
  normalizedEmail: string,
  signedInUser: User,
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
) {
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
    const client = await getClientAccessValidationById(clientId);

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

async function signInAndRoute(
  email: string,
  password: string,
  errorOnFailure = "invalid-login",
) {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = await createServerSupabaseClient();
  const signInResult = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (signInResult.error || !signInResult.data.user) {
    redirectToLogin(errorOnFailure);
  }

  await completeAppLogin(normalizedEmail, signInResult.data.user, supabase);
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

  await signInAndRoute(values.data.email, values.data.password);
}

export async function loginCoachAction(formData: FormData) {
  await loginAppAction(formData);
}

export async function quickLoginCoachAction() {
  if (!isTestQuickLoginEnabled) {
    redirectToLogin("quick-login-disabled");
  }

  await signInAndRoute(
    appEnv.testCoachEmail!,
    appEnv.testCoachPassword!,
    "quick-login-unavailable",
  );
}

export async function quickLoginClientAction() {
  if (!isTestQuickLoginEnabled) {
    redirectToLogin("quick-login-disabled");
  }

  await signInAndRoute(
    appEnv.testClientEmail!,
    appEnv.testClientPassword!,
    "quick-login-unavailable",
  );
}

export async function logoutAction() {
  if (isLiveAppEnabled) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
