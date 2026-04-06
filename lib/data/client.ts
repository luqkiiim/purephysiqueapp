import { requireClient } from "@/lib/auth";
import {
  listCoachNotesForClient,
  listDailyCheckInsForClient,
  listFeedbackMessagesForClient,
  listProgressPhotosForClient,
} from "@/lib/database/queries";
import { getDemoClientHomeData } from "@/lib/demo/data";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import { buildWeeklySummary, getTodaysOrLatestCheckIn, resolveProgressPhotoUrls } from "@/lib/data/shared";

export async function getClientHomeData() {
  const { client, isDemo } = await requireClient();

  if (!isLiveAppEnabled || isDemo) {
    return getDemoClientHomeData(client.id);
  }

  const [recentCheckIns, rawProgressPhotos, feedbackMessages, sharedCoachNotes] =
    await Promise.all([
      listDailyCheckInsForClient(client.id),
      listProgressPhotosForClient(client.id),
      listFeedbackMessagesForClient(client.id),
      listCoachNotesForClient(client.id, "shared"),
    ]);
  const progressPhotos = await resolveProgressPhotoUrls(rawProgressPhotos);

  return {
    client,
    todaysCheckIn: getTodaysOrLatestCheckIn(recentCheckIns),
    recentCheckIns,
    progressPhotos,
    feedbackMessages,
    sharedCoachNotes,
    weeklySummary: buildWeeklySummary(client, recentCheckIns),
  };
}
