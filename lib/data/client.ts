import { cache } from "react";

import { requireClient } from "@/lib/auth";
import {
  getLatestDailyCheckInForClient,
  listCoachNotesForClient,
  listFeedbackMessagesForClient,
  listProgressPhotosForClient,
  listRecentDailyCheckInsForClient,
} from "@/lib/database/queries";
import type { ClientCoachUpdate } from "@/lib/types/app";
import { getDemoClientHomeData } from "@/lib/demo/data";
import { buildWeeklySummary, resolveProgressPhotoUrls } from "@/lib/data/shared";
import { isLiveAppEnabled } from "@/lib/supabase/config";

const getClientSessionData = cache(async () => requireClient());
const RECENT_CLIENT_CHECK_IN_LIMIT = 45;

function getDemoData(clientId: string) {
  return getDemoClientHomeData(clientId);
}

function pickLatestCoachUpdate({
  feedbackMessages,
  sharedCoachNotes,
}: {
  feedbackMessages: Array<{ message: string; createdAt: string }>;
  sharedCoachNotes: Array<{ note: string; createdAt: string }>;
}): ClientCoachUpdate | null {
  const latestMessage = feedbackMessages[0];
  const latestSharedNote = sharedCoachNotes[0];

  if (!latestMessage && !latestSharedNote) {
    return null;
  }

  if (!latestSharedNote) {
    return {
      type: "message",
      content: latestMessage!.message,
      createdAt: latestMessage!.createdAt,
    };
  }

  if (!latestMessage) {
    return {
      type: "note",
      content: latestSharedNote.note,
      createdAt: latestSharedNote.createdAt,
    };
  }

  return latestMessage.createdAt >= latestSharedNote.createdAt
    ? {
        type: "message",
        content: latestMessage.message,
        createdAt: latestMessage.createdAt,
      }
    : {
        type: "note",
        content: latestSharedNote.note,
        createdAt: latestSharedNote.createdAt,
      };
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
      latestCoachUpdate: demo.latestCoachUpdate ?? null,
    };
  }

  const [todaysCheckIn, feedbackMessages, sharedCoachNotes] = await Promise.all([
    getLatestDailyCheckInForClient(client.id),
    listFeedbackMessagesForClient(client.id, 1),
    listCoachNotesForClient(client.id, "shared", 1),
  ]);

  return {
    client,
    todaysCheckIn,
    latestCoachUpdate: pickLatestCoachUpdate({ feedbackMessages, sharedCoachNotes }),
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
    recentCheckIns: await listRecentDailyCheckInsForClient(client.id, RECENT_CLIENT_CHECK_IN_LIMIT),
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

  const recentCheckIns = await listRecentDailyCheckInsForClient(
    client.id,
    RECENT_CLIENT_CHECK_IN_LIMIT,
  );

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
