import Link from "next/link";

import { saveCoachBackfillCheckInAction } from "@/app/actions/coach";
import { DailyCheckInForm } from "@/components/forms/daily-checkin-form";
import { CoachShell } from "@/components/layout/coach-shell";
import { SectionHeading } from "@/components/layout/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoachClientBackfillPageData } from "@/lib/data/coach";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import { formatFullDate, getTodayIsoDate } from "@/lib/utils";

function normalizeDateParam(value?: string | string[]) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return candidate;
  }

  return getTodayIsoDate();
}

export default async function CoachClientBackfillPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { clientId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedDate = normalizeDateParam(resolvedSearchParams.date);
  const submittedValue = resolvedSearchParams.saved;
  const submitted = Array.isArray(submittedValue)
    ? submittedValue[0] === "1"
    : submittedValue === "1";
  const data = await getCoachClientBackfillPageData(clientId, selectedDate);

  return (
    <CoachShell
      heading={`Backfill ${data.client.fullName}`}
      subheading="Add a historical daily log from your spreadsheet without switching tools."
      demoMode={!isLiveAppEnabled}
      actions={
        <>
          <Link
            href={`/coach/clients/${data.client.id}`}
            className="block w-full sm:inline-block sm:w-auto"
          >
            <Button variant="ghost" size="sm" fullWidth>
              Back to client
            </Button>
          </Link>
          <Link
            href={`/coach/clients/${data.client.id}/edit`}
            className="block w-full sm:inline-block sm:w-auto"
          >
            <Button variant="secondary" size="sm" fullWidth>
              Edit profile
            </Button>
          </Link>
        </>
      }
    >
      <section className="space-y-3">
        <SectionHeading
          eyebrow="Manual entry"
          title="Coach backfill"
          description="This writes directly into the client's check-in history. Saving the same date again updates that day's log."
        />
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <DailyCheckInForm
            key={`${selectedDate}:${data.existingCheckIn?.id ?? "new"}`}
            action={saveCoachBackfillCheckInAction}
            defaults={data.existingCheckIn ?? undefined}
            proteinTarget={data.client.targets.proteinTargetGrams}
            stepTarget={data.client.targets.stepTarget}
            probioticsEnabled={data.client.targets.probioticsEnabled}
            fishOilEnabled={data.client.targets.fishOilEnabled}
            streak={data.client.currentStreak}
            submitted={submitted}
            hiddenFields={[{ name: "clientId", value: data.client.id }]}
            dateField={{
              defaultValue: selectedDate,
              max: getTodayIsoDate(),
              label: "Backfill date",
              description:
                "Choose the historical date you want to record. Re-saving the same date replaces that day's log.",
            }}
            headerEyebrow="Manual backfill"
            headerDescription="Enter the historical log as if it had been captured that day. Targets still use the client's current setup."
            submittedMessage="Backfill saved. You can keep editing this date or switch to the next missing day."
            submitLabel="Save backfilled check-in"
            pendingLabel="Saving backfill..."
          />

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Selected day</CardTitle>
                <CardDescription>
                  The page loads any existing log for the date in the URL query.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={data.existingCheckIn ? "accent" : "neutral"}>
                    {data.existingCheckIn ? "Existing log loaded" : "New manual entry"}
                  </Badge>
                  <Badge tone="warning">{formatFullDate(selectedDate)}</Badge>
                </div>
                <div className="surface-muted p-4 text-sm leading-6 text-slate-700">
                  {data.existingCheckIn
                    ? "The form is prefilled from the current saved log for this date. Submitting again will overwrite that day's values."
                    : "No saved log was found for this date, so the form starts from defaults."}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current targets</CardTitle>
                <CardDescription>
                  Historical entries use the client&apos;s current target snapshots in this version.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Protein target
                  </p>
                  <p className="mt-2 text-2xl font-display text-slate-900">
                    {data.client.targets.proteinTargetGrams}g
                  </p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Step target
                  </p>
                  <p className="mt-2 text-2xl font-display text-slate-900">
                    {data.client.targets.stepTarget.toLocaleString()}
                  </p>
                </div>
                <div className="surface-muted p-4 text-sm leading-6 text-slate-700">
                  Progress photos are optional here too. If you upload one, it will be attached to
                  the selected check-in date.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </CoachShell>
  );
}
