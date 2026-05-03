import { parseISO, subDays } from "date-fns";
import { notFound } from "next/navigation";

import { isInternalClientEmail } from "@/lib/access-codes";
import { requireCoach } from "@/lib/auth";
import {
  getCoachClientDefaults,
  getCoachDashboardPreferences,
  sortClientStatusRows,
} from "@/lib/coach-settings";
import {
  countProgressPhotosForClient,
  getDailyCheckInForClientByDate,
  getClientBundleByCoachAndId,
  listClientStatusSourcesByCoachId,
  listClientSupplementTargets,
  listCoachNotesForClient,
  listDailyCheckInsForClients,
  listFeedbackMessagesForClient,
  listRecentDailyCheckInsForClient,
} from "@/lib/database/queries";
import {
  getDemoClientDetailData,
  getDemoCoachDashboardData,
  demoCheckIns,
  demoClients,
  demoProgressPhotos,
} from "@/lib/demo/data";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import type {
  ClientStatusRow,
  ClientStatusSource,
  CoachClientsPageData,
  CoachDashboardData,
  CoachReviewData,
  DailyCheckIn,
} from "@/lib/types/app";
import {
  buildClientStatusRow,
  buildTodaySnapshot,
  buildWeeklySummary,
  getTodaysOrLatestCheckIn,
  groupCheckInsByClientId,
} from "@/lib/data/shared";
import { getTodayIsoDate, percentageAgainstTarget } from "@/lib/utils";

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function buildAdherenceTrend(checkIns: DailyCheckIn[], chartWindowDays: number) {
  const sortedCheckIns = [...checkIns].sort((left, right) => left.date.localeCompare(right.date));
  const anchorDate = sortedCheckIns.length
    ? parseISO(sortedCheckIns.at(-1)!.date)
    : new Date();
  const bucketCount = Math.max(1, Math.ceil(chartWindowDays / 7));

  return Array.from({ length: bucketCount }, (_, index) => {
    const windowEnd = subDays(anchorDate, (bucketCount - 1 - index) * 7);
    const windowStartIso = subDays(windowEnd, 6).toISOString().slice(0, 10);
    const windowEndIso = windowEnd.toISOString().slice(0, 10);
    const bucket = sortedCheckIns.filter(
      (entry) => entry.date >= windowStartIso && entry.date <= windowEndIso,
    );
    const weights = bucket.map((entry) => entry.bodyWeight);

    return {
      label: `W${index + 1}`,
      adherence: Math.round(average(bucket.map((entry) => entry.completionPercentage))),
      weightDelta:
        weights.length > 1
          ? Number((weights.at(-1)! - weights[0]!).toFixed(1))
          : 0,
    };
  });
}

function buildMomentumClients(
  clients: ClientStatusSource[],
  checkInsByClientId: Map<string, DailyCheckIn[]>,
) {
  return clients
    .map((client) => buildClientStatusRow(client, checkInsByClientId.get(client.id) ?? []))
    .sort((left, right) => {
      if (right.streak !== left.streak) {
        return right.streak - left.streak;
      }

      return right.proteinConsistency + right.stepConsistency - (left.proteinConsistency + left.stepConsistency);
    })
    .slice(0, 3)
    .map((row) => ({
      id: row.id,
      fullName: row.fullName,
      streak: row.streak,
      adherence: Math.round((row.proteinConsistency + row.stepConsistency) / 2),
    }));
}

function buildCoachSummaryCards(
  clients: ClientStatusSource[],
  rows: ClientStatusRow[],
) {
  return [
    {
      label: "Total clients",
      value: `${clients.length}`,
      hint: "One coach workspace",
      tone: "neutral" as const,
    },
    {
      label: "Logged today",
      value: `${rows.filter((row) => row.statusLabel === "Logged today").length}`,
      hint: "Daily compliance snapshot",
      tone: "success" as const,
    },
    {
      label: "Missed today",
      value: `${rows.filter((row) => row.statusLabel !== "Logged today").length}`,
      hint: "Needs follow-up",
      tone: "warning" as const,
    },
    {
      label: "Active streaks",
      value: `${rows.filter((row) => row.streak >= 5).length}`,
      hint: "Clients at 5+ days",
      tone: "accent" as const,
    },
  ];
}

function sortCheckInsNewestFirst(left: DailyCheckIn, right: DailyCheckIn) {
  const dateSort = right.date.localeCompare(left.date);

  if (dateSort !== 0) {
    return dateSort;
  }

  return right.submittedAt.localeCompare(left.submittedAt);
}

function buildCoachReviewData(
  rows: ClientStatusRow[],
  checkIns: DailyCheckIn[],
  progressPhotoCountsByClientId: Map<string, number>,
): CoachReviewData {
  const today = getTodayIsoDate();
  const sortedCheckIns = [...checkIns].sort(sortCheckInsNewestFirst);
  const rowsByClientId = new Map(rows.map((row) => [row.id, row] as const));
  const latestCheckInByClientId = new Map<string, DailyCheckIn>();

  sortedCheckIns.forEach((entry) => {
    if (!latestCheckInByClientId.has(entry.clientId)) {
      latestCheckInByClientId.set(entry.clientId, entry);
    }
  });

  const reviewClients = rows.map((row) => ({
    ...row,
    averageConsistency: Math.round((row.proteinConsistency + row.stepConsistency) / 2),
    progressPhotoCount: progressPhotoCountsByClientId.get(row.id) ?? 0,
    lastCheckIn: latestCheckInByClientId.get(row.id) ?? null,
  }));
  const recentCheckIns = sortedCheckIns
    .map((entry) => {
      const client = rowsByClientId.get(entry.clientId);

      if (!client) {
        return null;
      }

      return {
        id: entry.id,
        clientId: entry.clientId,
        clientName: client.fullName,
        date: entry.date,
        bodyWeight: entry.bodyWeight,
        completionPercentage: entry.completionPercentage,
        proteinPercent: percentageAgainstTarget(
          entry.proteinGrams,
          entry.proteinTargetSnapshot,
        ),
        stepPercent: percentageAgainstTarget(entry.steps, entry.stepTargetSnapshot),
        proteinGrams: entry.proteinGrams,
        steps: entry.steps,
        mealNotes: entry.mealNotes,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .slice(0, 10);
  const totalProgressPhotos = reviewClients.reduce(
    (total, client) => total + client.progressPhotoCount,
    0,
  );
  const averageCompletion = recentCheckIns.length
    ? Math.round(
        recentCheckIns.reduce((total, entry) => total + entry.completionPercentage, 0) /
          recentCheckIns.length,
      )
    : 0;

  return {
    summaryCards: [
      {
        label: "Review queue",
        value: `${reviewClients.filter((client) => client.statusLabel !== "Logged today").length}`,
        hint: "Clients still needing attention",
        tone: "warning",
      },
      {
        label: "Checked in today",
        value: `${checkIns.filter((entry) => entry.date === today).length}`,
        hint: "Fresh logs to scan",
        tone: "success",
      },
      {
        label: "Progress photos",
        value: `${totalProgressPhotos}`,
        hint: "Uploaded across the roster",
        tone: "accent",
      },
      {
        label: "Recent completion",
        value: `${averageCompletion}%`,
        hint: "Average from latest logs",
        tone: "neutral",
      },
    ],
    missedClients: reviewClients
      .filter((client) => client.statusLabel !== "Logged today")
      .slice(0, 8),
    recentCheckIns,
    photoIndicators: [...reviewClients]
      .sort((left, right) => {
        if (right.progressPhotoCount !== left.progressPhotoCount) {
          return right.progressPhotoCount - left.progressPhotoCount;
        }

        return right.averageConsistency - left.averageConsistency;
      })
      .slice(0, 6),
  };
}

export async function getCoachTabsData() {
  const { coach, isDemo } = await requireCoach();
  const dashboardPreferences = await getCoachDashboardPreferences();

  if (!isLiveAppEnabled || isDemo) {
    const demo = getDemoCoachDashboardData();
    const sortedRows = sortClientStatusRows(demo.clients, dashboardPreferences);
    const adherenceTrend = demo.adherenceTrend.slice(
      -Math.max(1, Math.ceil(dashboardPreferences.chartWindowDays / 7)),
    );
    const overview: CoachDashboardData = {
      ...demo,
      dashboardPreferences,
      clients: sortedRows,
      adherenceTrend,
    };
    const clients: CoachClientsPageData = {
      coach: demo.coach,
      dashboardPreferences,
      clients: sortedRows,
    };
    const progressPhotoCountsByClientId = new Map(
      demoClients.map(
        (client) =>
          [
            client.id,
            demoProgressPhotos.filter((photo) => photo.clientId === client.id).length,
          ] as const,
      ),
    );

    return {
      coach: demo.coach,
      dashboardPreferences,
      overview,
      clients,
      review: buildCoachReviewData(sortedRows, demoCheckIns, progressPhotoCountsByClientId),
    };
  }

  const clients = await listClientStatusSourcesByCoachId(coach.id);
  const sinceDate = subDays(new Date(), dashboardPreferences.chartWindowDays - 1)
    .toISOString()
    .slice(0, 10);
  const clientIds = clients.map((client) => client.id);
  const [allRecentCheckIns, supplementTargets, progressPhotoCounts] = await Promise.all([
    listDailyCheckInsForClients(clientIds, sinceDate),
    listClientSupplementTargets(clientIds),
    Promise.all(
      clientIds.map(async (clientId) => {
        const count = await countProgressPhotosForClient(clientId);
        return [clientId, count] as const;
      }),
    ),
  ]);
  const checkInsByClientId = groupCheckInsByClientId(allRecentCheckIns);
  const rows = clients.map((client) =>
    buildClientStatusRow(client, checkInsByClientId.get(client.id) ?? []),
  );
  const sortedRows = sortClientStatusRows(rows, dashboardPreferences);
  const supplementTargetsByClientId = new Map(
    supplementTargets.map((target) => [target.clientId, target] as const),
  );
  const todaysEntries = new Map(
    allRecentCheckIns
      .filter((entry) => entry.date === getTodayIsoDate())
      .map((entry) => [entry.clientId, entry] as const),
  );
  const overview: CoachDashboardData = {
    coach,
    dashboardPreferences,
    summaryCards: buildCoachSummaryCards(clients, rows),
    clients: sortedRows,
    adherenceTrend: buildAdherenceTrend(allRecentCheckIns, dashboardPreferences.chartWindowDays),
    todayCheckInSnapshot: buildTodaySnapshot(
      clients,
      supplementTargetsByClientId,
      todaysEntries,
    ),
    momentumClients: buildMomentumClients(clients, checkInsByClientId),
  };
  const clientsPage: CoachClientsPageData = {
    coach,
    dashboardPreferences,
    clients: sortedRows,
  };

  return {
    coach,
    dashboardPreferences,
    overview,
    clients: clientsPage,
    review: buildCoachReviewData(
      sortedRows,
      allRecentCheckIns,
      new Map(progressPhotoCounts),
    ),
  };
}

export async function getCoachDashboardData() {
  const data = await getCoachTabsData();
  return data.overview;
}

export async function getCoachClientsPageData() {
  const data = await getCoachTabsData();
  return data.clients;
}

export async function getCoachClientDetailData(clientId: string) {
  const { coach, isDemo } = await requireCoach();

  if (!isLiveAppEnabled || isDemo) {
    if (!demoClients.some((client) => client.id === clientId)) {
      notFound();
    }

    return getDemoClientDetailData(clientId);
  }

  const client = await getClientBundleByCoachAndId(coach.id, clientId);

  if (!client) {
    notFound();
  }

  const [recentCheckIns, progressPhotoCount, coachNotes, feedbackMessages] = await Promise.all([
    listRecentDailyCheckInsForClient(client.id),
    countProgressPhotosForClient(client.id),
    listCoachNotesForClient(client.id),
    listFeedbackMessagesForClient(client.id),
  ]);

  return {
    coach,
    client,
    todaysCheckIn: getTodaysOrLatestCheckIn(recentCheckIns),
    recentCheckIns,
    progressPhotoCount,
    coachNotes,
    feedbackMessages,
    weeklySummary: buildWeeklySummary(client, recentCheckIns),
  };
}

export async function getCoachClientBackfillPageData(clientId: string, date?: string) {
  const { coach, isDemo } = await requireCoach();

  if (!isLiveAppEnabled || isDemo) {
    if (!demoClients.some((client) => client.id === clientId)) {
      notFound();
    }

    const demo = getDemoClientDetailData(clientId);

    return {
      coach: demo.coach,
      client: demo.client,
      existingCheckIn: date
        ? demo.recentCheckIns.find((entry) => entry.date === date) ?? null
        : null,
    };
  }

  const client = await getClientBundleByCoachAndId(coach.id, clientId);

  if (!client) {
    notFound();
  }

  return {
    coach,
    client,
    existingCheckIn: date ? await getDailyCheckInForClientByDate(client.id, date) : null,
  };
}

export async function getCoachSettingsPageData() {
  const { coach, isDemo } = await requireCoach();
  const [clientDefaults, dashboardPreferences] = await Promise.all([
    getCoachClientDefaults(),
    getCoachDashboardPreferences(),
  ]);

  const clients = !isLiveAppEnabled || isDemo
    ? demoClients
    : await listClientStatusSourcesByCoachId(coach.id);

  return {
    coach,
    clientDefaults,
    dashboardPreferences,
    accessSummary: {
      totalClients: clients.length,
      claimedClients: clients.filter((client) => !isInternalClientEmail(client.email)).length,
      pendingClaims: clients.filter((client) => isInternalClientEmail(client.email)).length,
    },
  };
}
