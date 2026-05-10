import Image from "next/image";
import Link from "next/link";

import { saveDailyCheckInAction } from "@/app/actions/client";
import { LazyAdherenceTrendChart } from "@/components/charts/lazy-adherence-trend-chart";
import { LazyTargetComparisonChart } from "@/components/charts/lazy-target-comparison-chart";
import { LazyWeightTrendChart } from "@/components/charts/lazy-weight-trend-chart";
import { DailyCheckInForm } from "@/components/forms/daily-checkin-form";
import {
  ClientTabbedNavigation,
  type ClientPrimaryTab,
} from "@/components/layout/client-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientTabsPageData } from "@/lib/data/client";
import { formatFullDate, formatShortDate } from "@/lib/utils";

type ClientTabsData = Awaited<ReturnType<typeof getClientTabsPageData>>;
type ClientTabSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function ClientCheckInPanel({
  data,
  submitted,
}: {
  data: ClientTabsData;
  submitted: boolean;
}) {
  return (
    <div className="space-y-5">
      <DailyCheckInForm
        action={saveDailyCheckInAction}
        defaults={data.todaysCheckIn ?? undefined}
        proteinTarget={data.client.targets.proteinTargetGrams}
        stepTarget={data.client.targets.stepTarget}
        probioticsEnabled={data.client.targets.probioticsEnabled}
        fishOilEnabled={data.client.targets.fishOilEnabled}
        streak={data.client.currentStreak}
        submitted={submitted}
        compactMode
        headerEyebrow="Quick check-in"
        headerDescription="Log the core numbers first. Extra detail stays optional."
        submitLabel="Save today's check-in"
      />

      <Card>
        <CardHeader>
          <CardTitle>{data.latestCoachUpdate ? "Latest from coach" : "Today's focus"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.latestCoachUpdate ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={data.latestCoachUpdate.type === "message" ? "accent" : "neutral"}>
                  {data.latestCoachUpdate.type === "message" ? "Coach message" : "Shared note"}
                </Badge>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {formatFullDate(data.latestCoachUpdate.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-700 sm:text-base">
                {data.latestCoachUpdate.content}
              </p>
              <Link href="/client/messages" className="block w-full sm:inline-block sm:w-auto">
                <Button variant="secondary" size="sm" fullWidth>
                  Open messages
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-sm leading-6 text-slate-700 sm:text-base">
              {data.client.profile.welcomeMessage || "Keep today's check-in quick and consistent."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ClientHistoryPanel({ data }: { data: ClientTabsData }) {
  const weightData = data.recentCheckIns.slice(-12).map((entry) => ({
    label: formatShortDate(entry.date),
    weight: entry.bodyWeight,
  }));

  const proteinData = data.recentCheckIns.slice(-7).map((entry) => ({
    label: formatShortDate(entry.date),
    actual: entry.proteinGrams,
    target: entry.proteinTargetSnapshot,
  }));

  const adherenceData = data.recentCheckIns.slice(-12).map((entry) => ({
    label: formatShortDate(entry.date),
    adherence: entry.completionPercentage,
  }));

  return (
    <div className="space-y-5">
      <LazyWeightTrendChart data={weightData} />
      <LazyTargetComparisonChart
        title="Protein vs target"
        description="How your recent protein intake compares with the target your coach set."
        data={proteinData}
      />
      <LazyAdherenceTrendChart
        title="Check-in completion"
        description="A light weekly rhythm view to keep the habit visible."
        data={adherenceData}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent entries</CardTitle>
          <CardDescription>
            Review the last check-ins without needing spreadsheet-style cells.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentCheckIns.slice(-10).reverse().map((entry) => (
            <div key={entry.id} className="surface-muted p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-slate-900">{formatFullDate(entry.date)}</p>
                <p className="text-sm text-slate-600">{entry.completionPercentage}% complete</p>
              </div>
              <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <p>Weight: {entry.bodyWeight}</p>
                <p>Protein: {entry.proteinGrams}g</p>
                <p>Steps: {entry.steps.toLocaleString()}</p>
                <p>Hydration: {entry.hydrationLiters}L</p>
                <p>Workout: {entry.exerciseType}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ClientWeeklyPanel({ data }: { data: ClientTabsData }) {
  const adherenceData = data.recentCheckIns.slice(-14).map((entry) => ({
    label: formatShortDate(entry.date),
    adherence: entry.completionPercentage,
  }));

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2">
        {data.weeklySummary.map((summary) => (
          <Card key={summary.weekLabel}>
            <CardHeader>
              <CardTitle>{summary.weekLabel}</CardTitle>
              <CardDescription>Simple version-one weekly summary.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Adherence</p>
                <p className="mt-2 text-2xl font-display text-slate-900">
                  {summary.adherencePercent}%
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Avg sleep</p>
                <p className="mt-2 text-2xl font-display text-slate-900">
                  {summary.averageSleepHours}
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Avg protein</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {summary.averageProtein}g
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Avg steps</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {summary.averageSteps.toLocaleString()}
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Avg hydration</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {summary.averageHydrationLiters}L
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <LazyAdherenceTrendChart
        title="Weekly adherence rhythm"
        description="Your recent completion pattern at a glance."
        data={adherenceData}
      />
    </div>
  );
}

function ClientPhotosPanel({ data }: { data: ClientTabsData }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Progress photos</CardTitle>
          <CardDescription>
            Photos are part of the daily flow in version one, but they stay optional and
            lightweight.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Saved photos</p>
              <p className="mt-2 text-2xl font-display text-slate-900">
                {data.progressPhotos.length}
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Upload style</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Optional from check-in</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep uploads quick and consistent rather than overproduced.
              </p>
            </div>
          </div>

          {data.progressPhotos.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.progressPhotos.map((photo, index) => (
                <article key={photo.id} className="surface-muted overflow-hidden">
                  {photo.imageUrl.startsWith("http") ? (
                    <Image
                      src={photo.imageUrl}
                      alt={photo.note ?? "Progress photo"}
                      width={800}
                      height={1000}
                      priority={index < 2}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center bg-sand-100 px-6 text-center text-sm leading-6 text-slate-500">
                      Signed URL will render here once storage is configured.
                    </div>
                  )}
                  <div className="space-y-2 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {formatFullDate(photo.date)}
                    </p>
                    <p className="font-semibold text-slate-900">
                      {photo.note ?? "Progress photo"}
                    </p>
                    <p className="text-sm leading-6 text-slate-600">
                      Logged from the daily check-in flow.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="surface-muted p-5 text-sm text-slate-700">
              No progress photos yet. Upload one from the daily check-in whenever you are ready.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ClientMessagesPanel({ data }: { data: ClientTabsData }) {
  const totalItems = data.feedbackMessages.length + data.sharedCoachNotes.length;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Coach feedback and shared notes stay visible here so progress still feels supported
            between check-ins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Feedback</p>
              <p className="mt-2 text-2xl font-display text-slate-900">
                {data.feedbackMessages.length}
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Shared notes</p>
              <p className="mt-2 text-2xl font-display text-slate-900">
                {data.sharedCoachNotes.length}
              </p>
            </div>
          </div>

          {totalItems ? (
            <div className="space-y-5">
              {data.feedbackMessages.length ? (
                <section className="space-y-3">
                  <div className="space-y-1">
                    <p className="eyebrow">Coach feedback</p>
                    <p className="text-sm leading-6 text-slate-600">
                      Short coach messages saved for the client to revisit anytime.
                    </p>
                  </div>
                  {data.feedbackMessages.map((message) => (
                    <div key={message.id} className="surface-muted p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Badge tone="accent" className="self-start">
                          Message
                        </Badge>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {formatFullDate(message.createdAt)}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{message.message}</p>
                    </div>
                  ))}
                </section>
              ) : null}

              {data.sharedCoachNotes.length ? (
                <section className="space-y-3">
                  <div className="space-y-1">
                    <p className="eyebrow">Shared notes</p>
                    <p className="text-sm leading-6 text-slate-600">
                      Coaching context that your coach chose to keep visible in the app.
                    </p>
                  </div>
                  {data.sharedCoachNotes.map((note) => (
                    <div key={note.id} className="surface-muted p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Badge tone="neutral" className="self-start">
                          Coach note
                        </Badge>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {formatFullDate(note.createdAt)}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{note.note}</p>
                    </div>
                  ))}
                </section>
              ) : null}
            </div>
          ) : (
            <div className="surface-muted p-5 text-sm text-slate-700">
              No messages yet. When feedback or shared notes are added, they will show up here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export async function ClientTabsPage({
  initialTab,
  searchParams,
}: {
  initialTab: ClientPrimaryTab;
  searchParams?: ClientTabSearchParams;
}) {
  const data = await getClientTabsPageData();
  const resolvedSearchParams = (await searchParams) ?? {};
  const submitted = getSearchParam(resolvedSearchParams, "submitted") === "1";

  return (
    <ClientTabbedNavigation initialTab={initialTab}>
      <ClientCheckInPanel data={data} submitted={submitted} />
      <ClientHistoryPanel data={data} />
      <ClientWeeklyPanel data={data} />
      <ClientPhotosPanel data={data} />
      <ClientMessagesPanel data={data} />
    </ClientTabbedNavigation>
  );
}
