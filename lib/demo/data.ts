import { subDays } from "date-fns";

import { getClientAccountEmail } from "@/lib/access-codes";
import { defaultCoachDashboardPreferences } from "@/lib/coach-settings";
import type {
  Client,
  ClientCoachUpdate,
  ClientFeedbackMessage,
  ClientStatusRow,
  CoachClientDetailData,
  CoachDashboardData,
  CoachNote,
  CoachProfile,
  DailyCheckIn,
  ProgressPhoto,
  WeeklySummary,
} from "@/lib/types/app";
import {
  calculateCompletionPercentage,
  describeCheckInStatus,
  getTodayIsoDate,
  percentageAgainstTarget,
} from "@/lib/utils";

const coach: CoachProfile = {
  id: "coach_01",
  authUserId: "auth_coach_01",
  fullName: "Imran Ismadi",
  email: "coach@purephysique.app",
  createdAt: "2026-01-02T08:00:00.000Z",
};

function createDemoClient(
  index: number,
  partial: Partial<Client>,
): Client {
  const id = partial.id ?? `client_${index}`;
  const createdAt = partial.createdAt ?? "2026-01-12T08:00:00.000Z";

  return {
    id,
    coachId: coach.id,
    fullName: partial.fullName ?? `Client ${index}`,
    email: partial.email ?? `client${index}@example.com`,
    inviteToken: partial.inviteToken ?? `invite-token-${id}`,
    activeStatus: partial.activeStatus ?? "active",
    currentStreak: partial.currentStreak ?? 0,
    lastCheckInDate: partial.lastCheckInDate ?? getTodayIsoDate(),
    createdAt,
    profile: {
      id: `profile_${id}`,
      clientId: id,
      goalSummary: partial.profile?.goalSummary ?? "Fat loss while preserving lean muscle.",
      trainingPhase: partial.profile?.trainingPhase ?? "Build consistency",
      timezone: partial.profile?.timezone ?? "Asia/Kuala_Lumpur",
      coachingStartDate: partial.profile?.coachingStartDate ?? "2026-01-15",
      welcomeMessage:
        partial.profile?.welcomeMessage ??
        "Small daily wins compound. Keep the streak alive and the dashboard handles the rest.",
      createdAt,
      updatedAt: createdAt,
    },
    targets: {
      id: `targets_${id}`,
      clientId: id,
      proteinTargetGrams: partial.targets?.proteinTargetGrams ?? 150,
      stepTarget: partial.targets?.stepTarget ?? 9000,
      exerciseExpectation: partial.targets?.exerciseExpectation ?? "4 training sessions / week",
      probioticsEnabled: partial.targets?.probioticsEnabled ?? true,
      fishOilEnabled: partial.targets?.fishOilEnabled ?? true,
      createdAt,
      updatedAt: createdAt,
    },
    reminderSettings: {
      id: `reminder_${id}`,
      clientId: id,
      emailRemindersEnabled: true,
      missedDayNudgesEnabled: true,
      reminderTime: "19:00:00",
      weeklySummaryEnabled: true,
      timezone: partial.reminderSettings?.timezone ?? "Asia/Kuala_Lumpur",
    },
  };
}

export const demoClients: Client[] = [
  createDemoClient(1, {
    id: "client_ava",
    fullName: "Ava Morgan",
    email: "ava@example.com",
    currentStreak: 12,
    inviteToken: "invite-client-ava",
    targets: {
      id: "targets_client_ava",
      clientId: "client_ava",
      proteinTargetGrams: 145,
      stepTarget: 9500,
      exerciseExpectation: "5 movement blocks / week",
      probioticsEnabled: true,
      fishOilEnabled: true,
      createdAt: "2026-01-12T08:00:00.000Z",
      updatedAt: "2026-01-12T08:00:00.000Z",
    },
    profile: {
      id: "profile_client_ava",
      clientId: "client_ava",
      goalSummary: "Tighten nutrition habits and maintain strength.",
      trainingPhase: "Lean phase",
      timezone: "Asia/Kuala_Lumpur",
      coachingStartDate: "2026-01-15",
      welcomeMessage:
        "The goal this phase is consistent protein and a calm evening routine.",
      createdAt: "2026-01-12T08:00:00.000Z",
      updatedAt: "2026-01-12T08:00:00.000Z",
    },
  }),
  createDemoClient(2, {
    id: "client_noah",
    fullName: "Noah Bennett",
    email: "noah@example.com",
    currentStreak: 5,
    inviteToken: "invite-client-noah",
    targets: {
      id: "targets_client_noah",
      clientId: "client_noah",
      proteinTargetGrams: 180,
      stepTarget: 11000,
      exerciseExpectation: "4 lifts + 2 cardio blocks",
      probioticsEnabled: false,
      fishOilEnabled: true,
      createdAt: "2026-01-12T08:00:00.000Z",
      updatedAt: "2026-01-12T08:00:00.000Z",
    },
    profile: {
      id: "profile_client_noah",
      clientId: "client_noah",
      goalSummary: "Body recomposition with better weekday adherence.",
      trainingPhase: "Recomp",
      timezone: "Asia/Kuala_Lumpur",
      coachingStartDate: "2026-01-18",
      welcomeMessage:
        "Fast check-ins matter more than perfect detail. Keep it under a minute.",
      createdAt: "2026-01-12T08:00:00.000Z",
      updatedAt: "2026-01-12T08:00:00.000Z",
    },
  }),
  createDemoClient(3, {
    id: "client_mia",
    fullName: "Mia Patel",
    email: "mia@example.com",
    currentStreak: 0,
    inviteToken: "invite-client-mia",
    lastCheckInDate: subDays(new Date(), 1).toISOString().slice(0, 10),
    targets: {
      id: "targets_client_mia",
      clientId: "client_mia",
      proteinTargetGrams: 130,
      stepTarget: 8500,
      exerciseExpectation: "3 training sessions + 2 walks",
      probioticsEnabled: true,
      fishOilEnabled: false,
      createdAt: "2026-01-12T08:00:00.000Z",
      updatedAt: "2026-01-12T08:00:00.000Z",
    },
    profile: {
      id: "profile_client_mia",
      clientId: "client_mia",
      goalSummary: "Improve consistency and sleep before pushing training volume.",
      trainingPhase: "Foundation",
      timezone: "Asia/Kuala_Lumpur",
      coachingStartDate: "2026-02-01",
      welcomeMessage:
        "Momentum is the metric. We are building routines first and intensity second.",
      createdAt: "2026-01-12T08:00:00.000Z",
      updatedAt: "2026-01-12T08:00:00.000Z",
    },
  }),
];

function createDemoCheckIns(client: Client, baseWeight: number) {
  return Array.from({ length: 14 }, (_, offset): DailyCheckIn => {
    const day = subDays(new Date(), 13 - offset);
    const completed = offset !== 8 || client.id !== "client_mia";
    const protein = client.targets.proteinTargetGrams - (offset % 3) * 10 + 6;
    const steps = client.targets.stepTarget - (offset % 4) * 900 + 500;
    const supplements =
      client.targets.probioticsEnabled || client.targets.fishOilEnabled;

    return {
      id: `${client.id}_checkin_${offset}`,
      clientId: client.id,
      date: day.toISOString().slice(0, 10),
      bedtime: "22:45",
      wakeTime: "06:20",
      totalSleepHours: 7.1 + ((offset % 4) * 0.2),
      proteinGrams: Math.max(85, protein),
      proteinTargetSnapshot: client.targets.proteinTargetGrams,
      steps: Math.max(3800, steps),
      stepTargetSnapshot: client.targets.stepTarget,
      hydrationLiters: Number((2.1 + (offset % 4) * 0.3).toFixed(1)),
      exerciseEntries: [
        {
          type: offset % 2 === 0 ? "Strength" : "Walk + Mobility",
          durationMinutes: offset % 2 === 0 ? 50 : 35,
        },
      ],
      exerciseType: offset % 2 === 0 ? "Strength" : "Walk + Mobility",
      exerciseDurationMinutes: offset % 2 === 0 ? 50 : 35,
      probioticsChecked: client.targets.probioticsEnabled ? offset % 5 !== 0 : false,
      fishOilChecked: client.targets.fishOilEnabled ? offset % 4 !== 0 : false,
      bodyWeight: Number((baseWeight - offset * 0.08 + (offset % 2) * 0.1).toFixed(1)),
      mealNotes: completed
        ? "Kept meals simple. Protein was easiest when prepped ahead."
        : "Missed check-in.",
      completionPercentage: completed
        ? calculateCompletionPercentage([
            "22:45",
            "06:20",
            7.1 + ((offset % 4) * 0.2),
            protein,
            steps,
            2.1 + (offset % 4) * 0.3,
            "Strength",
            50,
            supplements,
            baseWeight,
          ])
        : 30,
      submittedAt: day.toISOString(),
      createdAt: day.toISOString(),
      updatedAt: day.toISOString(),
    };
  });
}

export const demoCheckIns = [
  ...createDemoCheckIns(demoClients[0], 65.3),
  ...createDemoCheckIns(demoClients[1], 81.8),
  ...createDemoCheckIns(demoClients[2], 58.1),
];

export const demoProgressPhotos: ProgressPhoto[] = [
  {
    id: "photo_1",
    clientId: "client_ava",
    date: getTodayIsoDate(),
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    note: "Week 6 check-in",
    createdAt: "2026-03-11T08:10:00.000Z",
  },
  {
    id: "photo_2",
    clientId: "client_ava",
    date: subDays(new Date(), 7).toISOString().slice(0, 10),
    imageUrl:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    note: "Front pose",
    createdAt: "2026-03-04T08:10:00.000Z",
  },
  {
    id: "photo_3",
    clientId: "client_noah",
    date: subDays(new Date(), 3).toISOString().slice(0, 10),
    imageUrl:
      "https://images.unsplash.com/photo-1571019613914-85f342c55f55?auto=format&fit=crop&w=800&q=80",
    note: "Mid-week snap",
    createdAt: "2026-03-08T08:10:00.000Z",
  },
];

export const demoCoachNotes: CoachNote[] = [
  {
    id: "note_1",
    clientId: "client_ava",
    coachId: coach.id,
    note: "Energy looks good. Keep pushing evening prep so protein stays automatic.",
    visibility: "private",
    createdAt: "2026-03-10T09:00:00.000Z",
  },
  {
    id: "note_2",
    clientId: "client_ava",
    coachId: coach.id,
    note: "Sleep trend is moving in the right direction. Great work on consistency.",
    visibility: "shared",
    createdAt: "2026-03-09T09:00:00.000Z",
  },
  {
    id: "note_3",
    clientId: "client_noah",
    coachId: coach.id,
    note: "Weekend steps dip hard. Set a Saturday floor target instead of aiming for perfect.",
    visibility: "private",
    createdAt: "2026-03-09T09:00:00.000Z",
  },
];

export const demoFeedbackMessages: ClientFeedbackMessage[] = [
  {
    id: "msg_1",
    clientId: "client_ava",
    coachId: coach.id,
    message: "You’ve stacked 12 straight days. Keep today simple and protect the streak.",
    createdAt: "2026-03-11T07:15:00.000Z",
  },
  {
    id: "msg_2",
    clientId: "client_noah",
    coachId: coach.id,
    message: "Protein is steady. Steps are the easiest win this week, so make the evening walk non-negotiable.",
    createdAt: "2026-03-10T07:15:00.000Z",
  },
  {
    id: "msg_3",
    clientId: "client_mia",
    coachId: coach.id,
    message: "If yesterday slipped, reset with one quick check-in today. No catch-up needed.",
    createdAt: "2026-03-11T06:45:00.000Z",
  },
];

function buildWeeklySummary(client: Client): WeeklySummary[] {
  return [
    {
      weekLabel: "This week",
      adherencePercent: client.id === "client_mia" ? 64 : 88,
      averageProtein: client.targets.proteinTargetGrams - 6,
      averageSteps: client.targets.stepTarget - 720,
      averageHydrationLiters: client.id === "client_mia" ? 2.1 : 2.8,
      workoutsCompleted: client.id === "client_noah" ? 4 : 5,
      supplementAdherencePercent: client.id === "client_noah" ? 91 : 95,
      averageSleepHours: 7.2,
    },
    {
      weekLabel: "Last week",
      adherencePercent: client.id === "client_mia" ? 57 : 82,
      averageProtein: client.targets.proteinTargetGrams - 11,
      averageSteps: client.targets.stepTarget - 1100,
      averageHydrationLiters: client.id === "client_mia" ? 1.9 : 2.5,
      workoutsCompleted: client.id === "client_noah" ? 3 : 4,
      supplementAdherencePercent: 86,
      averageSleepHours: 6.9,
    },
  ];
}

export function getDemoCoachDashboardData(): CoachDashboardData {
  const rows: ClientStatusRow[] = demoClients.map((client) => {
    const recentCheckIns = demoCheckIns.filter((entry) => entry.clientId === client.id).slice(-7);
    const latest = recentCheckIns.at(-1);
    const proteinConsistency = Math.round(
      recentCheckIns.reduce(
        (acc, entry) => acc + percentageAgainstTarget(entry.proteinGrams, entry.proteinTargetSnapshot),
        0,
      ) / recentCheckIns.length,
    );
    const stepConsistency = Math.round(
      recentCheckIns.reduce(
        (acc, entry) => acc + percentageAgainstTarget(entry.steps, entry.stepTargetSnapshot),
        0,
      ) / recentCheckIns.length,
    );
    const status = describeCheckInStatus(client.lastCheckInDate);
    const statusTone: ClientStatusRow["statusTone"] =
      status.tone === "success"
        ? "success"
        : client.activeStatus === "paused"
          ? "neutral"
          : "warning";
    const accountEmail = getClientAccountEmail(client.email);

    return {
      id: client.id,
      fullName: client.fullName,
      email: client.email,
      accountEmail,
      accountClaimed: Boolean(accountEmail),
      statusLabel: status.label,
      statusTone,
      streak: client.currentStreak,
      proteinConsistency,
      stepConsistency,
      recentWeight: latest?.bodyWeight ?? 0,
      lastCheckInDate: client.lastCheckInDate,
    };
  });

  return {
    coach,
    dashboardPreferences: defaultCoachDashboardPreferences,
    summaryCards: [
      {
        label: "Total clients",
        value: `${demoClients.length}`,
        hint: "One coach workspace",
        tone: "neutral",
      },
      {
        label: "Logged today",
        value: `${rows.filter((row) => row.statusLabel === "Logged today").length}`,
        hint: "Daily compliance snapshot",
        tone: "success",
      },
      {
        label: "Missed today",
        value: `${rows.filter((row) => row.statusLabel !== "Logged today").length}`,
        hint: "Needs follow-up",
        tone: "warning",
      },
      {
        label: "Active streaks",
        value: `${demoClients.filter((client) => client.currentStreak >= 5).length}`,
        hint: "Clients at 5+ days",
        tone: "accent",
      },
    ],
    clients: rows,
    adherenceTrend: Array.from({ length: 6 }, (_, index) => ({
      label: `W${index + 1}`,
      adherence: 71 + index * 3,
      weightDelta: Number((-0.6 + index * 0.18).toFixed(1)),
    })),
    todayCheckInSnapshot: [
      { label: "Protein target hit", value: 67 },
      { label: "Step target hit", value: 58 },
      { label: "Workout logged", value: 74 },
      { label: "Supplements checked", value: 82 },
    ],
    momentumClients: [...rows]
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3)
      .map((row) => ({
        id: row.id,
        fullName: row.fullName,
        streak: row.streak,
        adherence: Math.round((row.proteinConsistency + row.stepConsistency) / 2),
      })),
  };
}

export function getDemoClientDetailData(clientId: string): CoachClientDetailData {
  const client = demoClients.find((entry) => entry.id === clientId) ?? demoClients[0];
  const recentCheckIns = demoCheckIns
    .filter((entry) => entry.clientId === client.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    coach,
    client,
    todaysCheckIn: recentCheckIns.find((entry) => entry.date === getTodayIsoDate()) ?? recentCheckIns.at(-1),
    recentCheckIns,
    progressPhotoCount: demoProgressPhotos.filter((entry) => entry.clientId === client.id).length,
    coachNotes: demoCoachNotes.filter((entry) => entry.clientId === client.id),
    feedbackMessages: demoFeedbackMessages.filter((entry) => entry.clientId === client.id),
    weeklySummary: buildWeeklySummary(client),
  };
}

export function getDemoClientHomeData(clientId = "client_ava") {
  const detail = getDemoClientDetailData(clientId);
  const latestFeedbackMessage = detail.feedbackMessages[0];
  const latestSharedCoachNote = detail.coachNotes.find((entry) => entry.visibility === "shared");
  let latestCoachUpdate: ClientCoachUpdate | null = null;

  if (latestFeedbackMessage || latestSharedCoachNote) {
    if (!latestSharedCoachNote) {
      latestCoachUpdate = {
        type: "message",
        content: latestFeedbackMessage!.message,
        createdAt: latestFeedbackMessage!.createdAt,
      };
    } else if (!latestFeedbackMessage) {
      latestCoachUpdate = {
        type: "note",
        content: latestSharedCoachNote.note,
        createdAt: latestSharedCoachNote.createdAt,
      };
    } else {
      latestCoachUpdate =
        latestFeedbackMessage.createdAt >= latestSharedCoachNote.createdAt
          ? {
              type: "message",
              content: latestFeedbackMessage.message,
              createdAt: latestFeedbackMessage.createdAt,
            }
          : {
              type: "note",
              content: latestSharedCoachNote.note,
              createdAt: latestSharedCoachNote.createdAt,
            };
    }
  }

  return {
    client: detail.client,
    todaysCheckIn: detail.todaysCheckIn,
    recentCheckIns: detail.recentCheckIns,
    progressPhotos: demoProgressPhotos.filter((entry) => entry.clientId === detail.client.id),
    feedbackMessages: detail.feedbackMessages,
    sharedCoachNotes: detail.coachNotes.filter((entry) => entry.visibility === "shared"),
    latestCoachUpdate,
    weeklySummary: detail.weeklySummary,
  };
}

export function getDemoLandingHighlights() {
  return [
    {
      title: "60-second daily logging",
      description:
        "Clients move through one mobile-first screen with large tap targets and almost no typing.",
    },
    {
      title: "Coach command center",
      description:
        "See who logged, who missed, current streaks, trend snapshots, and client notes in one view.",
    },
    {
      title: "Claim-code access",
      description:
        "Clients use a coach-issued access code once, then sign in with email and password.",
    },
  ];
}

export { coach as demoCoachProfile };
