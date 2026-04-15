import Link from "next/link";

import { CoachShell } from "@/components/layout/coach-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getCoachClientsPageData } from "@/lib/data/coach";
import { isLiveAppEnabled } from "@/lib/supabase/config";

export default async function CoachClientsPage() {
  const data = await getCoachClientsPageData();
  const loggedTodayCount = data.clients.filter((client) => client.statusLabel === "Logged today").length;
  const longestStreak = data.clients.reduce(
    (highestStreak, client) => Math.max(highestStreak, client.streak),
    0,
  );
  const averageConsistency = data.clients.length
    ? Math.round(
        data.clients.reduce(
          (total, client) =>
            total + Math.round((client.proteinConsistency + client.stepConsistency) / 2),
          0,
        ) / data.clients.length,
      )
    : 0;
  const rosterSummaryCards = [
    {
      label: "Total clients",
      value: `${data.clients.length}`,
      hint: "Managed from this roster",
      tone: "neutral" as const,
    },
    {
      label: "Logged today",
      value: `${loggedTodayCount}`,
      hint: "Clients already checked in",
      tone: "success" as const,
    },
    {
      label: "Needs follow-up",
      value: `${Math.max(data.clients.length - loggedTodayCount, 0)}`,
      hint: "Roster gaps to review",
      tone: "warning" as const,
    },
    {
      label: "Average consistency",
      value: `${averageConsistency}%`,
      hint: longestStreak ? `Top streak ${longestStreak} days` : "No streaks yet",
      tone: "accent" as const,
    },
  ];

  return (
    <CoachShell
      heading="Clients"
      subheading="This is the roster-management home for profiles, access codes, targets, and direct links into each client record."
      demoMode={!isLiveAppEnabled}
      actions={
        <Link href="/coach/clients/new" className="block w-full sm:inline-block sm:w-auto">
          <Button variant="coral" size="sm" fullWidth>
            New client
          </Button>
        </Link>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rosterSummaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4">
        {data.clients.length ? (
          data.clients.map((client) => (
            <Card key={client.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      tone={
                        client.statusTone === "success"
                          ? "success"
                          : client.statusTone === "warning"
                            ? "warning"
                            : "neutral"
                      }
                      className="self-start"
                    >
                      {client.statusLabel}
                    </Badge>
                    <Badge tone="accent" className="self-start">
                      {client.streak} day streak
                    </Badge>
                  </div>
                  <div>
                    <CardTitle>{client.fullName}</CardTitle>
                    <CardDescription>Access code managed by coach</CardDescription>
                  </div>
                </div>
                <div className="grid gap-2 sm:flex sm:flex-wrap">
                  <Link
                    href={`/coach/clients/${client.id}`}
                    className="block w-full sm:inline-block sm:w-auto"
                  >
                    <Button variant="secondary" size="sm" fullWidth>
                      View client
                    </Button>
                  </Link>
                  <Link
                    href={`/coach/clients/${client.id}/edit`}
                    className="block w-full sm:inline-block sm:w-auto"
                  >
                    <Button variant="ghost" size="sm" fullWidth>
                      Edit profile
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Streak</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{client.streak} days</p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Protein consistency</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{client.proteinConsistency}%</p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step consistency</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{client.stepConsistency}%</p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recent weight</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {client.recentWeight ? client.recentWeight : "No log yet"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No clients yet</CardTitle>
              <CardDescription>
                Start with one client profile, then add targets and share the client access code.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </CoachShell>
  );
}
