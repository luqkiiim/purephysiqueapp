import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNowStrict, isToday, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

import type { ClientStatus, CoachNoteVisibility, ExerciseEntry } from "@/lib/types/app";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatShortDate(value: string | Date) {
  return format(typeof value === "string" ? parseISO(value) : value, "MMM d");
}

export function formatFullDate(value: string | Date) {
  return format(typeof value === "string" ? parseISO(value) : value, "EEEE, MMMM d");
}

export function formatRelative(value: string | Date) {
  return formatDistanceToNowStrict(
    typeof value === "string" ? parseISO(value) : value,
    { addSuffix: true },
  );
}

export function calculateCompletionPercentage(values: Array<unknown>) {
  const complete = values.filter((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value > 0;
    }

    return Boolean(value);
  }).length;

  return Math.round((complete / values.length) * 100);
}

export function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function describeCheckInStatus(lastCheckInDate?: string | null) {
  if (!lastCheckInDate) {
    return {
      label: "Needs first check-in",
      tone: "warning" as const,
    };
  }

  const lastDate = parseISO(lastCheckInDate);

  if (isToday(lastDate)) {
    return {
      label: "Logged today",
      tone: "success" as const,
    };
  }

  return {
    label: `Last log ${formatDistanceToNowStrict(lastDate, { addSuffix: true })}`,
    tone: "warning" as const,
  };
}

export function percentageAgainstTarget(value: number, target: number) {
  if (!target) {
    return 0;
  }

  return clampPercent((value / target) * 100);
}

export function sanitizeExerciseEntries(entries: ExerciseEntry[]) {
  return entries
    .map((entry) => ({
      type: entry.type.trim().replace(/\s+/g, " "),
      durationMinutes: Number.isFinite(entry.durationMinutes)
        ? Math.max(0, Math.round(entry.durationMinutes))
        : 0,
    }))
    .filter((entry) => entry.type.length > 0);
}

export function getExerciseTotalDuration(entries: ExerciseEntry[]) {
  return sanitizeExerciseEntries(entries).reduce(
    (total, entry) => total + entry.durationMinutes,
    0,
  );
}

export function formatExerciseSummary(entries: ExerciseEntry[]) {
  const sanitizedEntries = sanitizeExerciseEntries(entries);

  if (!sanitizedEntries.length) {
    return "";
  }

  return sanitizedEntries.map((entry) => entry.type).join(" + ");
}

export function serializeExerciseEntries(entries: ExerciseEntry[]) {
  return JSON.stringify(sanitizeExerciseEntries(entries));
}

export function parseExerciseEntries(
  serializedEntries?: string | null,
  fallbackDurationMinutes = 0,
) {
  const normalizedValue = serializedEntries?.trim() ?? "";

  if (!normalizedValue) {
    if (fallbackDurationMinutes > 0) {
      return [{ type: "Workout", durationMinutes: fallbackDurationMinutes }];
    }

    return [];
  }

  if (normalizedValue.startsWith("[")) {
    try {
      const parsedValue = JSON.parse(normalizedValue);

      if (Array.isArray(parsedValue)) {
        return sanitizeExerciseEntries(
          parsedValue.map((entry) => ({
            type: typeof entry?.type === "string" ? entry.type : "",
            durationMinutes: Number(entry?.durationMinutes ?? 0),
          })),
        );
      }
    } catch {
      // Fall through to legacy plain-text parsing.
    }
  }

  return sanitizeExerciseEntries([
    {
      type: normalizedValue,
      durationMinutes: fallbackDurationMinutes,
    },
  ]);
}

export function formatClientStatusLabel(status: ClientStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "inactive":
      return "Inactive";
    default:
      return status;
  }
}

export function formatCoachNoteVisibilityLabel(visibility: CoachNoteVisibility) {
  switch (visibility) {
    case "private":
      return "Private";
    case "shared":
      return "Shared";
    default:
      return visibility;
  }
}
