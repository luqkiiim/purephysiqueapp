export type ClientStatus = "active" | "paused" | "inactive";
export type CoachNoteVisibility = "private" | "shared";

export interface CoachProfile {
  id: string;
  authUserId?: string | null;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface CoachClientDefaults {
  trainingPhase: string;
  proteinTargetGrams: number;
  stepTarget: number;
  exerciseExpectation: string;
  probioticsEnabled: boolean;
  fishOilEnabled: boolean;
  welcomeMessage: string;
}

export interface CoachDashboardPreferences {
  rosterSort: "name" | "streak" | "adherence";
  chartWindowDays: 14 | 30 | 42;
  followUpCount: 4 | 6 | 8;
  highlightMissedClients: boolean;
}

export interface ClientProfile {
  id: string;
  clientId: string;
  goalSummary: string;
  trainingPhase: string;
  timezone: string;
  coachingStartDate: string;
  welcomeMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientTargets {
  id: string;
  clientId: string;
  proteinTargetGrams: number;
  stepTarget: number;
  exerciseExpectation: string;
  probioticsEnabled: boolean;
  fishOilEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderSettings {
  id: string;
  clientId: string;
  emailRemindersEnabled: boolean;
  missedDayNudgesEnabled: boolean;
  reminderTime: string;
  weeklySummaryEnabled: boolean;
  timezone: string;
}

export interface Client {
  id: string;
  coachId: string;
  authUserId?: string | null;
  fullName: string;
  email: string;
  inviteToken: string;
  activeStatus: ClientStatus;
  currentStreak: number;
  lastCheckInDate?: string | null;
  createdAt: string;
  profile: ClientProfile;
  targets: ClientTargets;
  reminderSettings: ReminderSettings;
}

export interface ExerciseEntry {
  type: string;
  durationMinutes: number;
}

export interface DailyCheckIn {
  id: string;
  clientId: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  totalSleepHours: number;
  proteinGrams: number;
  proteinTargetSnapshot: number;
  steps: number;
  stepTargetSnapshot: number;
  hydrationLiters: number;
  exerciseEntries: ExerciseEntry[];
  exerciseType: string;
  exerciseDurationMinutes: number;
  probioticsChecked: boolean;
  fishOilChecked: boolean;
  bodyWeight: number;
  mealNotes?: string | null;
  completionPercentage: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressPhoto {
  id: string;
  clientId: string;
  date: string;
  imageUrl: string;
  note?: string | null;
  createdAt: string;
}

export interface CoachNote {
  id: string;
  clientId: string;
  coachId: string;
  note: string;
  visibility: CoachNoteVisibility;
  createdAt: string;
}

export interface ClientFeedbackMessage {
  id: string;
  clientId: string;
  coachId: string;
  message: string;
  createdAt: string;
}

export interface WeeklySummary {
  weekLabel: string;
  adherencePercent: number;
  averageProtein: number;
  averageSteps: number;
  averageHydrationLiters: number;
  workoutsCompleted: number;
  supplementAdherencePercent: number;
  averageSleepHours: number;
}

export interface DashboardSummaryCard {
  label: string;
  value: string;
  hint: string;
  tone: "neutral" | "success" | "warning" | "accent";
}

export interface ClientStatusRow {
  id: string;
  fullName: string;
  email: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "neutral";
  streak: number;
  proteinConsistency: number;
  stepConsistency: number;
  recentWeight: number;
  lastCheckInDate?: string | null;
}

export interface CoachDashboardData {
  coach: CoachProfile;
  dashboardPreferences: CoachDashboardPreferences;
  summaryCards: DashboardSummaryCard[];
  clients: ClientStatusRow[];
  adherenceTrend: Array<{ label: string; adherence: number; weightDelta: number }>;
  todayCheckInSnapshot: Array<{ label: string; value: number }>;
  momentumClients: Array<{ id: string; fullName: string; streak: number; adherence: number }>;
}

export interface ClientHomeData {
  client: Client;
  todaysCheckIn?: DailyCheckIn | null;
  recentCheckIns: DailyCheckIn[];
  progressPhotos: ProgressPhoto[];
  feedbackMessages: ClientFeedbackMessage[];
  sharedCoachNotes: CoachNote[];
  weeklySummary: WeeklySummary[];
}

export interface CoachClientDetailData {
  coach: CoachProfile;
  client: Client;
  todaysCheckIn?: DailyCheckIn | null;
  recentCheckIns: DailyCheckIn[];
  progressPhotos: ProgressPhoto[];
  coachNotes: CoachNote[];
  feedbackMessages: ClientFeedbackMessage[];
  weeklySummary: WeeklySummary[];
}
