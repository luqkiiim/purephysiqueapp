"use client";

import { useState } from "react";
import {
  Camera,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Droplets,
  Footprints,
  Minus,
  MoonStar,
  Plus,
  Salad,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Textarea } from "@/components/ui/textarea";
import type { ExerciseEntry } from "@/lib/types/app";
import {
  calculateCompletionPercentage,
  formatExerciseSummary,
  getExerciseTotalDuration,
  parseExerciseEntries,
  percentageAgainstTarget,
} from "@/lib/utils";

interface DailyCheckInDefaults {
  bedtime?: string;
  wakeTime?: string;
  totalSleepHours?: number;
  proteinGrams?: number;
  steps?: number;
  hydrationLiters?: number;
  exerciseEntries?: ExerciseEntry[];
  exerciseType?: string;
  exerciseDurationMinutes?: number;
  probioticsChecked?: boolean;
  fishOilChecked?: boolean;
  bodyWeight?: number;
  mealNotes?: string | null;
}

interface ExerciseEntryDraft {
  id: string;
  type: string;
  durationMinutes: string;
}

interface DailyCheckInHiddenField {
  name: string;
  value: string;
}

interface DailyCheckInDateField {
  defaultValue: string;
  max?: string;
  label?: string;
  description?: string;
}

const SLEEP_TARGET_HOURS = 7;
const HYDRATION_TARGET_LITERS = 3;

function createExerciseEntryDraft(
  entry: Partial<ExerciseEntry> = {},
): ExerciseEntryDraft {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: entry.type ?? "",
    durationMinutes:
      entry.durationMinutes == null ? "" : String(entry.durationMinutes),
  };
}

function buildExerciseEntryDrafts(
  defaults?: DailyCheckInDefaults | null,
  fallbackEntry?: Partial<ExerciseEntry>,
) {
  const existingEntries =
    defaults?.exerciseEntries?.length
      ? defaults.exerciseEntries
      : parseExerciseEntries(
          defaults?.exerciseType,
          defaults?.exerciseDurationMinutes ?? 0,
        );

  if (existingEntries.length) {
    return existingEntries.map((entry) => createExerciseEntryDraft(entry));
  }

  return [createExerciseEntryDraft(fallbackEntry ?? { type: "Strength", durationMinutes: 45 })];
}

function normalizeExerciseEntries(
  entries: ExerciseEntryDraft[],
) {
  return entries
    .map((entry) => ({
      type: entry.type,
      durationMinutes:
        entry.durationMinutes === "" ? 0 : Number(entry.durationMinutes),
    }))
    .filter((entry) => entry.type.trim().length > 0);
}

function numericInputDefault(value?: number) {
  return value == null ? "" : String(value);
}

function numberFromInput(value: string) {
  const parsedValue = value.trim() === "" ? 0 : Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function normalizeNumberInput(value: string) {
  return value.replace(/^0+(?=\d)/, "");
}

function clearZeroInput(value: string) {
  return value === "0" ? "" : value;
}

export function DailyCheckInForm({
  action,
  defaults,
  proteinTarget,
  stepTarget,
  probioticsEnabled,
  fishOilEnabled,
  streak,
  submitted,
  dateField,
  hiddenFields = [],
  headerEyebrow = "Today's momentum",
  headerDescription = "Keep it quick. The goal is a complete check-in, not perfect detail.",
  submittedMessage = "Check-in complete. Keep tomorrow simple and protect the streak.",
  submitLabel = "Submit today's check-in",
  pendingLabel = "Saving check-in...",
  compactMode = false,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: DailyCheckInDefaults | null;
  proteinTarget: number;
  stepTarget: number;
  probioticsEnabled: boolean;
  fishOilEnabled: boolean;
  streak: number;
  submitted?: boolean;
  dateField?: DailyCheckInDateField;
  hiddenFields?: DailyCheckInHiddenField[];
  headerEyebrow?: string;
  headerDescription?: string;
  submittedMessage?: string;
  submitLabel?: string;
  pendingLabel?: string;
  compactMode?: boolean;
}) {
  const [showMoreDetails, setShowMoreDetails] = useState(!compactMode);
  const [checkInDate, setCheckInDate] = useState(dateField?.defaultValue ?? "");
  const [bedtime, setBedtime] = useState(defaults?.bedtime ?? "22:30");
  const [wakeTime, setWakeTime] = useState(defaults?.wakeTime ?? "06:30");
  const [totalSleepHours, setTotalSleepHours] = useState(
    numericInputDefault(defaults?.totalSleepHours),
  );
  const [proteinGrams, setProteinGrams] = useState(
    numericInputDefault(defaults?.proteinGrams),
  );
  const [steps, setSteps] = useState(numericInputDefault(defaults?.steps));
  const [hydrationLiters, setHydrationLiters] = useState(
    numericInputDefault(defaults?.hydrationLiters),
  );
  const [exerciseEntries, setExerciseEntries] = useState(() =>
    buildExerciseEntryDrafts(
      defaults,
      compactMode ? { type: "Rest day", durationMinutes: 0 } : { type: "Strength", durationMinutes: 45 },
    ),
  );
  const [probioticsChecked, setProbioticsChecked] = useState(
    defaults?.probioticsChecked ?? false,
  );
  const [fishOilChecked, setFishOilChecked] = useState(
    defaults?.fishOilChecked ?? false,
  );
  const [bodyWeightInput, setBodyWeightInput] = useState(
    defaults?.bodyWeight == null ? "" : String(defaults.bodyWeight),
  );
  const [mealNotes, setMealNotes] = useState(defaults?.mealNotes ?? "");

  const normalizedExerciseEntries = normalizeExerciseEntries(exerciseEntries);
  const showExpandedDetails = !compactMode || showMoreDetails;
  const primaryExerciseEntry = exerciseEntries[0]!;
  const exerciseSummary = formatExerciseSummary(normalizedExerciseEntries);
  const totalExerciseDurationMinutes = getExerciseTotalDuration(
    normalizedExerciseEntries,
  );
  const bodyWeight =
    bodyWeightInput.trim() === "" ? 0 : Number(bodyWeightInput);
  const totalSleepHoursValue = numberFromInput(totalSleepHours);
  const proteinGramsValue = numberFromInput(proteinGrams);
  const stepsValue = numberFromInput(steps);
  const hydrationLitersValue = numberFromInput(hydrationLiters);
  const completion = calculateCompletionPercentage([
    bedtime,
    wakeTime,
    totalSleepHoursValue,
    proteinGramsValue,
    stepsValue,
    hydrationLitersValue,
    exerciseSummary,
    totalExerciseDurationMinutes,
    bodyWeight,
    probioticsEnabled ? probioticsChecked : true,
    fishOilEnabled ? fishOilChecked : true,
  ]);

  const proteinPercent = percentageAgainstTarget(proteinGramsValue, proteinTarget);
  const stepPercent = percentageAgainstTarget(stepsValue, stepTarget);

  function updateExerciseEntry(
    id: string,
    field: "type" | "durationMinutes",
    value: string,
  ) {
    setExerciseEntries((currentEntries) =>
      currentEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  }

  function addExerciseEntry() {
    setExerciseEntries((currentEntries) => [
      ...currentEntries,
      createExerciseEntryDraft(),
    ]);
  }

  function removeExerciseEntry(id: string) {
    setExerciseEntries((currentEntries) =>
      currentEntries.filter((entry) => entry.id !== id),
    );
  }

  return (
    <form action={action} className="space-y-4 sm:space-y-5">
      {hiddenFields.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
      {compactMode && !showExpandedDetails ? (
        <>
          <input type="hidden" name="bedtime" value={bedtime} />
          <input type="hidden" name="wakeTime" value={wakeTime} />
          <input
            type="hidden"
            name="probioticsChecked"
            value={probioticsChecked ? "true" : "false"}
          />
          <input
            type="hidden"
            name="fishOilChecked"
            value={fishOilChecked ? "true" : "false"}
          />
          <input type="hidden" name="mealNotes" value={mealNotes} />
          {exerciseEntries.slice(1).map((entry) => (
            <div key={entry.id}>
              <input type="hidden" name="exerciseType" value={entry.type} />
              <input
                type="hidden"
                name="exerciseDurationMinutes"
                value={entry.durationMinutes}
              />
            </div>
          ))}
        </>
      ) : null}

      {dateField ? (
        <div className="surface-card p-4 sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-accent-teal" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {dateField.label ?? "Check-in date"}
              </h3>
              <p className="text-sm text-slate-600">
                {dateField.description ??
                  "Pick the day you want to backfill. Saving the same date again will overwrite that date's log."}
              </p>
            </div>
          </div>
          <label className="field-shell block max-w-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Date
            </span>
            <input
              name="date"
              type="date"
              className="mt-2 w-full bg-transparent text-lg font-semibold outline-none sm:text-xl"
              value={checkInDate}
              max={dateField.max}
              onChange={(event) => setCheckInDate(event.target.value)}
              required
            />
          </label>
        </div>
      ) : null}

      <div className="surface-card p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <p className="eyebrow">{headerEyebrow}</p>
            <h2 className="mt-2 font-display text-[1.9rem] leading-[1.04] text-slate-900 sm:text-3xl">
              {completion}% complete
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
              {headerDescription}
            </p>
          </div>
          <div className="self-start rounded-[1.3rem] bg-accent-mint px-4 py-3 text-left sm:rounded-3xl sm:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b5730]/80">
              Streak
            </p>
            <p className="mt-1 text-2xl font-display text-[#2d2e2d] sm:text-[1.75rem]">
              {streak} days
            </p>
          </div>
        </div>
        <ProgressBar className="mt-5" value={completion} />
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 xl:grid-cols-5">
          <div className="tap-card">
            <p className="text-slate-500">Protein</p>
            <p className="mt-1 font-semibold text-slate-900">
              {proteinGramsValue} / {proteinTarget}g
            </p>
          </div>
          <div className="tap-card">
            <p className="text-slate-500">Steps</p>
            <p className="mt-1 font-semibold text-slate-900">
              {stepsValue.toLocaleString()} / {stepTarget.toLocaleString()}
            </p>
          </div>
          <div className="tap-card">
            <p className="text-slate-500">Sleep</p>
            <p className="mt-1 font-semibold text-slate-900">
              {totalSleepHoursValue} / {SLEEP_TARGET_HOURS}h
            </p>
          </div>
          <div className="tap-card">
            <p className="text-slate-500">Hydration</p>
            <p className="mt-1 font-semibold text-slate-900">
              {hydrationLitersValue} / {HYDRATION_TARGET_LITERS}L
            </p>
          </div>
          <div className="tap-card">
            <p className="text-slate-500">Workout</p>
            <p className="mt-1 font-semibold text-slate-900">
              {totalExerciseDurationMinutes} min
            </p>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800 sm:rounded-4xl sm:px-5">
          {submittedMessage}
        </div>
      ) : null}

      {compactMode ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMoreDetails((currentValue) => !currentValue)}
          >
            {showExpandedDetails ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Hide extra details
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Add more details
              </>
            )}
          </Button>
        </div>
      ) : null}

      <section className="grid gap-4">
        <div className="surface-card p-4 sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <MoonStar className="h-5 w-5 text-accent-teal" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">Sleep</h3>
              <p className="text-sm text-slate-600">
                Bedtime, wake time, and total sleep.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {showExpandedDetails ? (
              <>
                <label className="field-shell">
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Bedtime
                  </span>
                  <input
                    name="bedtime"
                    type="time"
                    className="mt-2 w-full bg-transparent text-lg font-semibold outline-none sm:text-xl"
                    value={bedtime}
                    onChange={(event) => setBedtime(event.target.value)}
                    required
                  />
                </label>
                <label className="field-shell">
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Wake time
                  </span>
                  <input
                    name="wakeTime"
                    type="time"
                    className="mt-2 w-full bg-transparent text-lg font-semibold outline-none sm:text-xl"
                    value={wakeTime}
                    onChange={(event) => setWakeTime(event.target.value)}
                    required
                  />
                </label>
              </>
            ) : null}
            <label className="field-shell">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Total sleep hours
              </span>
              <input
                name="totalSleepHours"
                type="number"
                step="0.1"
                className="mt-2 w-full bg-transparent text-[2rem] font-display outline-none sm:text-3xl"
                value={totalSleepHours}
                onFocus={() => setTotalSleepHours((value) => clearZeroInput(value))}
                onChange={(event) => setTotalSleepHours(normalizeNumberInput(event.target.value))}
              />
            </label>
          </div>
        </div>

        <div className="surface-card p-4 sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <Salad className="h-5 w-5 text-accent-coral" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Nutrition and activity
              </h3>
              <p className="text-sm text-slate-600">
                Protein and steps are the daily anchors.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <label className="field-shell">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Protein (grams)
              </span>
              <div className="mt-2 flex items-end gap-2">
                <input
                  name="proteinGrams"
                  type="number"
                  className="w-full bg-transparent text-[2rem] font-display outline-none sm:text-3xl"
                  value={proteinGrams}
                  onFocus={() => setProteinGrams((value) => clearZeroInput(value))}
                  onChange={(event) => setProteinGrams(normalizeNumberInput(event.target.value))}
                />
                <span className="pb-1 text-sm text-slate-500">/ {proteinTarget}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {proteinPercent}% of target
              </p>
            </label>
            <label className="field-shell">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Steps
              </span>
              <div className="mt-2 flex items-end gap-2">
                <Footprints className="mb-1 h-5 w-5 text-accent-teal" />
                <input
                  name="steps"
                  type="number"
                  className="w-full bg-transparent text-[2rem] font-display outline-none sm:text-3xl"
                  value={steps}
                  onFocus={() => setSteps((value) => clearZeroInput(value))}
                  onChange={(event) => setSteps(normalizeNumberInput(event.target.value))}
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">{stepPercent}% of target</p>
            </label>
            <label className="field-shell">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Hydration (liters)
              </span>
              <div className="mt-2 flex items-end gap-2">
                <Droplets className="mb-1 h-5 w-5 text-accent-teal" />
                <input
                  name="hydrationLiters"
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full bg-transparent text-[2rem] font-display outline-none sm:text-3xl"
                  value={hydrationLiters}
                  onFocus={() => setHydrationLiters((value) => clearZeroInput(value))}
                  onChange={(event) => setHydrationLiters(normalizeNumberInput(event.target.value))}
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Total water for the day.
              </p>
            </label>
          </div>
        </div>

        <div className="surface-card p-4 sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <Dumbbell className="h-5 w-5 text-accent-gold" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">Exercise</h3>
              <p className="text-sm text-slate-600">
                Add each exercise you did today, not just one.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {showExpandedDetails ? (
              <>
                {exerciseEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_auto]"
                  >
                    <label className="field-shell">
                      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Exercise {index + 1}
                      </span>
                      <input
                        name="exerciseType"
                        type="text"
                        placeholder="Strength, run, class, sport..."
                        className="mt-2 w-full bg-transparent text-lg font-semibold outline-none sm:text-xl"
                        value={entry.type}
                        onChange={(event) =>
                          updateExerciseEntry(entry.id, "type", event.target.value)
                        }
                        required
                      />
                    </label>
                    <label className="field-shell">
                      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Minutes
                      </span>
                      <input
                        name="exerciseDurationMinutes"
                        type="number"
                        min="0"
                        className="mt-2 w-full bg-transparent text-[2rem] font-display outline-none sm:text-3xl"
                        value={entry.durationMinutes}
                        onChange={(event) =>
                          updateExerciseEntry(
                            entry.id,
                            "durationMinutes",
                            event.target.value,
                          )
                        }
                        required
                      />
                    </label>
                    <div className="flex items-end">
                      {exerciseEntries.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full lg:w-auto"
                          onClick={() => removeExerciseEntry(entry.id)}
                        >
                          <Minus className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    For a day off, enter <span className="font-semibold">Rest day</span> and 0 minutes.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addExerciseEntry}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add exercise
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="field-shell">
                    <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Workout
                    </span>
                    <input
                      name="exerciseType"
                      type="text"
                      placeholder="Rest day, strength, walk..."
                      className="mt-2 w-full bg-transparent text-lg font-semibold outline-none sm:text-xl"
                      value={primaryExerciseEntry.type}
                      onChange={(event) =>
                        updateExerciseEntry(primaryExerciseEntry.id, "type", event.target.value)
                      }
                      required
                    />
                  </label>
                  <label className="field-shell">
                    <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Minutes
                    </span>
                    <input
                      name="exerciseDurationMinutes"
                      type="number"
                      min="0"
                      className="mt-2 w-full bg-transparent text-[2rem] font-display outline-none sm:text-3xl"
                      value={primaryExerciseEntry.durationMinutes}
                      onChange={(event) =>
                        updateExerciseEntry(
                          primaryExerciseEntry.id,
                          "durationMinutes",
                          event.target.value,
                        )
                      }
                      required
                    />
                  </label>
                </div>
                <p className="text-sm text-slate-600">
                  Keep this simple. Use <span className="font-semibold">Rest day</span> and 0 minutes if you did not train.
                </p>
              </>
            )}
          </div>
        </div>

        {showExpandedDetails ? (
          <div className="surface-card p-4 sm:p-5">
            <div className="mb-5 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-accent-teal" />
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Supplements
                </h3>
                <p className="text-sm text-slate-600">
                  Simple toggles keep it frictionless.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {probioticsEnabled ? (
                <label className="tap-card flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Probiotics</span>
                  <input
                    name="probioticsChecked"
                    type="checkbox"
                    checked={probioticsChecked}
                    onChange={(event) => setProbioticsChecked(event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-accent-teal focus:ring-accent-teal"
                  />
                </label>
              ) : null}
              {fishOilEnabled ? (
                <label className="tap-card flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Fish oil</span>
                  <input
                    name="fishOilChecked"
                    type="checkbox"
                    checked={fishOilChecked}
                    onChange={(event) => setFishOilChecked(event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-accent-teal focus:ring-accent-teal"
                  />
                </label>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="surface-card p-4 sm:p-5">
          <div className="mb-5 flex items-start gap-3">
            <Scale className="h-5 w-5 text-accent-coral" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Body weight
              </h3>
              <p className="text-sm text-slate-600">
                Daily scale trend, not judgment.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="field-shell block">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Body weight
              </span>
              <input
                name="bodyWeight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                placeholder="72.4"
                className="mt-2 h-10 w-full bg-transparent text-xl font-semibold leading-none outline-none sm:text-2xl"
                value={bodyWeightInput}
                onChange={(event) => setBodyWeightInput(event.target.value)}
                required
              />
            </label>
            <p className="px-1 text-sm text-slate-600">
              Decimals work normally here, for example 72.4.
            </p>
          </div>
        </div>

        {showExpandedDetails ? (
          <div className="surface-card p-4 sm:p-5">
            <div className="mb-5 flex items-start gap-3">
              <Camera className="h-5 w-5 text-accent-gold" />
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Progress photo and meal note
                </h3>
                <p className="text-sm text-slate-600">
                  Optional, quick, and lightweight.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              <label className="field-shell">
                <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Progress photo
                </span>
                <input
                  name="progressPhoto"
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-accent-coral file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#2d2e2d]"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-900">
                  Meal note
                </span>
                <Textarea
                  name="mealNotes"
                  placeholder="Short note only. Keep it light."
                  value={mealNotes}
                  onChange={(event) => setMealNotes(event.target.value)}
                />
              </label>
            </div>
          </div>
        ) : null}
      </section>

      <FormSubmitButton
        variant="teal"
        size="lg"
        fullWidth
        pendingLabel={pendingLabel}
      >
        {submitLabel}
      </FormSubmitButton>
    </form>
  );
}
