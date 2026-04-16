"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hashAccessCode, formatAccessCode, normalizeAccessCode, rotateClientAccessCode } from "@/lib/access-codes";
import {
  getClientAccessCodeSummary,
  syncClientAuthIdentity,
} from "@/lib/database/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { clientAccessClaimSchema } from "@/lib/validation/forms";

function buildAccessRedirect(
  mode: "claim" | "login",
  options?: {
    accessCode?: string;
    error?: string;
  },
) {
  const searchParams = new URLSearchParams();

  if (mode !== "claim") {
    searchParams.set("mode", mode);
  }

  if (options?.accessCode) {
    searchParams.set("code", formatAccessCode(options.accessCode));
  }

  if (options?.error) {
    searchParams.set("error", options.error);
  }

  const queryString = searchParams.toString();
  return queryString ? `/access?${queryString}` : "/access";
}

function redirectToAccess(mode: "claim" | "login", options?: {
  accessCode?: string;
  error?: string;
}): never {
  redirect(buildAccessRedirect(mode, options) as Parameters<typeof redirect>[0]);
}

export async function claimClientAccessAction(formData: FormData) {
  if (!isLiveAppEnabled) {
    redirect("/client");
  }

  const parsedValues = clientAccessClaimSchema.safeParse(Object.fromEntries(formData.entries()));
  const normalizedAccessCode = normalizeAccessCode(
    String(formData.get("accessCode") ?? ""),
  );
  const redirectToClaim = (error: string) =>
    redirectToAccess("claim", {
      accessCode: normalizedAccessCode,
      error,
    });

  if (!parsedValues.success) {
    redirectToClaim("invalid-claim-input");
  }

  const values = parsedValues.data!;
  const normalizedEmail = values.email.trim().toLowerCase();

  const client = await getClientAccessCodeSummary(normalizedAccessCode);

  if (!client || client.activeStatus !== "active") {
    redirectToClaim("invalid-access-code");
  }

  const activeClient = client!;

  const admin = createSupabaseAdminClient();
  const supabase = await createServerSupabaseClient();
  const nowIso = new Date().toISOString();
  const accessCodeHash = hashAccessCode(normalizedAccessCode);
  const tokenResult = await admin
    .from("client_access_tokens")
    .select("id, used_at, expires_at")
    .eq("client_id", activeClient.id)
    .eq("token_hash", accessCodeHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tokenResult.error) {
    throw new Error(`Failed to load client access code state: ${tokenResult.error.message}`);
  }

  if (tokenResult.data?.used_at) {
    redirectToClaim("used-access-code");
  }

  if (tokenResult.data?.expires_at && tokenResult.data.expires_at < nowIso) {
    redirectToClaim("expired-access-code");
  }

  const createUserResult = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password: values.password,
    email_confirm: true,
    app_metadata: {
      role: "client",
      client_id: activeClient.id,
    },
    user_metadata: {
      full_name: activeClient.fullName,
    },
  });

  if (createUserResult.error) {
    const signInResult = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: values.password,
    });

    if (signInResult.error || !signInResult.data.user) {
      redirectToClaim("email-already-in-use");
    }

    const signedInUser = signInResult.data.user!;
    const signedInClientId =
      typeof signedInUser.app_metadata?.client_id === "string"
        ? signedInUser.app_metadata.client_id
        : null;

    if (signedInUser.app_metadata?.role !== "client" || signedInClientId !== activeClient.id) {
      await supabase.auth.signOut();
      redirectToClaim("email-already-in-use");
    }

    await syncClientAuthIdentity(activeClient.id, signedInUser.id, normalizedEmail, nowIso);
  } else {
    const signInResult = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: values.password,
    });

    if (signInResult.error || !signInResult.data.user) {
      throw new Error(`Failed to sign in claimed client account: ${signInResult.error?.message ?? "Unknown error"}`);
    }

    await syncClientAuthIdentity(
      activeClient.id,
      signInResult.data.user.id,
      normalizedEmail,
      nowIso,
    );
  }

  await rotateClientAccessCode(admin, activeClient.id, nowIso);

  revalidatePath("/coach");
  revalidatePath("/coach/clients");
  revalidatePath(`/coach/clients/${activeClient.id}`);
  redirect("/client");
}

export async function clearClientAccessAction() {
  if (isLiveAppEnabled) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
