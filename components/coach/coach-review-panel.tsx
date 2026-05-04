import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/ui/stat-card";
import type { CoachReviewData } from "@/lib/types/app";
import { formatFullDate, formatShortDate } from "@/lib/utils";

function getBadgeTone(tone: "success" | "warning" | "neutral") {
  if (tone === "success") {
    return "success";
  }

  if (tone === "warning") {
    return "warning";
  }

  return "neutral";
}

function ProgressPhotoCoverageCard({
  photoIndicators,
}: {
  photoIndicators: CoachReviewData["photoIndicators"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress photo coverage</CardTitle>
        <CardDescription>
          Photo counts and latest log timing by client, so visual review does not disappear behind
          the roster.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
        {photoIndicators.length ? (
          photoIndicators.map((client) => (
            <Link
              key={client.id}
              href={`/coach/clients/${client.id}`}
              className="surface-muted block p-4 transition hover:border-accent-teal/35 hover:bg-slate-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{client.fullName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {client.lastCheckIn
                      ? `Latest log ${formatShortDate(client.lastCheckIn.date)}`
                      : "No recent log"}
                  </p>
                </div>
                <Badge tone={client.progressPhotoCount ? "accent" : "neutral"}>
                  {client.progressPhotoCount} photos
                </Badge>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Consistency</span>
                  <span>{client.averageConsistency}%</span>
                </div>
                <ProgressBar value={client.averageConsistency} />
              </div>
            </Link>
          ))
        ) : (
          <div className="surface-muted p-5 text-sm text-slate-700 md:col-span-2 xl:col-span-1">
            Progress photo coverage will appear once clients exist in the roster.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CoachReviewPanel({ data }: { data: CoachReviewData }) {
  return (
    <>
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {data.summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s review queue</CardTitle>
              <CardDescription>
                Clients missing today&apos;s log, with enough context to decide the next touchpoint.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.missedClients.length ? (
                data.missedClients.map((client) => (
                  <div key={client.id} className="surface-muted p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/coach/clients/${client.id}`}
                            className="text-base font-semibold text-slate-900 transition hover:text-accent-teal"
                          >
                            {client.fullName}
                          </Link>
                          <Badge tone={getBadgeTone(client.statusTone)}>
                            {client.statusLabel}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6 text-slate-600">
                          {client.lastCheckIn
                            ? `Last reviewed ${formatFullDate(client.lastCheckIn.date)} at ${client.lastCheckIn.completionPercentage}% completion.`
                            : "No recent check-in is available for this client."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="accent">{client.streak} day streak</Badge>
                        <Badge tone="neutral">{client.progressPhotoCount} photos</Badge>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="surface-card px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Protein
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {client.proteinConsistency}%
                        </p>
                      </div>
                      <div className="surface-card px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Steps
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {client.stepConsistency}%
                        </p>
                      </div>
                      <div className="surface-card px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Recent weight
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {client.recentWeight ? client.recentWeight : "No log"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <Link href={`/coach/clients/${client.id}`} className="block w-full">
                        <Button variant="secondary" size="sm" fullWidth>
                          Open client
                        </Button>
                      </Link>
                      <Link
                        href={`/coach/clients/${client.id}/backfill`}
                        className="block w-full"
                      >
                        <Button variant="ghost" size="sm" fullWidth>
                          Backfill log
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="surface-muted p-5 text-sm text-slate-700">
                  No one is waiting on a daily log. Recent check-ins and photo coverage are still
                  available below for a quick coaching pass.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="hidden xl:block">
            <ProgressPhotoCoverageCard photoIndicators={data.photoIndicators} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent check-ins</CardTitle>
            <CardDescription>
              Latest submissions ordered newest first, with protein and step target signals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentCheckIns.length ? (
              data.recentCheckIns.map((entry) => (
                <div key={entry.id} className="surface-muted p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Link
                        href={`/coach/clients/${entry.clientId}`}
                        className="font-semibold text-slate-900 transition hover:text-accent-teal"
                      >
                        {entry.clientName}
                      </Link>
                      <p className="mt-1 text-sm text-slate-600">{formatFullDate(entry.date)}</p>
                    </div>
                    <Badge tone={entry.completionPercentage >= 80 ? "success" : "warning"}>
                      {entry.completionPercentage}% complete
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span>Protein</span>
                        <span>{entry.proteinPercent}%</span>
                      </div>
                      <ProgressBar value={entry.proteinPercent} />
                      <p className="mt-2 text-sm text-slate-600">{entry.proteinGrams}g logged</p>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span>Steps</span>
                        <span>{entry.stepPercent}%</span>
                      </div>
                      <ProgressBar value={entry.stepPercent} />
                      <p className="mt-2 text-sm text-slate-600">
                        {entry.steps.toLocaleString()} steps
                      </p>
                    </div>
                  </div>
                  {entry.mealNotes ? (
                    <p className="mt-4 text-sm leading-6 text-slate-600">{entry.mealNotes}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="surface-muted p-5 text-sm text-slate-700">
                Recent check-ins will appear here after clients submit daily logs.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="xl:hidden">
          <ProgressPhotoCoverageCard photoIndicators={data.photoIndicators} />
        </div>
      </section>
    </>
  );
}
