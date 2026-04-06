import { cache } from "react";

import { requireClient } from "@/lib/auth";
import {
  listCoachNotesForClient,
  listDailyCheckInsForClient,
  listFeedbackMessagesForClient,
  listProgressPhotosForClient,
} from "@/lib/database/queries";
import { getDemoClientHomeData } from "@/lib/demo/data";
import { buildWeeklySummary, getTodaysOrLatestCheckIn, resolveProgressPhotoUrls } from "@/lib/data/shared";
import { isLiveAppEnabled } from "@/lib/supabase/config";

const getClientSessionData = cache(async () => requireClient());

function getDemoData(clientId: string) {
  return getDemoClientHomeData(clientId);
}

export const getClientShellData = cache(async () => {
  const { client, isDemo } = await getClientSessionData();

  return {
    client,
    isDemo,
  };
});

export const getClientCheckInPageData = cache(async () => {
  const { client, isDemo } = await getClientSessionData();

  if (!isLiveAppEnabled || isDemo) {
    const demo = getDemoData(client.id);

    return {
      client: demo.client,
      todaysCheckIn: demo.todaysCheckIn,
      feedbackMessages: demo.feedbackMessages,
      sharedCoachNotes: demo.sharedCoachNotes,
    };
  }

  const [recentCheckIns, feedbackMessages, sharedCoachNotes] = await Promise.all([
    listDailyCheckInsForClient(client.id),
    listFeedbackMessagesForClient(client.id),
    listCoachNotesForClient(client.id, "shared"),
  ]);

  return {
    client,
    todaysCheckIn: getTodaysOrLatestCheckIn(recentCheckIns),
    feedbackMessages,
    sharedCoachNotes,
  };
});

export const getClientHistoryPageData = cache(async () => {
  const { client, isDemo } = await getClientSessionData();

  if (!isLiveAppEnabled || isDemo) {
    const demo = getDemoData(client.id);

    return {
      recentCheckIns: demo.recentCheckIns,
    };
  }

  return {
    recentCheckIns: await listDailyCheckInsForClient(client.id),
  };
});

export const getClientWeeklyPageData = cache(async () => {
  const { client, isDemo } = await getClientSessionData();

  if (!isLiveAppEnabled || isDemo) {
    const demo = getDemoData(client.id);

    return {
      recentCheckIns: demo.recentCheckIns,
      weeklySummary: demo.weeklySummary,
    };
  }

  const recentCheckIns = await listDailyCheckInsForClient(client.id);

  return {
    recentCheckIns,
    weeklySummary: buildWeeklySummary(client, recentCheckIns),
  };
});

export const getClientPhotosPageData = cache(async () => {
  const { client, isDemo } = await getClientSessionData();

  if (!isLiveAppEnabled || isDemo) {
    const demo = getDemoData(client.id);

    return {
      progressPhotos: demo.progressPhotos,
    };
  }

  const progressPhotos = await resolveProgressPhotoUrls(
    await listProgressPhotosForClient(client.id),
  );

  return {
    progressPhotos,
  };
});

export const getClientMessagesPageData = cache(async () => {
  const { client, isDemo } = await getClientSessionData();

  if (!isLiveAppEnabled || isDemo) {
    const demo = getDemoData(client.id);

    return {
      feedbackMessages: demo.feedbackMessages,
      sharedCoachNotes: demo.sharedCoachNotes,
    };
  }

  const [feedbackMessages, sharedCoachNotes] = await Promise.all([
    listFeedbackMessagesForClient(client.id),
    listCoachNotesForClient(client.id, "shared"),
  ]);

  return {
    feedbackMessages,
    sharedCoachNotes,
  };
});
