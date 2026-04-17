"use client";

import dynamic from "next/dynamic";

import { ChartPlaceholder } from "@/components/charts/chart-placeholder";

const WeightTrendChart = dynamic(
  () => import("@/components/charts/weight-trend-chart").then((mod) => mod.WeightTrendChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder />,
  },
);

export function LazyWeightTrendChart({
  data,
  title,
  description,
}: {
  data: Array<{ label: string; weight: number }>;
  title?: string;
  description?: string;
}) {
  return <WeightTrendChart data={data} title={title} description={description} />;
}
