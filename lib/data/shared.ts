import { parseISO, subDays } from "date-fns";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { appEnv, isSupabaseAdminEnabled } from "@/lib/supabase/config";
import type {
  Client,
  ClientStatusRow,
  DailyCheckIn,
  ProgressPhoto,
  WeeklySummary,
} from "@/lib/types/app";
import {
  clampPercent,
  describeCheckInStatus,
  getTodayIsoDate,
  percentageAgainstTarget,
} from "@/lib/utils";

function sortCheckInsAsc(checkIns: DailyCheckIn[]) {
  return [...checkIns].sort((left, right) => left.date.localeCompare(right.date));
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function roundToSingleDecimal(value: number) {
  return Number(value.toFixed(1));
}

function percentageFromCount(count: number, total: number) {
  if (!total) {
    return 0;
  }

  return clampPercent((count / total) * 100);
}

function summarizeSupplementAdherence(client: Client, checkIns: DailyCheckIn[]) {
  const enabledSupplements =
    Number(client.targets.probioticsEnabled) + Number(client.targets.fishOilEnabled);

  if (!checkIns.length) {
    return 0;
  }

  if (!enabledSupplements) {
    return 100;
  }

  const completed = checkIns.reduce((total, entry) => {
    let entryTotal = total;

    if (client.targets.probioticsEnabled && entry.probioticsChecked) {
      entryTotal += 1;
    }

    if (client.targets.fishOilEnabled && entry.fishOilChecked) {
      entryTotal += 1;
    }

    return entryTotal;
  }, 0);

  return percentageFromCount(completed, checkIns.length * enabledSupplements);
}

function summarizeWeeklyWindow(
  client: Client,
  checkIns: DailyCheckIn[],
  weekLabel: string,
): WeeklySummary {
  return {
    weekLabel,
    adherencePercent: Math.round(average(checkIns.map((entry) => entry.completionPercentage))),
    averageProtein: Math.round(average(checkIns.map((entry) => entry.proteinGrams))),
    averageSteps: Math.round(average(checkIns.map((entry) => entry.steps))),
    averageHydrationLiters: roundToSingleDecimal(
      average(checkIns.map((entry) => entry.hydrationLiters)),
    ),
    workoutsCompleted: checkIns.filter((entry) => entry.exerciseDurationMinutes > 0).length,
    supplementAdherencePercent: summarizeSupplementAdherence(client, checkIns),
    averageSleepHours: roundToSingleDecimal(
      average(checkIns.map((entry) => entry.totalSleepHours)),
    ),
  };
}

export function getTodaysOrLatestCheckIn(checkIns: DailyCheckIn[]) {
  const sortedCheckIns = sortCheckInsAsc(checkIns);
  const todaysCheckIn = sortedCheckIns.find((entry) => entry.date === getTodayIsoDate());

  return todaysCheckIn ?? sortedCheckIns.at(-1) ?? null;
}

export function buildWeeklySummary(client: Client, checkIns: DailyCheckIn[]) {
  const sortedCheckIns = sortCheckInsAsc(checkIns);
  const anchorDate = sortedCheckIns.length
    ? parseISO(sortedCheckIns.at(-1)!.date)
    : new Date();

  const currentWindowStart = subDays(anchorDate, 6).toISOString().slice(0, 10);
  const previousWindowStart = subDays(anchorDate, 13).toISOString().slice(0, 10);
  const previousWindowEnd = subDays(anchorDate, 7).toISOString().slice(0, 10);
  const anchorDateIso = anchorDate.toISOString().slice(0, 10);

  const currentWindowEntries = sortedCheckIns.filter(
    (entry) => entry.date >= currentWindowStart && entry.date <= anchorDateIso,
  );
  const previousWindowEntries = sortedCheckIns.filter(
    (entry) => entry.date >= previousWindowStart && entry.date <= previousWindowEnd,
  );

  return [
    summarizeWeeklyWindow(client, currentWindowEntries, "This week"),
    summarizeWeeklyWindow(client, previousWindowEntries, "Last week"),
  ];
}

export function buildClientStatusRow(
  client: Client,
  checkIns: DailyCheckIn[],
): ClientStatusRow {
  const recentCheckIns = sortCheckInsAsc(checkIns).slice(-7);
  const latestCheckIn = recentCheckIns.at(-1) ?? sortCheckInsAsc(checkIns).at(-1);
  const proteinConsistency = recentCheckIns.length
    ? Math.round(
        average(
          recentCheckIns.map((entry) =>
            percentageAgainstTarget(entry.proteinGrams, entry.proteinTargetSnapshot),
          ),
        ),
      )
    : 0;
  const stepConsistency = recentCheckIns.length
    ? Math.round(
        average(
          recentCheckIns.map((entry) =>
            percentageAgainstTarget(entry.steps, entry.stepTargetSnapshot),
          ),
        ),
      )
    : 0;
  const status = describeCheckInStatus(client.lastCheckInDate);
  const statusTone: ClientStatusRow["statusTone"] =
    status.tone === "success"
      ? "success"
      : client.activeStatus === "active"
        ? "warning"
        : "neutral";

  return {
    id: client.id,
    fullName: client.fullName,
    email: client.email,
    statusLabel: status.label,
    statusTone,
    streak: client.currentStreak,
    proteinConsistency,
    stepConsistency,
    recentWeight: latestCheckIn?.bodyWeight ?? 0,
    lastCheckInDate: client.lastCheckInDate,
  };
}

export function groupCheckInsByClientId(checkIns: DailyCheckIn[]) {
  return checkIns.reduce<Map<string, DailyCheckIn[]>>((groups, entry) => {
    const group = groups.get(entry.clientId) ?? [];
    group.push(entry);
    groups.set(entry.clientId, group);
    return groups;
  }, new Map());
}

export async function resolveProgressPhotoUrls(photos: ProgressPhoto[]) {
  if (!photos.length || !isSupabaseAdminEnabled) {
    return photos;
  }

  const admin = createSupabaseAdminClient();

  return Promise.all(
    photos.map(async (photo) => {
      if (!photo.imageUrl || photo.imageUrl.startsWith("http")) {
        return photo;
      }

      const { data, error } = await admin.storage
        .from(appEnv.storageBucket)
        .createSignedUrl(photo.imageUrl, 60 * 60);

      if (error || !data?.signedUrl) {
        return photo;
      }

      return {
        ...photo,
        imageUrl: data.signedUrl,
      };
    }),
  );
}

export function buildTodaySnapshot(
  clients: Client[],
  todaysCheckIns: Map<string, DailyCheckIn>,
) {
  return [
    {
      label: "Protein target hit",
      value: percentageFromCount(
        clients.filter((client) => {
          const entry = todaysCheckIns.get(client.id);
          return Boolean(entry && entry.proteinGrams >= entry.proteinTargetSnapshot);
        }).length,
        clients.length,
      ),
    },
    {
      label: "Step target hit",
      value: percentageFromCount(
        clients.filter((client) => {
          const entry = todaysCheckIns.get(client.id);
          return Boolean(entry && entry.steps >= entry.stepTargetSnapshot);
        }).length,
        clients.length,
      ),
    },
    {
      label: "Workout logged",
      value: percentageFromCount(
        clients.filter((client) => {
          const entry = todaysCheckIns.get(client.id);
          return Boolean(entry && entry.exerciseDurationMinutes > 0);
        }).length,
        clients.length,
      ),
    },
    {
      label: "Supplements checked",
      value: percentageFromCount(
        clients.filter((client) => {
          const entry = todaysCheckIns.get(client.id);

          if (!entry) {
            return false;
          }

          return (
            (!client.targets.probioticsEnabled || entry.probioticsChecked) &&
            (!client.targets.fishOilEnabled || entry.fishOilChecked)
          );
        }).length,
        clients.length,
      ),
    },
  ];
}
