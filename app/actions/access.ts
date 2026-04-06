"use server";

import { createHash } from "crypto";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getClientInviteSummary } from "@/lib/database/queries";
import {
  clearClientSessionInviteToken,
  setClientSessionInviteToken,
} from "@/lib/client-session";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import { clientInviteAccessSchema } from "@/lib/validation/forms";

export async function openClientAccessAction(formData: FormData) {
  const values = clientInviteAccessSchema.parse(Object.fromEntries(formData.entries()));

  if (!isLiveAppEnabled) {
    redirect("/client");
  }

  const client = await getClientInviteSummary(values.inviteToken);

  if (!client || client.activeStatus !== "active") {
    redirect(`/access/${values.inviteToken}?error=invalid-invite`);
  }

  const admin = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const updateClientResult = await admin
    .from("clients")
    .update({
      last_accessed_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", client.id);

  if (updateClientResult.error) {
    throw new Error(`Failed to update client access time: ${updateClientResult.error.message}`);
  }

  const accessTokenHash = createHash("sha256")
    .update(values.inviteToken)
    .digest("hex");
  const markUsedResult = await admin
    .from("client_access_tokens")
    .update({
      used_at: nowIso,
    })
    .eq("client_id", client.id)
    .eq("token_hash", accessTokenHash)
    .is("used_at", null);

  if (markUsedResult.error) {
    throw new Error(`Failed to mark invite token as used: ${markUsedResult.error.message}`);
  }

  await setClientSessionInviteToken(values.inviteToken);
  redirect("/client");
}

export async function clearClientAccessAction() {
  await clearClientSessionInviteToken();

  redirect("/");
}
