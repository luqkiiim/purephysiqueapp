import Link from "next/link";

import { LazyAdherenceTrendChart } from "@/components/charts/lazy-adherence-trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import type { CoachDashboardData } from "@/lib/types/app";

export function CoachOverviewPanel({ data }: { data: CoachDashboardData }) {
  const needsFollowUpClients = data.clients
    .filter((client) => client.statusLabel !== "Logged today")
    .slice(0, data.dashboardPreferences.followUpCount);

  return (
    <>
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {data.summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <LazyAdherenceTrendChart
          title="Adherence trend"
          description={`${data.dashboardPreferences.chartWindowDays}-day view of average client completion.`}
          data={data.adherenceTrend}
        />
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s compliance snapshot</CardTitle>
            <CardDescription>
              Quick percentage view of the habits that matter most.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.todayCheckInSnapshot.map((item) => (
              <div
                key={item.label}
                className="surface-muted flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                <span className="font-display text-2xl text-slate-900">{item.value}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Needs follow-up</CardTitle>
              <CardDescription>
                Quick scan of the clients who still need a touchpoint today. Use Clients for the
                full roster and profile management.
              </CardDescription>
            </div>
            <Link href="/coach/clients" className="block w-full sm:inline-block sm:w-auto">
              <Button variant="secondary" size="sm" fullWidth>
                Open clients
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {needsFollowUpClients.length ? (
              <div className="space-y-3">
                {needsFollowUpClients.map((client) => (
                  <div key={client.id} className="surface-muted p-4">
                    <div className="flex flex-col gap-3">
                      <div className="space-y-1">
                        <Link
                          href={`/coach/clients/${client.id}`}
                          className="text-base font-semibold text-slate-900"
                        >
                          {client.fullName}
                        </Link>
                        <p className="break-words text-sm text-slate-600">
                          {client.accountEmail ?? "Account not claimed yet"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          tone={
                            client.statusTone === "success"
                              ? "success"
                              : client.statusTone === "warning"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {client.statusLabel}
                        </Badge>
                        <Badge tone="accent">{client.streak} day streak</Badge>
                        <Badge tone={client.accountClaimed ? "success" : "warning"}>
                          {client.accountClaimed ? "Claimed" : "Not claimed"}
                        </Badge>
                        <Badge tone="neutral">Protein {client.proteinConsistency}%</Badge>
                        <Badge tone="neutral">Steps {client.stepConsistency}%</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="surface-muted p-5 text-sm text-slate-700">
                All clients have logged today. Use the Clients page when you want the full roster
                or need to edit profiles.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Momentum clients</CardTitle>
            <CardDescription>
              Clients carrying the strongest current streaks and adherence right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.momentumClients.map((client) => (
              <div key={client.id} className="surface-muted px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{client.fullName}</p>
                    <p className="text-sm text-slate-600">{client.streak} day streak</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-display text-2xl text-slate-900">{client.adherence}%</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Adherence</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
