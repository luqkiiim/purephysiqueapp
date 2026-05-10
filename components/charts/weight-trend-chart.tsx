"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getWeightDomain(data: Array<{ weight: number }>) {
  if (!data.length) {
    return [0, 1];
  }

  const weights = data.map((entry) => entry.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const padding = Math.max((max - min) * 0.25, 0.8);

  return [
    Number((min - padding).toFixed(1)),
    Number((max + padding).toFixed(1)),
  ];
}

export function WeightTrendChart({
  data,
  title = "Body weight trend",
  description = "Simple rolling view of scale movement over time.",
}: {
  data: Array<{ label: string; weight: number }>;
  title?: string;
  description?: string;
}) {
  const yDomain = getWeightDomain(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-60 px-0 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 18, left: -8, bottom: 0 }}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 8"
              stroke="#d8cfae"
              strokeOpacity={0.34}
            />
            <XAxis
              dataKey="label"
              stroke="#a8a29a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={18}
              tickMargin={8}
            />
            <YAxis
              domain={yDomain}
              stroke="#a8a29a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={42}
              tickFormatter={(value: number) => value.toFixed(1)}
            />
            <Tooltip
              cursor={{ stroke: "#e8c061", strokeOpacity: 0.28, strokeWidth: 2 }}
              contentStyle={{
                background: "#181818",
                border: "1px solid rgba(232, 192, 97, 0.4)",
                borderRadius: "14px",
                color: "#f8f3e7",
              }}
              formatter={(value: number) => [value.toFixed(1), "Weight"]}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#e8c061"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
              dot={{ r: 3.5, fill: "#181818", stroke: "#e8c061", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#e8c061", stroke: "#181818", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
