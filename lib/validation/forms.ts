import { z } from "zod";

const booleanField = z.preprocess(
  (value) => value === true || value === "true" || value === "on",
  z.boolean(),
);

export const coachLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const clientAccessClaimSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  accessCode: z.string().trim().min(6).max(64),
});

export const clientAccessLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const clientProfileSchema = z.object({
  clientId: z.string().optional().default(""),
  fullName: z.string().min(2).max(120),
  goalSummary: z.string().trim().max(400),
  trainingPhase: z.string().min(2).max(80),
  proteinTargetGrams: z.coerce.number().int().min(60).max(350),
  stepTarget: z.coerce.number().int().min(1000).max(30000),
  exerciseExpectation: z.string().min(2).max(120),
  probioticsEnabled: booleanField,
  fishOilEnabled: booleanField,
  welcomeMessage: z.string().trim().max(240),
});

export const coachProfileSettingsSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
});

export const coachClientDefaultsSettingsSchema = z.object({
  trainingPhase: z.string().trim().min(2).max(80),
  proteinTargetGrams: z.coerce.number().int().min(60).max(350),
  stepTarget: z.coerce.number().int().min(1000).max(30000),
  exerciseExpectation: z.string().trim().min(2).max(120),
  probioticsEnabled: booleanField,
  fishOilEnabled: booleanField,
  welcomeMessage: z.string().trim().max(240),
});

export const coachDashboardPreferencesSchema = z.object({
  rosterSort: z.enum(["name", "streak", "adherence"]),
  chartWindowDays: z.union([z.literal(14), z.literal(30), z.literal(42)]),
  followUpCount: z.union([z.literal(4), z.literal(6), z.literal(8)]),
  highlightMissedClients: booleanField,
});

export const coachNoteSchema = z.object({
  clientId: z.string().uuid().or(z.string().min(3)),
  note: z.string().min(4).max(1000),
  visibility: z.enum(["private", "shared"]),
});

export const feedbackMessageSchema = z.object({
  clientId: z.string().uuid().or(z.string().min(3)),
  message: z.string().min(4).max(600),
});

export const deleteClientSchema = z.object({
  clientId: z.string().uuid().or(z.string().min(3)),
  confirmationName: z.string().trim().min(2).max(120),
});

const exerciseEntrySchema = z.object({
  type: z.string().trim().min(2).max(80),
  durationMinutes: z.coerce.number().int().min(0).max(360),
});

export const dailyCheckInSchema = z.object({
  bedtime: z.string().regex(/^\d{2}:\d{2}$/),
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/),
  totalSleepHours: z.coerce.number().min(0).max(24),
  proteinGrams: z.coerce.number().int().min(0).max(500),
  steps: z.coerce.number().int().min(0).max(50000),
  hydrationLiters: z.coerce.number().min(0).max(12),
  exerciseEntries: z.array(exerciseEntrySchema).min(1).max(6),
  probioticsChecked: booleanField,
  fishOilChecked: booleanField,
  bodyWeight: z.coerce.number().min(0).max(999),
  mealNotes: z.string().max(280).optional().or(z.literal("")),
});

export const coachBackfillCheckInSchema = dailyCheckInSchema.extend({
  clientId: z.string().uuid().or(z.string().min(3)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
