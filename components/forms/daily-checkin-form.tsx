"use client";

import { useState } from "react";
import {
  Camera,
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

  return [createExerciseEntryDraft({ type: "Strength", durationMinutes: 45 })];
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

export function DailyCheckInForm({
  action,
  defaults,
  proteinTarget,
  stepTarget,
  probioticsEnabled,
  fishOilEnabled,
  streak,
  submitted,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: DailyCheckInDefaults | null;
  proteinTarget: number;
  stepTarget: number;
  probioticsEnabled: boolean;
  fishOilEnabled: boolean;
  streak: number;
  submitted?: boolean;
}) {
  const [bedtime, setBedtime] = useState(defaults?.bedtime ?? "22:30");
  const [wakeTime, setWakeTime] = useState(defaults?.wakeTime ?? "06:30");
  const [totalSleepHours, setTotalSleepHours] = useState(
    defaults?.totalSleepHours ?? 7.5,
  );
  const [proteinGrams, setProteinGrams] = useState(defaults?.proteinGrams ?? 0);
  const [steps, setSteps] = useState(defaults?.steps ?? 0);
  const [hydrationLiters, setHydrationLiters] = useState(
    defaults?.hydrationLiters ?? 0,
  );
  const [exerciseEntries, setExerciseEntries] = useState(() =>
    buildExerciseEntryDrafts(defaults),
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
  const exerciseSummary = formatExerciseSummary(normalizedExerciseEntries);
  const totalExerciseDurationMinutes = getExerciseTotalDuration(
    normalizedExerciseEntries,
  );
  const bodyWeight =
    bodyWeightInput.trim() === "" ? 0 : Number(bodyWeightInput);
  const completion = calculateCompletionPercentage([
    bedtime,
    wakeTime,
    totalSleepHours,
    proteinGrams,
    steps,
    hydrationLiters,
    exerciseSummary,
    totalExerciseDurationMinutes,
    bodyWeight,
    probioticsEnabled ? probioticsChecked : true,
    fishOilEnabled ? fishOilChecked : true,
  ]);

  const proteinPercent = percentageAgainstTarget(proteinGrams, proteinTarget);
  const stepPercent = percentageAgainstTarget(steps, stepTarget);

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
    <form action={action} className="space-y-5">
      <div className="surface-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Today&apos;s momentum</p>
            <h2 className="mt-2 font-display text-3xl text-slate-900">
              {completion}% complete
            </h2>
            <p className="mt-2 text-sm text-slate-700">
              Keep it quick. The goal is a complete check-in, not perfect detail.
            </p>
          </div>
          <div className="rounded-3xl bg-accent-mint px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-700/70">
              Streak
            </p>
            <p className="mt-1 text-2xl font-display text-slate-900">
              {streak} days
            </p>
          </div>
        </div>
        <ProgressBar className="mt-4" value={completion} />
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          <div className="tap-card">
            <p className="text-slate-500">Protein</p>
            <p className="mt-1 font-semibold text-slate-900">
              {proteinGrams} / {proteinTarget}g
            </p>
          </div>
          <div className="tap-card">
            <p className="text-slate-500">Steps</p>
            <p className="mt-1 font-semibold text-slate-900">
              {steps.toLocaleString()} / {stepTarget.toLocaleString()}
            </p>
          </div>
          <div className="tap-card">
            <p className="text-slate-500">Sleep</p>
            <p className="mt-1 font-semibold text-slate-900">
              {totalSleepHours} hrs
            </p>
          </div>
          <div className="tap-card">
            <p className="text-slate-500">Hydration</p>
            <p className="mt-1 font-semibold text-slate-900">
              {hydrationLiters} L
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
        <div className="rounded-4xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Check-in complete. Keep tomorrow simple and protect the streak.
        </div>
      ) : null}

      <section className="grid gap-4">
        <div className="surface-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <MoonStar className="h-5 w-5 text-accent-teal" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">Sleep</h3>
              <p className="text-sm text-slate-600">
                Bedtime, wake time, and total sleep.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="field-shell">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Bedtime
              </span>
              <input
                name="bedtime"
                type="time"
                className="mt-2 w-full bg-transparent text-xl font-semibold outline-none"
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
                className="mt-2 w-full bg-transparent text-xl font-semibold outline-none"
                value={wakeTime}
                onChange={(event) => setWakeTime(event.target.value)}
                required
              />
            </label>
            <label className="field-shell">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Total sleep hours
              </span>
              <input
                name="totalSleepHours"
                type="number"
                step="0.1"
                className="mt-2 w-full bg-transparent text-3xl font-display outline-none"
                value={totalSleepHours}
                onChange={(event) => setTotalSleepHours(Number(event.target.value))}
                required
              />
            </label>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center gap-3">
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
          <div className="grid gap-3 md:grid-cols-3">
            <label className="field-shell">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Protein (grams)
              </span>
              <div className="mt-2 flex items-end gap-2">
                <input
                  name="proteinGrams"
                  type="number"
                  className="w-full bg-transparent text-3xl font-display outline-none"
                  value={proteinGrams}
                  onChange={(event) => setProteinGrams(Number(event.target.value))}
                  required
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
                  className="w-full bg-transparent text-3xl font-display outline-none"
                  value={steps}
                  onChange={(event) => setSteps(Number(event.target.value))}
                  required
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
                  className="w-full bg-transparent text-3xl font-display outline-none"
                  value={hydrationLiters}
                  onChange={(event) => setHydrationLiters(Number(event.target.value))}
                  required
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Total water for the day.
              </p>
            </label>
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <Dumbbell className="h-5 w-5 text-accent-gold" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">Exercise</h3>
              <p className="text-sm text-slate-600">
                Add each exercise you did today, not just one.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {exerciseEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_auto]"
              >
                <label className="field-shell">
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Exercise {index + 1}
                  </span>
                  <input
                    name="exerciseType"
                    type="text"
                    placeholder="Strength, run, class, sport..."
                    className="mt-2 w-full bg-transparent text-xl font-semibold outline-none"
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
                    className="mt-2 w-full bg-transparent text-3xl font-display outline-none"
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
                      className="w-full md:w-auto"
                      onClick={() => removeExerciseEntry(entry.id)}
                    >
                      <Minus className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-3">
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
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center gap-3">
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

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center gap-3">
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
                className="mt-2 h-10 w-full bg-transparent text-2xl font-semibold leading-none outline-none"
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

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center gap-3">
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
                className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
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
      </section>

      <FormSubmitButton
        variant="teal"
        size="lg"
        fullWidth
        pendingLabel="Saving check-in..."
      >
        Submit today&apos;s check-in
      </FormSubmitButton>
    </form>
  );
}
