import Link from "next/link";

import {
  saveCoachNoteAction,
  saveFeedbackMessageAction,
} from "@/app/actions/coach";
import { CoachNoteForm } from "@/components/forms/coach-note-form";
import { FeedbackMessageForm } from "@/components/forms/feedback-message-form";
import { AdherenceTrendChart } from "@/components/charts/adherence-trend-chart";
import { TargetComparisonChart } from "@/components/charts/target-comparison-chart";
import { WeightTrendChart } from "@/components/charts/weight-trend-chart";
import { CoachShell } from "@/components/layout/coach-shell";
import { SectionHeading } from "@/components/layout/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoachClientDetailData } from "@/lib/data/coach";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import {
  createInviteLink,
  formatClientStatusLabel,
  formatCoachNoteVisibilityLabel,
  formatFullDate,
  formatShortDate,
  getTodayIsoDate,
} from "@/lib/utils";
import { appEnv } from "@/lib/supabase/config";

export default async function CoachClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const data = await getCoachClientDetailData(clientId);

  const weightData = data.recentCheckIns.slice(-10).map((entry) => ({
    label: formatShortDate(entry.date),
    weight: entry.bodyWeight,
  }));

  const targetData = data.recentCheckIns.slice(-7).map((entry) => ({
    label: formatShortDate(entry.date),
    actual: entry.proteinGrams,
    target: entry.proteinTargetSnapshot,
  }));

  const adherenceData = data.recentCheckIns.slice(-10).map((entry) => ({
    label: formatShortDate(entry.date),
    adherence: entry.completionPercentage,
  }));

  const latestCheckIns = data.recentCheckIns.slice(-10).reverse();
  const inviteLink = createInviteLink(appEnv.appUrl, data.client.inviteToken);
  const latestCheckIn = data.todaysCheckIn;
  const hasLoggedToday = latestCheckIn?.date === getTodayIsoDate();
  const latestCheckInLabel = latestCheckIn
    ? hasLoggedToday
      ? "Logged today"
      : `Last log ${formatShortDate(latestCheckIn.date)}`
    : "No check-ins yet";
  const supplementTracking = [
    data.client.targets.probioticsEnabled ? "Probiotics" : null,
    data.client.targets.fishOilEnabled ? "Fish oil" : null,
  ].filter(Boolean);

  return (
    <CoachShell
      heading={data.client.fullName}
      subheading={data.client.profile.goalSummary}
      demoMode={!isLiveAppEnabled}
      actions={
        <>
          <Link href="/coach/clients" className="block w-full sm:inline-block sm:w-auto">
            <Button variant="ghost" size="sm" fullWidth>
              Back to clients
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
          <Link
            href={`/coach/clients/${data.client.id}/backfill`}
            className="block w-full sm:inline-block sm:w-auto"
          >
            <Button variant="secondary" size="sm" fullWidth>
              Backfill log
            </Button>
          </Link>
        </>
      }
    >
      <section className="space-y-3">
        <SectionHeading
          eyebrow="Overview"
          title="Client overview"
          description="Current status, targets, and access details are grouped here so you can orient quickly before reviewing charts or history."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Current status</CardTitle>
              <CardDescription>
                Daily check-in state and the core context you need before taking action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone={data.client.activeStatus === "active" ? "success" : "neutral"}>
                  {formatClientStatusLabel(data.client.activeStatus)}
                </Badge>
                <Badge tone={hasLoggedToday ? "success" : "warning"}>{latestCheckInLabel}</Badge>
                <Badge tone="accent">{data.client.currentStreak} day streak</Badge>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Access link</p>
                <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                  Manual private link
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Training phase
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {data.client.profile.trainingPhase}
                  </p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Coaching since
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatShortDate(data.client.profile.coachingStartDate)}
                  </p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Latest weight
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {latestCheckIn ? latestCheckIn.bodyWeight : "No entries yet"}
                  </p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Progress photos
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {data.progressPhotos.length ? `${data.progressPhotos.length} uploaded` : "None yet"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Targets</CardTitle>
              <CardDescription>
                Current daily targets and program expectations for this client.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
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
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Workout expectation
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {data.client.targets.exerciseExpectation}
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Supplement tracking
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {supplementTracking.length ? supplementTracking.join(" + ") : "No supplements tracked"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access</CardTitle>
              <CardDescription>
                Private client access is manual in this version. Share the link directly when the
                client needs entry.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Invite link</p>
                <p className="mt-2 break-words font-mono text-[0.8rem] leading-6 text-slate-700 sm:text-sm">
                  {inviteLink}
                </p>
              </div>
              <Link
                href={`/access/${data.client.inviteToken}`}
                className="block w-full sm:inline-block sm:w-auto"
              >
                <Button variant="secondary" fullWidth>
                  Open access page
                </Button>
              </Link>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Timezone</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {data.client.profile.timezone}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          eyebrow="Trends"
          title="Performance trends"
          description="Recent weight, protein, and completion patterns stay separate from the admin controls so the page is easier to scan."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          <WeightTrendChart data={weightData} />
          <TargetComparisonChart
            title="Protein vs target"
            description="Last seven check-ins against the personalised target."
            data={targetData}
          />
          <AdherenceTrendChart
            title="Completion trend"
            description="Daily check-in completion over recent entries."
            data={adherenceData}
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          eyebrow="Activity"
          title="Check-in history"
          description="Recent entries and weekly summaries stay grouped together so the coaching record reads like one continuous timeline."
        />
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Recent check-ins</CardTitle>
              <CardDescription>
                Lightweight history for weight, protein, steps, hydration, exercise, supplements,
                and meal notes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestCheckIns.length ? (
                <>
                  <div className="space-y-3 md:hidden">
                    {latestCheckIns.map((entry) => (
                      <div key={entry.id} className="surface-muted p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold text-slate-900">{formatFullDate(entry.date)}</p>
                          <Badge tone="neutral">{entry.completionPercentage}% complete</Badge>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="surface-card px-3 py-3 text-sm text-slate-700">
                            Weight: {entry.bodyWeight}
                          </div>
                          <div className="surface-card px-3 py-3 text-sm text-slate-700">
                            Protein: {entry.proteinGrams}g
                          </div>
                          <div className="surface-card px-3 py-3 text-sm text-slate-700">
                            Steps: {entry.steps.toLocaleString()}
                          </div>
                          <div className="surface-card px-3 py-3 text-sm text-slate-700">
                            Hydration: {entry.hydrationLiters}L
                          </div>
                          <div className="surface-card px-3 py-3 text-sm text-slate-700">
                            Workout: {entry.exerciseType}
                          </div>
                          <div className="surface-card px-3 py-3 text-sm text-slate-700">
                            Duration: {entry.exerciseDurationMinutes} min
                          </div>
                        </div>
                        {entry.mealNotes ? (
                          <p className="mt-3 text-sm leading-6 text-slate-600">{entry.mealNotes}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-slate-500">
                        <tr>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Weight</th>
                          <th className="pb-3 font-medium">Protein</th>
                          <th className="pb-3 font-medium">Steps</th>
                          <th className="pb-3 font-medium">Hydration</th>
                          <th className="pb-3 font-medium">Workout</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {latestCheckIns.map((entry) => (
                          <tr key={entry.id}>
                            <td className="py-4 text-slate-700">{formatFullDate(entry.date)}</td>
                            <td className="py-4 text-slate-700">{entry.bodyWeight}</td>
                            <td className="py-4 text-slate-700">{entry.proteinGrams}g</td>
                            <td className="py-4 text-slate-700">{entry.steps.toLocaleString()}</td>
                            <td className="py-4 text-slate-700">{entry.hydrationLiters}L</td>
                            <td className="py-4 text-slate-700">
                              {entry.exerciseType} - {entry.exerciseDurationMinutes}m
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="surface-muted p-5 text-sm text-slate-700">
                  No check-ins yet. Daily entries will appear here as soon as the client logs.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly summary</CardTitle>
              <CardDescription>
                Clear version-one analytics without overcomplicating the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.weeklySummary.map((summary) => (
                <div key={summary.weekLabel} className="surface-muted p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-900">{summary.weekLabel}</p>
                    <p className="font-display text-2xl text-slate-900">
                      {summary.adherencePercent}%
                    </p>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    <p>Avg protein: {summary.averageProtein}g</p>
                    <p>Avg steps: {summary.averageSteps.toLocaleString()}</p>
                    <p>Avg hydration: {summary.averageHydrationLiters}L</p>
                    <p>Workouts: {summary.workoutsCompleted}</p>
                    <p>Supplements: {summary.supplementAdherencePercent}%</p>
                    <p>Avg sleep: {summary.averageSleepHours}h</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          eyebrow="Communication"
          title="Notes and feedback"
          description="Private coaching notes and client-facing messages stay separated so it is obvious what remains internal versus visible in the client app."
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Coach notes</CardTitle>
              <CardDescription>
                Private operational notes stay here. Shared notes can also appear on the client
                side.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CoachNoteForm action={saveCoachNoteAction} clientId={data.client.id} />
              <div className="space-y-3">
                {data.coachNotes.length ? (
                  data.coachNotes.map((note) => (
                    <div key={note.id} className="surface-muted p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Badge tone={note.visibility === "shared" ? "accent" : "neutral"}>
                          {formatCoachNoteVisibilityLabel(note.visibility)}
                        </Badge>
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {formatShortDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{note.note}</p>
                    </div>
                  ))
                ) : (
                  <div className="surface-muted p-5 text-sm text-slate-700">
                    No notes yet. Add quick context here after check-ins or client reviews.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client-facing messages</CardTitle>
              <CardDescription>
                This message feed is visible in the client app and should feel encouraging rather
                than clinical.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeedbackMessageForm action={saveFeedbackMessageAction} clientId={data.client.id} />
              <div className="space-y-3">
                {data.feedbackMessages.length ? (
                  data.feedbackMessages.map((message) => (
                    <div key={message.id} className="surface-muted p-4">
                      <p className="text-sm leading-6 text-slate-700">{message.message}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {formatFullDate(message.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="surface-muted p-5 text-sm text-slate-700">
                    No client-facing feedback yet. Save one here when you want it visible in the
                    client app.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </CoachShell>
  );
}
