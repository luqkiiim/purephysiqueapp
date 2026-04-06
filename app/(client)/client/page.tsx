import { saveDailyCheckInAction } from "@/app/actions/client";
import { DailyCheckInForm } from "@/components/forms/daily-checkin-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientHomeData } from "@/lib/data/client";

export default async function ClientHomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await getClientHomeData();
  const resolvedSearchParams = (await searchParams) ?? {};
  const submittedValue = resolvedSearchParams.submitted;
  const submitted = Array.isArray(submittedValue)
    ? submittedValue[0] === "1"
    : submittedValue === "1";
  const recentCoachMessage =
    data.feedbackMessages.at(0) ?? data.sharedCoachNotes.at(0) ?? null;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{data.client.profile.welcomeMessage}</CardTitle>
          <CardDescription>
            Today&apos;s targets are personalised for you. Keep this fast, clear, and consistent.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="surface-muted p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Protein target</p>
            <p className="mt-2 text-2xl font-display text-slate-900">
              {data.client.targets.proteinTargetGrams}g
            </p>
          </div>
          <div className="surface-muted p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step target</p>
            <p className="mt-2 text-2xl font-display text-slate-900">
              {data.client.targets.stepTarget.toLocaleString()}
            </p>
          </div>
          <div className="surface-muted p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workout focus</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {data.client.targets.exerciseExpectation}
            </p>
          </div>
        </CardContent>
      </Card>

      <DailyCheckInForm
        action={saveDailyCheckInAction}
        defaults={data.todaysCheckIn ?? undefined}
        proteinTarget={data.client.targets.proteinTargetGrams}
        stepTarget={data.client.targets.stepTarget}
        probioticsEnabled={data.client.targets.probioticsEnabled}
        fishOilEnabled={data.client.targets.fishOilEnabled}
        streak={data.client.currentStreak}
        submitted={submitted}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent coach message</CardTitle>
          <CardDescription>
            Encouraging feedback stays visible so the habit loop feels supported, not judged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentCoachMessage ? (
            <div key={recentCoachMessage.id} className="surface-muted p-4 text-sm text-slate-700">
              {"message" in recentCoachMessage
                ? recentCoachMessage.message
                : recentCoachMessage.note}
            </div>
          ) : (
            <div className="surface-muted p-4 text-sm text-slate-700">
              Coach feedback will show up here after your coach leaves a message.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
