import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import type { DashboardSummaryCard } from "@/lib/types/app";

export function StatCard({ label, value, hint: _hint, tone }: DashboardSummaryCard) {
  void _hint;
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-3 text-4xl font-display text-slate-900">{value}</p>
        </div>
        <Badge tone={tone === "accent" ? "accent" : tone}>{tone}</Badge>
      </CardHeader>
    </Card>
  );
}
