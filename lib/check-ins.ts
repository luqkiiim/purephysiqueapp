import { randomUUID } from "crypto";

import { differenceInCalendarDays, parseISO } from "date-fns";
import type { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { appEnv, isSupabaseAdminEnabled } from "@/lib/supabase/config";
import type { Client } from "@/lib/types/app";
import {
  calculateCompletionPercentage,
  formatExerciseSummary,
  getExerciseTotalDuration,
  serializeExerciseEntries,
} from "@/lib/utils";
import { dailyCheckInSchema } from "@/lib/validation/forms";

type DailyCheckInValues = z.infer<typeof dailyCheckInSchema>;

interface ExistingCheckInRow {
  id: string;
  created_at: string;
}

interface CheckInDateRow {
  date: string;
}

function throwIfError(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

async function syncClientCheckInStats(clientId: string, updatedAtIso: string) {
  const admin = createSupabaseAdminClient();
  const checkInsResult = await admin
    .from("daily_check_ins")
    .select("date")
    .eq("client_id", clientId)
    .order("date", { ascending: false });

  throwIfError(checkInsResult.error, "Failed to refresh client check-in summary");

  const checkInDates = (checkInsResult.data ?? []) as CheckInDateRow[];
  const lastCheckInDate = checkInDates[0]?.date ?? null;
  let currentStreak = 0;

  if (lastCheckInDate) {
    currentStreak = 1;

    for (let index = 1; index < checkInDates.length; index += 1) {
      const previousDate = parseISO(checkInDates[index - 1]!.date);
      const currentDate = parseISO(checkInDates[index]!.date);

      if (differenceInCalendarDays(previousDate, currentDate) !== 1) {
        break;
      }

      currentStreak += 1;
    }
  }

  const updateClientResult = await admin
    .from("clients")
    .update({
      current_streak: currentStreak,
      last_check_in_date: lastCheckInDate,
      updated_at: updatedAtIso,
    })
    .eq("id", clientId);

  throwIfError(updateClientResult.error, "Failed to update client check-in summary");
}

export async function saveDailyCheckInForClient({
  client,
  date,
  values,
  progressPhoto,
}: {
  client: Client;
  date: string;
  values: DailyCheckInValues;
  progressPhoto?: File | null;
}) {
  const admin = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const exerciseSummary = formatExerciseSummary(values.exerciseEntries);
  const totalExerciseDuration = getExerciseTotalDuration(values.exerciseEntries);
  const serializedExerciseEntries = serializeExerciseEntries(values.exerciseEntries);
  const completionPercentage = calculateCompletionPercentage([
    values.bedtime,
    values.wakeTime,
    values.totalSleepHours,
    values.proteinGrams,
    values.steps,
    values.hydrationLiters,
    exerciseSummary,
    totalExerciseDuration,
    values.probioticsChecked || !client.targets.probioticsEnabled,
    values.fishOilChecked || !client.targets.fishOilEnabled,
    values.bodyWeight,
  ]);
  const existingCheckInResult = await admin
    .from("daily_check_ins")
    .select("id, created_at")
    .eq("client_id", client.id)
    .eq("date", date)
    .maybeSingle();

  throwIfError(existingCheckInResult.error, "Failed to load existing daily check-in");

  const existingCheckIn = (existingCheckInResult.data as ExistingCheckInRow | null) ?? null;
  const checkInId = existingCheckIn?.id ?? randomUUID();
  const createdAt = existingCheckIn?.created_at ?? nowIso;
  const upsertCheckInResult = await admin
    .from("daily_check_ins")
    .upsert(
      {
        id: checkInId,
        client_id: client.id,
        date,
        bedtime: `${values.bedtime}:00`,
        wake_time: `${values.wakeTime}:00`,
        total_sleep_hours: values.totalSleepHours,
        protein_grams: values.proteinGrams,
        protein_target_snapshot: client.targets.proteinTargetGrams,
        steps: values.steps,
        step_target_snapshot: client.targets.stepTarget,
        hydration_liters: values.hydrationLiters,
        exercise_type: serializedExerciseEntries,
        exercise_duration_minutes: totalExerciseDuration,
        probiotics_checked: values.probioticsChecked,
        fish_oil_checked: values.fishOilChecked,
        body_weight: values.bodyWeight,
        meal_notes: values.mealNotes || null,
        completion_percentage: completionPercentage,
        submitted_at: nowIso,
        created_at: createdAt,
        updated_at: nowIso,
      },
      {
        onConflict: "client_id,date",
      },
    )
    .select("id")
    .single();

  throwIfError(upsertCheckInResult.error, "Failed to save daily check-in");

  const savedCheckInId = upsertCheckInResult.data?.id ?? checkInId;

  if (
    progressPhoto instanceof File &&
    progressPhoto.size > 0 &&
    isSupabaseAdminEnabled
  ) {
    const extension = progressPhoto.type.split("/").at(-1) ?? "jpg";
    const storagePath = `${client.id}/${date}/${randomUUID()}.${extension}`;
    const uploadBuffer = Buffer.from(await progressPhoto.arrayBuffer());
    const uploadResult = await admin.storage
      .from(appEnv.storageBucket)
      .upload(storagePath, uploadBuffer, {
        cacheControl: "3600",
        contentType: progressPhoto.type,
        upsert: false,
      });

    if (!uploadResult.error) {
      const insertPhotoResult = await admin.from("progress_photos").insert({
        id: randomUUID(),
        client_id: client.id,
        daily_check_in_id: savedCheckInId,
        date,
        storage_path: storagePath,
        image_url: null,
        note: values.mealNotes || null,
        created_at: nowIso,
        updated_at: nowIso,
      });

      throwIfError(insertPhotoResult.error, "Failed to save progress photo metadata");
    }
  }

  await syncClientCheckInStats(client.id, nowIso);

  return {
    checkInId: savedCheckInId,
    savedDate: date,
  };
}
