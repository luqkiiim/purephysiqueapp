"use server";

import { createHash, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCoach } from "@/lib/auth";
import { getClientBundleByCoachAndId } from "@/lib/database/queries";
import { sendInviteEmail } from "@/lib/email/service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { appEnv, isLiveAppEnabled } from "@/lib/supabase/config";
import {
  clientProfileSchema,
  coachNoteSchema,
  feedbackMessageSchema,
} from "@/lib/validation/forms";
import { createInviteLink } from "@/lib/utils";

async function logNotification(
  clientId: string,
  notificationType: string,
  metadata: Record<string, unknown>,
) {
  const admin = createSupabaseAdminClient();
  const result = await admin.from("notification_logs").insert({
    id: randomUUID(),
    client_id: clientId,
    notification_type: notificationType,
    delivery_status: "queued",
    metadata,
    sent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  if (result.error) {
    throw new Error(`Failed to log notification: ${result.error.message}`);
  }
}

async function sendClientInvite(clientId: string, inviteToken: string) {
  if (!isLiveAppEnabled) {
    return;
  }

  const { coach } = await requireCoach();
  const client = await getClientBundleByCoachAndId(coach.id, clientId);

  if (!client) {
    return;
  }

  const inviteLink = createInviteLink(appEnv.appUrl, inviteToken);
  await sendInviteEmail({
    clientName: client.fullName,
    coachName: coach.fullName,
    to: client.email,
    inviteLink,
  });

  const admin = createSupabaseAdminClient();
  const accessTokenResult = await admin.from("client_access_tokens").insert({
    id: randomUUID(),
    client_id: clientId,
    token_hash: createHash("sha256").update(inviteToken).digest("hex"),
    expires_at: null,
    used_at: null,
    created_at: new Date().toISOString(),
  });

  if (accessTokenResult.error) {
    throw new Error(`Failed to store invite token log: ${accessTokenResult.error.message}`);
  }

  await logNotification(clientId, "invite_email", {
    inviteLink,
  });
}

export async function saveClientAction(formData: FormData) {
  const rawValues = Object.fromEntries(formData.entries());
  const values = clientProfileSchema.parse(rawValues);

  if (!isLiveAppEnabled) {
    redirect(values.clientId ? `/coach/clients/${values.clientId}` : "/coach/clients");
  }

  const { coach } = await requireCoach();
  const admin = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const inviteToken = randomUUID().replaceAll("-", "");

  let clientId = values.clientId || "";
  let effectiveInviteToken = inviteToken;

  if (clientId) {
    const existing = await getClientBundleByCoachAndId(coach.id, clientId);

    if (!existing) {
      redirect("/coach/clients?error=missing-client");
    }

    effectiveInviteToken = existing.inviteToken;

    const [clientUpdateResult, profileUpdateResult, targetsUpdateResult, reminderUpdateResult] =
      await Promise.all([
        admin
          .from("clients")
          .update({
            full_name: values.fullName,
            email: values.email,
            updated_at: nowIso,
          })
          .eq("id", clientId)
          .eq("coach_id", coach.id),
        admin
          .from("client_profiles")
          .update({
            goal_summary: values.goalSummary,
            training_phase: values.trainingPhase,
            timezone: values.timezone,
            welcome_message: values.welcomeMessage,
            updated_at: nowIso,
          })
          .eq("client_id", clientId),
        admin
          .from("client_targets")
          .update({
            protein_target_grams: values.proteinTargetGrams,
            step_target: values.stepTarget,
            exercise_expectation: values.exerciseExpectation,
            probiotics_enabled: values.probioticsEnabled,
            fish_oil_enabled: values.fishOilEnabled,
            updated_at: nowIso,
          })
          .eq("client_id", clientId),
        admin
          .from("reminder_settings")
          .update({
            email_reminders_enabled: values.emailRemindersEnabled,
            missed_day_nudges_enabled: values.missedDayNudgesEnabled,
            reminder_time: `${values.reminderTime}:00`,
            weekly_summary_enabled: values.weeklySummaryEnabled,
            timezone: values.timezone,
            updated_at: nowIso,
          })
          .eq("client_id", clientId),
      ]);

    if (clientUpdateResult.error) {
      throw new Error(`Failed to update client: ${clientUpdateResult.error.message}`);
    }

    if (profileUpdateResult.error) {
      throw new Error(`Failed to update client profile: ${profileUpdateResult.error.message}`);
    }

    if (targetsUpdateResult.error) {
      throw new Error(`Failed to update client targets: ${targetsUpdateResult.error.message}`);
    }

    if (reminderUpdateResult.error) {
      throw new Error(`Failed to update reminder settings: ${reminderUpdateResult.error.message}`);
    }
  } else {
    clientId = randomUUID();

    const [clientInsertResult, profileInsertResult, targetsInsertResult, reminderInsertResult] =
      await Promise.all([
        admin.from("clients").insert({
          id: clientId,
          coach_id: coach.id,
          full_name: values.fullName,
          email: values.email,
          invite_token: inviteToken,
          active_status: "active",
          current_streak: 0,
          last_check_in_date: null,
          last_accessed_at: null,
          created_at: nowIso,
          updated_at: nowIso,
        }),
        admin.from("client_profiles").insert({
          id: randomUUID(),
          client_id: clientId,
          goal_summary: values.goalSummary,
          training_phase: values.trainingPhase,
          timezone: values.timezone,
          coaching_start_date: new Date().toISOString().slice(0, 10),
          welcome_message: values.welcomeMessage,
          created_at: nowIso,
          updated_at: nowIso,
        }),
        admin.from("client_targets").insert({
          id: randomUUID(),
          client_id: clientId,
          protein_target_grams: values.proteinTargetGrams,
          step_target: values.stepTarget,
          exercise_expectation: values.exerciseExpectation,
          probiotics_enabled: values.probioticsEnabled,
          fish_oil_enabled: values.fishOilEnabled,
          created_at: nowIso,
          updated_at: nowIso,
        }),
        admin.from("reminder_settings").insert({
          id: randomUUID(),
          client_id: clientId,
          email_reminders_enabled: values.emailRemindersEnabled,
          missed_day_nudges_enabled: values.missedDayNudgesEnabled,
          reminder_time: `${values.reminderTime}:00`,
          weekly_summary_enabled: values.weeklySummaryEnabled,
          timezone: values.timezone,
          created_at: nowIso,
          updated_at: nowIso,
        }),
      ]);

    if (clientInsertResult.error) {
      throw new Error(`Failed to create client: ${clientInsertResult.error.message}`);
    }

    if (profileInsertResult.error) {
      throw new Error(`Failed to create client profile: ${profileInsertResult.error.message}`);
    }

    if (targetsInsertResult.error) {
      throw new Error(`Failed to create client targets: ${targetsInsertResult.error.message}`);
    }

    if (reminderInsertResult.error) {
      throw new Error(`Failed to create reminder settings: ${reminderInsertResult.error.message}`);
    }
  }

  if (values.sendInvite) {
    await sendClientInvite(clientId, effectiveInviteToken);
  }

  revalidatePath("/coach");
  revalidatePath("/coach/clients");
  revalidatePath(`/coach/clients/${clientId}`);
  redirect(`/coach/clients/${clientId}`);
}

export async function saveCoachNoteAction(formData: FormData) {
  const values = coachNoteSchema.parse(Object.fromEntries(formData.entries()));

  if (!isLiveAppEnabled) {
    redirect(`/coach/clients/${values.clientId}`);
  }

  const { coach } = await requireCoach();
  const admin = createSupabaseAdminClient();
  const result = await admin.from("coach_notes").insert({
    id: randomUUID(),
    client_id: values.clientId,
    coach_id: coach.id,
    note: values.note,
    visibility: values.visibility,
    created_at: new Date().toISOString(),
  });

  if (result.error) {
    throw new Error(`Failed to save coach note: ${result.error.message}`);
  }

  revalidatePath(`/coach/clients/${values.clientId}`);
}

export async function saveFeedbackMessageAction(formData: FormData) {
  const values = feedbackMessageSchema.parse(Object.fromEntries(formData.entries()));

  if (!isLiveAppEnabled) {
    redirect(`/coach/clients/${values.clientId}`);
  }

  const { coach } = await requireCoach();
  const admin = createSupabaseAdminClient();
  const result = await admin.from("client_feedback_messages").insert({
    id: randomUUID(),
    client_id: values.clientId,
    coach_id: coach.id,
    message: values.message,
    created_at: new Date().toISOString(),
    read_at: null,
  });

  if (result.error) {
    throw new Error(`Failed to save feedback message: ${result.error.message}`);
  }

  await logNotification(values.clientId, "coach_feedback", {
    length: values.message.length,
  });

  revalidatePath(`/coach/clients/${values.clientId}`);
}

export async function resendInviteAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");

  if (!isLiveAppEnabled) {
    redirect(`/coach/clients/${clientId}`);
  }

  const { coach } = await requireCoach();
  const client = await getClientBundleByCoachAndId(coach.id, clientId);

  if (client?.inviteToken) {
    await sendClientInvite(clientId, client.inviteToken);
  }

  revalidatePath(`/coach/clients/${clientId}`);
}
