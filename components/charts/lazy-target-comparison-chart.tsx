"use client";

import dynamic from "next/dynamic";

import { ChartPlaceholder } from "@/components/charts/chart-placeholder";

const TargetComparisonChart = dynamic(
  () =>
    import("@/components/charts/target-comparison-chart").then((mod) => mod.TargetComparisonChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder />,
  },
);

export function LazyTargetComparisonChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Array<{ label: string; actual: number; target: number }>;
}) {
  return <TargetComparisonChart title={title} description={description} data={data} />;
}
