import { cookies } from "next/headers";
import { z } from "zod";

import type { ClientStatusRow, CoachClientDefaults, CoachDashboardPreferences } from "@/lib/types/app";
import { getTodayIsoDate } from "@/lib/utils";

const CLIENT_DEFAULTS_COOKIE = "pp_coach_client_defaults";
const DASHBOARD_PREFERENCES_COOKIE = "pp_coach_dashboard_preferences";

const cookieSchemaOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365,
};

const clientDefaultsSchema = z.object({
  trainingPhase: z.string().min(2).max(80),
  proteinTargetGrams: z.number().int().min(60).max(350),
  stepTarget: z.number().int().min(1000).max(30000),
  exerciseExpectation: z.string().min(2).max(120),
  probioticsEnabled: z.boolean(),
  fishOilEnabled: z.boolean(),
  welcomeMessage: z.string().max(240),
});

const dashboardPreferencesSchema = z.object({
  rosterSort: z.enum(["name", "streak", "adherence"]),
  chartWindowDays: z.union([z.literal(14), z.literal(30), z.literal(42)]),
  followUpCount: z.union([z.literal(4), z.literal(6), z.literal(8)]),
  highlightMissedClients: z.boolean(),
});

export const DEFAULT_CLIENT_TIMEZONE = "Asia/Kuala_Lumpur";

export const defaultCoachClientDefaults: CoachClientDefaults = {
  trainingPhase: "Lean phase",
  proteinTargetGrams: 150,
  stepTarget: 9000,
  exerciseExpectation: "4 training sessions / week",
  probioticsEnabled: true,
  fishOilEnabled: true,
  welcomeMessage: "",
};

export const defaultCoachDashboardPreferences: CoachDashboardPreferences = {
  rosterSort: "name",
  chartWindowDays: 42,
  followUpCount: 4,
  highlightMissedClients: true,
};

function parseCookieJson<T>(
  rawValue: string | undefined,
  schema: z.ZodType<T>,
  fallbackValue: T,
) {
  if (!rawValue) {
    return fallbackValue;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    const result = schema.safeParse(parsedValue);
    return result.success ? result.data : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export async function getCoachClientDefaults() {
  const cookieStore = await cookies();
  return parseCookieJson(
    cookieStore.get(CLIENT_DEFAULTS_COOKIE)?.value,
    clientDefaultsSchema,
    defaultCoachClientDefaults,
  );
}

export async function setCoachClientDefaultsCookie(value: CoachClientDefaults) {
  const cookieStore = await cookies();
  cookieStore.set(CLIENT_DEFAULTS_COOKIE, JSON.stringify(clientDefaultsSchema.parse(value)), cookieSchemaOptions);
}

export async function getCoachDashboardPreferences() {
  const cookieStore = await cookies();
  return parseCookieJson(
    cookieStore.get(DASHBOARD_PREFERENCES_COOKIE)?.value,
    dashboardPreferencesSchema,
    defaultCoachDashboardPreferences,
  );
}

export async function setCoachDashboardPreferencesCookie(value: CoachDashboardPreferences) {
  const cookieStore = await cookies();
  cookieStore.set(
    DASHBOARD_PREFERENCES_COOKIE,
    JSON.stringify(dashboardPreferencesSchema.parse(value)),
    cookieSchemaOptions,
  );
}

export function sortClientStatusRows(
  rows: ClientStatusRow[],
  preferences: CoachDashboardPreferences,
) {
  const todayIsoDate = getTodayIsoDate();

  return [...rows].sort((left, right) => {
    if (preferences.highlightMissedClients) {
      const leftLoggedToday = left.lastCheckInDate === todayIsoDate;
      const rightLoggedToday = right.lastCheckInDate === todayIsoDate;

      if (leftLoggedToday !== rightLoggedToday) {
        return leftLoggedToday ? 1 : -1;
      }
    }

    switch (preferences.rosterSort) {
      case "streak":
        if (right.streak !== left.streak) {
          return right.streak - left.streak;
        }
        break;
      case "adherence": {
        const leftAdherence = left.proteinConsistency + left.stepConsistency;
        const rightAdherence = right.proteinConsistency + right.stepConsistency;

        if (rightAdherence !== leftAdherence) {
          return rightAdherence - leftAdherence;
        }
        break;
      }
      case "name":
      default: {
        const nameSort = left.fullName.localeCompare(right.fullName);

        if (nameSort !== 0) {
          return nameSort;
        }
      }
    }

    return left.fullName.localeCompare(right.fullName);
  });
}
