import { randomUUID } from "crypto";
import { subDays } from "date-fns";
import { NextResponse } from "next/server";

import {
  sendDailyReminderEmail,
  sendMissedDayNudgeEmail,
  sendWeeklySummaryEmail,
} from "@/lib/email/service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { appEnv, isLiveAppEnabled } from "@/lib/supabase/config";
import { createInviteLink, getTodayIsoDate } from "@/lib/utils";

interface ReminderClientRow {
  id: string;
  full_name: string;
  email: string;
  invite_token: string;
  active_status: string;
}

interface ReminderSettingsRow {
  client_id: string;
  email_reminders_enabled: boolean;
  missed_day_nudges_enabled: boolean;
  reminder_time: string;
  weekly_summary_enabled: boolean;
  timezone: string;
}

interface CheckInMetricsRow {
  client_id: string;
  completion_percentage: number;
  protein_grams: number;
  steps: number;
}

interface NotificationLogRow {
  client_id: string;
  notification_type: string;
  sent_at: string;
}

function getMinutesInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return hour * 60 + minute;
}

function getWeekdayInTimezone(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(date);
}

function parseReminderMinutes(reminderTime: string) {
  const [hour, minute] = reminderTime.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
}

function isWithinWindow(nowMinutes: number, targetMinutes: number, windowMinutes: number) {
  return nowMinutes >= targetMinutes && nowMinutes <= targetMinutes + windowMinutes;
}

function buildWeeklySummaryText(
  checkIns: Array<{ completion_percentage: number; protein_grams: number; steps: number }>,
) {
  if (!checkIns.length) {
    return "No weekly check-ins yet. The fastest win is simply getting back to today's log.";
  }

  const adherence = Math.round(
    checkIns.reduce((acc, entry) => acc + entry.completion_percentage, 0) / checkIns.length,
  );
  const averageProtein = Math.round(
    checkIns.reduce((acc, entry) => acc + entry.protein_grams, 0) / checkIns.length,
  );
  const averageSteps = Math.round(
    checkIns.reduce((acc, entry) => acc + entry.steps, 0) / checkIns.length,
  );

  return `You averaged ${adherence}% check-in completion, ${averageProtein}g protein, and ${averageSteps.toLocaleString()} steps.`;
}

async function insertNotificationLog(clientId: string, notificationType: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin.from("notification_logs").insert({
    id: randomUUID(),
    client_id: clientId,
    notification_type: notificationType,
    delivery_status: "sent",
    metadata: {},
    sent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  if (result.error) {
    throw new Error(`Failed to insert notification log: ${result.error.message}`);
  }
}

export async function GET(request: Request) {
  if (!appEnv.cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${appEnv.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isLiveAppEnabled) {
    return NextResponse.json({
      skipped: true,
      reason: "Supabase environment variables are missing.",
    });
  }

  const today = getTodayIsoDate();
  const yesterday = subDays(new Date(), 1).toISOString().slice(0, 10);
  const lastWeekStart = subDays(new Date(), 7).toISOString().slice(0, 10);
  const admin = createSupabaseAdminClient();

  const [
    clientsResult,
    reminderSettingsResult,
    todaysCheckInsResult,
    yesterdaysCheckInsResult,
    weeklyCheckInsResult,
    notificationLogsResult,
  ] = await Promise.all([
    admin
      .from("clients")
      .select("id, full_name, email, invite_token, active_status"),
    admin
      .from("reminder_settings")
      .select("client_id, email_reminders_enabled, missed_day_nudges_enabled, reminder_time, weekly_summary_enabled, timezone"),
    admin
      .from("daily_check_ins")
      .select("client_id, completion_percentage, protein_grams, steps")
      .eq("date", today),
    admin
      .from("daily_check_ins")
      .select("client_id")
      .eq("date", yesterday),
    admin
      .from("daily_check_ins")
      .select("client_id, completion_percentage, protein_grams, steps")
      .gte("date", lastWeekStart),
    admin
      .from("notification_logs")
      .select("client_id, notification_type, sent_at")
      .gte("sent_at", `${today}T00:00:00.000Z`),
  ]);

  if (clientsResult.error) {
    throw new Error(`Failed to load reminder clients: ${clientsResult.error.message}`);
  }

  if (reminderSettingsResult.error) {
    throw new Error(`Failed to load reminder settings: ${reminderSettingsResult.error.message}`);
  }

  if (todaysCheckInsResult.error) {
    throw new Error(`Failed to load today's check-ins: ${todaysCheckInsResult.error.message}`);
  }

  if (yesterdaysCheckInsResult.error) {
    throw new Error(`Failed to load yesterday's check-ins: ${yesterdaysCheckInsResult.error.message}`);
  }

  if (weeklyCheckInsResult.error) {
    throw new Error(`Failed to load weekly check-ins: ${weeklyCheckInsResult.error.message}`);
  }

  if (notificationLogsResult.error) {
    throw new Error(`Failed to load notification logs: ${notificationLogsResult.error.message}`);
  }

  const clients = (clientsResult.data ?? []) as ReminderClientRow[];
  const reminderSettings = (reminderSettingsResult.data ?? []) as ReminderSettingsRow[];
  const todaysCheckIns = (todaysCheckInsResult.data ?? []) as CheckInMetricsRow[];
  const yesterdaysCheckIns = (yesterdaysCheckInsResult.data ?? []) as Array<
    Pick<CheckInMetricsRow, "client_id">
  >;
  const weeklyCheckIns = (weeklyCheckInsResult.data ?? []) as CheckInMetricsRow[];
  const notificationLogs = (notificationLogsResult.data ?? []) as NotificationLogRow[];

  const remindersByClientId = new Map(reminderSettings.map((item) => [item.client_id, item]));
  const todayCheckInClientIds = new Set(todaysCheckIns.map((item) => item.client_id));
  const yesterdayCheckInClientIds = new Set(yesterdaysCheckIns.map((item) => item.client_id));
  const todayNotifications = new Set(
    notificationLogs.map((item) => `${item.client_id}:${item.notification_type}`),
  );

  const results = {
    inviteEmails: 0,
    dailyReminders: 0,
    missedDayNudges: 0,
    weeklySummaries: 0,
  };

  for (const client of clients) {
    if (client.active_status !== "active") {
      continue;
    }

    const settings = remindersByClientId.get(client.id);

    if (!settings) {
      continue;
    }

    const timezone = settings.timezone || "UTC";
    const nowMinutes = getMinutesInTimezone(new Date(), timezone);
    const reminderMinutes = parseReminderMinutes(settings.reminder_time || "19:00:00");
    const checkInLink = createInviteLink(appEnv.appUrl, client.invite_token);
    const weeklyClientCheckIns = weeklyCheckIns.filter((entry) => entry.client_id === client.id);

    if (
      settings.email_reminders_enabled &&
      !todayCheckInClientIds.has(client.id) &&
      !todayNotifications.has(`${client.id}:daily_reminder`) &&
      isWithinWindow(nowMinutes, reminderMinutes, 20)
    ) {
      await sendDailyReminderEmail({
        clientName: client.full_name,
        to: client.email,
        checkInLink,
      });
      await insertNotificationLog(client.id, "daily_reminder");
      results.dailyReminders += 1;
    }

    if (
      settings.missed_day_nudges_enabled &&
      !todayCheckInClientIds.has(client.id) &&
      !yesterdayCheckInClientIds.has(client.id) &&
      !todayNotifications.has(`${client.id}:missed_day_nudge`) &&
      nowMinutes >= reminderMinutes + 120
    ) {
      await sendMissedDayNudgeEmail({
        clientName: client.full_name,
        to: client.email,
        checkInLink,
      });
      await insertNotificationLog(client.id, "missed_day_nudge");
      results.missedDayNudges += 1;
    }

    if (
      settings.weekly_summary_enabled &&
      getWeekdayInTimezone(new Date(), timezone) === "Mon" &&
      !todayNotifications.has(`${client.id}:weekly_summary`) &&
      isWithinWindow(nowMinutes, reminderMinutes, 60)
    ) {
      await sendWeeklySummaryEmail({
        clientName: client.full_name,
        to: client.email,
        summaryText: buildWeeklySummaryText(weeklyClientCheckIns),
      });
      await insertNotificationLog(client.id, "weekly_summary");
      results.weeklySummaries += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    ...results,
  });
}
