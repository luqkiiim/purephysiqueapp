"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireClient } from "@/lib/auth";
import { saveDailyCheckInForClient } from "@/lib/check-ins";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import { dailyCheckInSchema } from "@/lib/validation/forms";
import { getTodayIsoDate } from "@/lib/utils";

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
  const progressPhoto = formData.get("progressPhoto");

  await saveDailyCheckInForClient({
    client,
    date: today,
    values,
    progressPhoto: progressPhoto instanceof File ? progressPhoto : null,
  });

  revalidatePath("/client");
  revalidatePath("/client/history");
  revalidatePath("/client/weekly");
  revalidatePath("/client/photos");
  redirect("/client?submitted=1");
}
