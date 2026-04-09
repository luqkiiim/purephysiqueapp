import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import type { DashboardSummaryCard } from "@/lib/types/app";

export function StatCard({ label, value, hint: _hint, tone }: DashboardSummaryCard) {
  const hint = _hint;
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-3 text-3xl font-display text-slate-900 sm:text-4xl">{value}</p>
          <p className="mt-2 text-sm leading-5 text-slate-600">{hint}</p>
        </div>
        <Badge tone={tone === "accent" ? "accent" : tone} className="self-start">
          {tone}
        </Badge>
      </CardHeader>
    </Card>
  );
}
