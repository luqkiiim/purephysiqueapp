import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DashboardSummaryCard } from "@/lib/types/app";

export function StatCard({ label, value, hint, tone }: DashboardSummaryCard) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-3 text-4xl font-display text-slate-900">{value}</p>
        </div>
        <Badge tone={tone === "accent" ? "accent" : tone}>{tone}</Badge>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 pt-4">
        <p className="text-sm text-slate-600">{hint}</p>
        <ArrowUpRight className="h-5 w-5 text-slate-400" />
      </CardContent>
    </Card>
  );
}
