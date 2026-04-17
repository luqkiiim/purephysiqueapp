"use client";

import dynamic from "next/dynamic";

import { ChartPlaceholder } from "@/components/charts/chart-placeholder";

const AdherenceTrendChart = dynamic(
  () => import("@/components/charts/adherence-trend-chart").then((mod) => mod.AdherenceTrendChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder />,
  },
);

export function LazyAdherenceTrendChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Array<{ label: string; adherence: number }>;
}) {
  return <AdherenceTrendChart title={title} description={description} data={data} />;
}
