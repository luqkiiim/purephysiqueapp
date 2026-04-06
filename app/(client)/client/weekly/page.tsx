import { AdherenceTrendChart } from "@/components/charts/adherence-trend-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientHomeData } from "@/lib/data/client";
import { formatShortDate } from "@/lib/utils";

export default async function ClientWeeklyPage() {
  const data = await getClientHomeData();
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
            <CardContent className="grid grid-cols-2 gap-3">
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

      <AdherenceTrendChart
        title="Weekly adherence rhythm"
        description="Your recent completion pattern at a glance."
        data={adherenceData}
      />

      <Card>
        <CardHeader>
          <CardTitle>Consistency cues</CardTitle>
          <CardDescription>
            The app keeps analytics clear: hit targets, protect streaks, and keep recovery visible.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="surface-muted p-4 text-sm text-slate-700">
            Daily protein and steps are the biggest levers for adherence.
          </div>
          <div className="surface-muted p-4 text-sm text-slate-700">
            Sleep and body weight give your coach enough context to interpret progress.
          </div>
          <div className="surface-muted p-4 text-sm text-slate-700">
            Hydration makes recovery and appetite trends easier to spot early.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
