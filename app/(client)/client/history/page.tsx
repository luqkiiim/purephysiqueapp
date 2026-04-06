import { AdherenceTrendChart } from "@/components/charts/adherence-trend-chart";
import { TargetComparisonChart } from "@/components/charts/target-comparison-chart";
import { WeightTrendChart } from "@/components/charts/weight-trend-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientHistoryPageData } from "@/lib/data/client";
import { formatFullDate, formatShortDate } from "@/lib/utils";

export default async function ClientHistoryPage() {
  const data = await getClientHistoryPageData();

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
      <WeightTrendChart data={weightData} />
      <TargetComparisonChart
        title="Protein vs target"
        description="How your recent protein intake compares with the target your coach set."
        data={proteinData}
      />
      <AdherenceTrendChart
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
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{formatFullDate(entry.date)}</p>
                <p className="text-sm text-slate-600">{entry.completionPercentage}% complete</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
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
