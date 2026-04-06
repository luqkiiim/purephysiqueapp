"use server";

import { randomUUID } from "crypto";
import { subDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireClient } from "@/lib/auth";
import { appEnv, isSupabaseAdminEnabled, isLiveAppEnabled } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { dailyCheckInSchema } from "@/lib/validation/forms";
import {
  calculateCompletionPercentage,
  formatExerciseSummary,
  getExerciseTotalDuration,
  getTodayIsoDate,
  serializeExerciseEntries,
} from "@/lib/utils";

export async function saveDailyCheckInAction(formData: FormData) {
  const exerciseTypes = formData.getAll("exerciseType");
  const exerciseDurations = formData.getAll("exerciseDurationMinutes");
  const values = dailyCheckInSchema.parse({
    ...Object.fromEntries(formData.entries()),
    exerciseEntries: exerciseTypes.map((type, index) => ({
      type: String(type),
      durationMinutes: exerciseDurations[index] ?? 0,
    })),
  });

  if (!isLiveAppEnabled) {
    redirect("/client?submitted=1");
  }

  const { client } = await requireClient();
  const today = getTodayIsoDate();
  const yesterday = subDays(new Date(), 1).toISOString().slice(0, 10);
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
  const admin = createSupabaseAdminClient();

  const upsertCheckInResult = await admin.from("daily_check_ins").upsert(
    {
      id: randomUUID(),
      client_id: client.id,
      date: today,
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
      created_at: nowIso,
      updated_at: nowIso,
    },
    {
      onConflict: "client_id,date",
    },
  );

  if (upsertCheckInResult.error) {
    throw new Error(`Failed to save daily check-in: ${upsertCheckInResult.error.message}`);
  }

  const nextStreak =
    client.lastCheckInDate === today
      ? Math.max(client.currentStreak, 1)
      : client.lastCheckInDate === yesterday
        ? client.currentStreak + 1
        : 1;

  const updateClientResult = await admin
    .from("clients")
    .update({
      current_streak: nextStreak,
      last_check_in_date: today,
      updated_at: nowIso,
    })
    .eq("id", client.id);

  if (updateClientResult.error) {
    throw new Error(`Failed to update client streak: ${updateClientResult.error.message}`);
  }

  const progressPhoto = formData.get("progressPhoto");

  if (
    progressPhoto instanceof File &&
    progressPhoto.size > 0 &&
    isSupabaseAdminEnabled
  ) {
    const extension = progressPhoto.type.split("/").at(-1) ?? "jpg";
    const storagePath = `${client.id}/${today}/${randomUUID()}.${extension}`;
    const uploadBuffer = Buffer.from(await progressPhoto.arrayBuffer());

    const { error } = await admin.storage
      .from(appEnv.storageBucket)
      .upload(storagePath, uploadBuffer, {
        cacheControl: "3600",
        contentType: progressPhoto.type,
        upsert: false,
      });

    if (!error) {
      const insertPhotoResult = await admin.from("progress_photos").insert({
        id: randomUUID(),
        client_id: client.id,
        daily_check_in_id: null,
        date: today,
        storage_path: storagePath,
        image_url: null,
        note: values.mealNotes || null,
        created_at: nowIso,
        updated_at: nowIso,
      });

      if (insertPhotoResult.error) {
        throw new Error(`Failed to save progress photo metadata: ${insertPhotoResult.error.message}`);
      }
    }
  }

  revalidatePath("/client");
  revalidatePath("/client/history");
  revalidatePath("/client/weekly");
  revalidatePath("/client/photos");
  redirect("/client?submitted=1");
}
