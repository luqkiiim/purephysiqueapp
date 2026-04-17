import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Client,
  ClientFeedbackMessage,
  CoachNote,
  CoachProfile,
  ClientStatusSource,
  ClientSupplementTargetSource,
  DailyCheckIn,
  ProgressPhoto,
  ReminderSettings,
} from "@/lib/types/app";
import {
  formatExerciseSummary,
  getExerciseTotalDuration,
  parseExerciseEntries,
} from "@/lib/utils";

interface CoachProfileRow {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface ClientRow {
  id: string;
  coach_id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  invite_token: string;
  active_status: Client["activeStatus"];
  current_streak: number;
  last_check_in_date: string | null;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ClientProfileRow {
  id: string;
  client_id: string;
  goal_summary: string;
  training_phase: string;
  timezone: string;
  coaching_start_date: string;
  welcome_message: string;
  created_at: string;
  updated_at: string;
}

interface ClientStatusSourceRow {
  id: string;
  full_name: string;
  email: string;
  active_status: Client["activeStatus"];
  current_streak: number;
  last_check_in_date: string | null;
}

interface ClientSupplementTargetSourceRow {
  client_id: string;
  probiotics_enabled: boolean;
  fish_oil_enabled: boolean;
}

interface ClientTargetRow {
  id: string;
  client_id: string;
  protein_target_grams: number;
  step_target: number;
  exercise_expectation: string;
  probiotics_enabled: boolean;
  fish_oil_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface ReminderSettingsRow {
  id: string;
  client_id: string;
  email_reminders_enabled: boolean;
  missed_day_nudges_enabled: boolean;
  reminder_time: string;
  weekly_summary_enabled: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface DailyCheckInRow {
  id: string;
  client_id: string;
  date: string;
  bedtime: string;
  wake_time: string;
  total_sleep_hours: number;
  protein_grams: number;
  protein_target_snapshot: number;
  steps: number;
  step_target_snapshot: number;
  hydration_liters: number;
  exercise_type: string;
  exercise_duration_minutes: number;
  probiotics_checked: boolean;
  fish_oil_checked: boolean;
  body_weight: number;
  meal_notes: string | null;
  completion_percentage: number;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

interface ProgressPhotoRow {
  id: string;
  client_id: string;
  daily_check_in_id: string | null;
  date: string;
  storage_path: string;
  image_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

interface CoachNoteRow {
  id: string;
  client_id: string;
  coach_id: string;
  note: string;
  visibility: CoachNote["visibility"];
  created_at: string;
}

interface ClientFeedbackMessageRow {
  id: string;
  client_id: string;
  coach_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

interface ClientInviteSummaryRow {
  id: string;
  full_name: string;
  email: string;
  invite_token: string;
  active_status: Client["activeStatus"];
  created_at: string;
}

function asBoolean(value: boolean | number | string | null | undefined) {
  return value === true || value === 1 || value === "1";
}

function throwIfError(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function mapCoach(row: CoachProfileRow): CoachProfile {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    fullName: row.full_name,
    email: row.email,
    createdAt: row.created_at,
  };
}

function mapReminderSettings(row: ReminderSettingsRow): ReminderSettings {
  return {
    id: row.id,
    clientId: row.client_id,
    emailRemindersEnabled: asBoolean(row.email_reminders_enabled),
    missedDayNudgesEnabled: asBoolean(row.missed_day_nudges_enabled),
    reminderTime: row.reminder_time,
    weeklySummaryEnabled: asBoolean(row.weekly_summary_enabled),
    timezone: row.timezone,
  };
}

function mapClientStatusSource(row: ClientStatusSourceRow): ClientStatusSource {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    activeStatus: row.active_status,
    currentStreak: Number(row.current_streak ?? 0),
    lastCheckInDate: row.last_check_in_date,
  };
}

function mapClientSupplementTargetSource(
  row: ClientSupplementTargetSourceRow,
): ClientSupplementTargetSource {
  return {
    clientId: row.client_id,
    probioticsEnabled: asBoolean(row.probiotics_enabled),
    fishOilEnabled: asBoolean(row.fish_oil_enabled),
  };
}

function mapClientBundle(
  client: ClientRow,
  profile: ClientProfileRow | undefined,
  targets: ClientTargetRow | undefined,
  reminderSettings: ReminderSettingsRow | undefined,
): Client | null {
  if (!profile || !targets || !reminderSettings) {
    return null;
  }

  return {
    id: client.id,
    coachId: client.coach_id,
    authUserId: client.auth_user_id,
    fullName: client.full_name,
    email: client.email,
    inviteToken: client.invite_token,
    activeStatus: client.active_status,
    currentStreak: Number(client.current_streak ?? 0),
    lastCheckInDate: client.last_check_in_date,
    createdAt: client.created_at,
    profile: {
      id: profile.id,
      clientId: profile.client_id,
      goalSummary: profile.goal_summary,
      trainingPhase: profile.training_phase,
      timezone: profile.timezone,
      coachingStartDate: profile.coaching_start_date,
      welcomeMessage: profile.welcome_message,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
    targets: {
      id: targets.id,
      clientId: targets.client_id,
      proteinTargetGrams: Number(targets.protein_target_grams ?? 0),
      stepTarget: Number(targets.step_target ?? 0),
      exerciseExpectation: targets.exercise_expectation,
      probioticsEnabled: asBoolean(targets.probiotics_enabled),
      fishOilEnabled: asBoolean(targets.fish_oil_enabled),
      createdAt: targets.created_at,
      updatedAt: targets.updated_at,
    },
    reminderSettings: mapReminderSettings(reminderSettings),
  };
}

function mapDailyCheckIn(row: DailyCheckInRow): DailyCheckIn {
  const exerciseEntries = parseExerciseEntries(
    row.exercise_type,
    Number(row.exercise_duration_minutes ?? 0),
  );

  return {
    id: row.id,
    clientId: row.client_id,
    date: row.date,
    bedtime: row.bedtime.slice(0, 5),
    wakeTime: row.wake_time.slice(0, 5),
    totalSleepHours: Number(row.total_sleep_hours ?? 0),
    proteinGrams: Number(row.protein_grams ?? 0),
    proteinTargetSnapshot: Number(row.protein_target_snapshot ?? 0),
    steps: Number(row.steps ?? 0),
    stepTargetSnapshot: Number(row.step_target_snapshot ?? 0),
    hydrationLiters: Number(row.hydration_liters ?? 0),
    exerciseEntries,
    exerciseType: formatExerciseSummary(exerciseEntries),
    exerciseDurationMinutes: getExerciseTotalDuration(exerciseEntries),
    probioticsChecked: asBoolean(row.probiotics_checked),
    fishOilChecked: asBoolean(row.fish_oil_checked),
    bodyWeight: Number(row.body_weight ?? 0),
    mealNotes: row.meal_notes,
    completionPercentage: Number(row.completion_percentage ?? 0),
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProgressPhoto(row: ProgressPhotoRow): ProgressPhoto {
  return {
    id: row.id,
    clientId: row.client_id,
    date: row.date,
    imageUrl: row.image_url ?? row.storage_path,
    note: row.note,
    createdAt: row.created_at,
  };
}

function mapCoachNote(row: CoachNoteRow): CoachNote {
  return {
    id: row.id,
    clientId: row.client_id,
    coachId: row.coach_id,
    note: row.note,
    visibility: row.visibility,
    createdAt: row.created_at,
  };
}

function mapFeedbackMessage(row: ClientFeedbackMessageRow): ClientFeedbackMessage {
  return {
    id: row.id,
    clientId: row.client_id,
    coachId: row.coach_id,
    message: row.message,
    createdAt: row.created_at,
  };
}

async function fetchClientRelations(clientIds: string[]) {
  if (!clientIds.length) {
    return {
      profilesByClientId: new Map<string, ClientProfileRow>(),
      targetsByClientId: new Map<string, ClientTargetRow>(),
      remindersByClientId: new Map<string, ReminderSettingsRow>(),
    };
  }

  const admin = createSupabaseAdminClient();
  const [profilesResult, targetsResult, remindersResult] = await Promise.all([
    admin.from("client_profiles").select("*").in("client_id", clientIds),
    admin.from("client_targets").select("*").in("client_id", clientIds),
    admin.from("reminder_settings").select("*").in("client_id", clientIds),
  ]);

  throwIfError(profilesResult.error, "Failed to fetch client profiles");
  throwIfError(targetsResult.error, "Failed to fetch client targets");
  throwIfError(remindersResult.error, "Failed to fetch reminder settings");

  return {
    profilesByClientId: new Map(
      ((profilesResult.data ?? []) as ClientProfileRow[]).map((row) => [row.client_id, row]),
    ),
    targetsByClientId: new Map(
      ((targetsResult.data ?? []) as ClientTargetRow[]).map((row) => [row.client_id, row]),
    ),
    remindersByClientId: new Map(
      ((remindersResult.data ?? []) as ReminderSettingsRow[]).map((row) => [row.client_id, row]),
    ),
  };
}

async function hydrateClients(rows: ClientRow[]) {
  const { profilesByClientId, targetsByClientId, remindersByClientId } =
    await fetchClientRelations(rows.map((row) => row.id));

  return rows
    .map((row) =>
      mapClientBundle(
        row,
        profilesByClientId.get(row.id),
        targetsByClientId.get(row.id),
        remindersByClientId.get(row.id),
      ),
    )
    .filter((client): client is Client => client !== null);
}

async function hydrateClient(row: ClientRow | null) {
  if (!row) {
    return null;
  }

  const [client] = await hydrateClients([row]);
  return client ?? null;
}

export async function linkCoachAuthIdentityByEmail(userId: string, email: string) {
  const admin = createSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const nowIso = new Date().toISOString();

  const coach = await getCoachByEmail(normalizedEmail);

  if (coach && !coach.authUserId) {
    const result = await admin
      .from("coach_profiles")
      .update({
        auth_user_id: userId,
        updated_at: nowIso,
      })
      .eq("id", coach.id);

    throwIfError(result.error, "Failed to link coach auth identity");
  }
}

export async function syncClientAuthIdentity(
  clientId: string,
  userId: string,
  email: string,
  nowIso: string,
) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("clients")
    .update({
      auth_user_id: userId,
      email,
      last_accessed_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", clientId);

  throwIfError(result.error, "Failed to link client auth identity");
}

export async function getCoachByAuthUserId(authUserId: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("coach_profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  throwIfError(result.error, "Failed to fetch coach by auth user id");
  return result.data ? mapCoach(result.data as CoachProfileRow) : null;
}

export async function getCoachByEmail(email: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("coach_profiles")
    .select("*")
    .ilike("email", email.trim())
    .maybeSingle();

  throwIfError(result.error, "Failed to fetch coach by email");
  return result.data ? mapCoach(result.data as CoachProfileRow) : null;
}

export async function getClientBundleById(clientId: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();

  throwIfError(result.error, "Failed to fetch client by id");
  return hydrateClient((result.data as ClientRow | null) ?? null);
}

export async function getClientBundleByAccessCode(accessCode: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("clients")
    .select("*")
    .ilike("invite_token", accessCode.trim())
    .maybeSingle();

  throwIfError(result.error, "Failed to fetch client by access code");
  return hydrateClient((result.data as ClientRow | null) ?? null);
}

export async function getClientAccessCodeSummary(accessCode: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("clients")
    .select("id, full_name, email, invite_token, active_status, created_at")
    .ilike("invite_token", accessCode.trim())
    .maybeSingle();

  throwIfError(result.error, "Failed to fetch client access code summary");

  const row = result.data as ClientInviteSummaryRow | null;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    inviteToken: row.invite_token,
    activeStatus: row.active_status,
    createdAt: row.created_at,
  };
}

export async function listClientBundlesByCoachId(coachId: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("clients")
    .select("*")
    .eq("coach_id", coachId)
    .order("full_name", { ascending: true });

  throwIfError(result.error, "Failed to list clients by coach");
  return hydrateClients((result.data ?? []) as ClientRow[]);
}

export async function listClientStatusSourcesByCoachId(coachId: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("clients")
    .select("id, full_name, email, active_status, current_streak, last_check_in_date")
    .eq("coach_id", coachId)
    .order("full_name", { ascending: true });

  throwIfError(result.error, "Failed to list client status sources by coach");
  return ((result.data ?? []) as ClientStatusSourceRow[]).map(mapClientStatusSource);
}

export async function listClientSupplementTargets(clientIds: string[]) {
  if (!clientIds.length) {
    return [];
  }

  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("client_targets")
    .select("client_id, probiotics_enabled, fish_oil_enabled")
    .in("client_id", clientIds);

  throwIfError(result.error, "Failed to list client supplement targets");
  return ((result.data ?? []) as ClientSupplementTargetSourceRow[]).map(
    mapClientSupplementTargetSource,
  );
}

export async function getClientBundleByCoachAndId(coachId: string, clientId: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("clients")
    .select("*")
    .eq("coach_id", coachId)
    .eq("id", clientId)
    .maybeSingle();

  throwIfError(result.error, "Failed to fetch client by coach and id");
  return hydrateClient((result.data as ClientRow | null) ?? null);
}

export async function listDailyCheckInsForClient(clientId: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("daily_check_ins")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: true });

  throwIfError(result.error, "Failed to list client check-ins");
  return ((result.data ?? []) as DailyCheckInRow[]).map(mapDailyCheckIn);
}

export async function getLatestDailyCheckInForClient(clientId: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("daily_check_ins")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  throwIfError(result.error, "Failed to fetch latest client check-in");
  return result.data ? mapDailyCheckIn(result.data as DailyCheckInRow) : null;
}

export async function listRecentDailyCheckInsForClient(clientId: string, limit = 45) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("daily_check_ins")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(limit);

  throwIfError(result.error, "Failed to list recent client check-ins");

  return ((result.data ?? []) as DailyCheckInRow[])
    .reverse()
    .map(mapDailyCheckIn);
}

export async function getDailyCheckInForClientByDate(clientId: string, date: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("daily_check_ins")
    .select("*")
    .eq("client_id", clientId)
    .eq("date", date)
    .maybeSingle();

  throwIfError(result.error, "Failed to fetch client check-in by date");
  return result.data ? mapDailyCheckIn(result.data as DailyCheckInRow) : null;
}

export async function listDailyCheckInsForClients(clientIds: string[], sinceDate?: string) {
  if (!clientIds.length) {
    return [];
  }

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("daily_check_ins")
    .select("*")
    .in("client_id", clientIds)
    .order("date", { ascending: true });

  if (sinceDate) {
    query = query.gte("date", sinceDate);
  }

  const result = await query;
  throwIfError(result.error, "Failed to list check-ins for clients");
  return ((result.data ?? []) as DailyCheckInRow[]).map(mapDailyCheckIn);
}

export async function listProgressPhotosForClient(clientId: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("progress_photos")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  throwIfError(result.error, "Failed to list progress photos");
  return ((result.data ?? []) as ProgressPhotoRow[]).map(mapProgressPhoto);
}

export async function listCoachNotesForClient(
  clientId: string,
  visibility?: "private" | "shared",
) {
  const admin = createSupabaseAdminClient();
  let query = admin
    .from("coach_notes")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (visibility) {
    query = query.eq("visibility", visibility);
  }

  const result = await query;
  throwIfError(result.error, "Failed to list coach notes");
  return ((result.data ?? []) as CoachNoteRow[]).map(mapCoachNote);
}

export async function listFeedbackMessagesForClient(clientId: string) {
  const admin = createSupabaseAdminClient();
  const result = await admin
    .from("client_feedback_messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  throwIfError(result.error, "Failed to list feedback messages");
  return ((result.data ?? []) as ClientFeedbackMessageRow[]).map(mapFeedbackMessage);
}
