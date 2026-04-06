import Link from "next/link";

import { CoachShell } from "@/components/layout/coach-shell";
import { AdherenceTrendChart } from "@/components/charts/adherence-trend-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getCoachDashboardData } from "@/lib/data/coach";
import { isLiveAppEnabled } from "@/lib/supabase/config";

export default async function CoachDashboardPage() {
  const data = await getCoachDashboardData();

  return (
    <CoachShell
      heading="Coach dashboard"
      subheading="Track who logged today, spot missed check-ins early, and keep momentum visible across the whole roster."
      demoMode={!isLiveAppEnabled}
      actions={
        <Link href="/coach/clients/new">
          <Button variant="coral" size="sm">
            Add client
          </Button>
        </Link>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <AdherenceTrendChart
          title="Adherence trend"
          description="Six-week view of average client completion."
          data={data.adherenceTrend}
        />
        <Card>
          <CardHeader>
            <CardTitle>Today’s compliance snapshot</CardTitle>
            <CardDescription>
              Quick percentage view of the habits that matter most.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.todayCheckInSnapshot.map((item) => (
              <div
                key={item.label}
                className="surface-muted flex items-center justify-between px-4 py-4"
              >
                <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                <span className="font-display text-2xl text-slate-900">{item.value}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Client roster</CardTitle>
              <CardDescription>
                Daily logging status, streaks, protein consistency, and step consistency.
              </CardDescription>
            </div>
            <Link href="/coach/clients">
              <Button variant="secondary" size="sm">
                View all clients
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {data.clients.length ? (
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Streak</th>
                    <th className="pb-3 font-medium">Protein</th>
                    <th className="pb-3 font-medium">Steps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.clients.map((client) => (
                    <tr key={client.id}>
                      <td className="py-4">
                        <Link href={`/coach/clients/${client.id}`} className="font-semibold text-slate-900">
                          {client.fullName}
                        </Link>
                        <p className="text-slate-500">{client.email}</p>
                      </td>
                      <td className="py-4 text-slate-700">{client.statusLabel}</td>
                      <td className="py-4 text-slate-700">{client.streak} days</td>
                      <td className="py-4 text-slate-700">{client.proteinConsistency}%</td>
                      <td className="py-4 text-slate-700">{client.stepConsistency}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="surface-muted p-5 text-sm text-slate-700">
                No clients yet. Create the first client profile to start replacing the spreadsheet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Momentum clients</CardTitle>
            <CardDescription>
              Clients carrying the strongest current streaks and adherence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.momentumClients.map((client) => (
              <div key={client.id} className="surface-muted px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{client.fullName}</p>
                    <p className="text-sm text-slate-600">{client.streak} day streak</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl text-slate-900">{client.adherence}%</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Adherence</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </CoachShell>
  );
}
