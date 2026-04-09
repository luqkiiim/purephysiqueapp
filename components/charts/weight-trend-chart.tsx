"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WeightTrendChart({
  data,
  title = "Body weight trend",
  description = "Simple rolling view of scale movement over time.",
}: {
  data: Array<{ label: string; weight: number }>;
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-60 px-0 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8c061" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#e8c061" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1d9ca" />
            <XAxis
              dataKey="label"
              stroke="#646464"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={18}
              tickMargin={8}
            />
            <YAxis stroke="#646464" fontSize={12} tickLine={false} axisLine={false} width={32} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#2d2e2d"
              strokeWidth={3}
              fill="url(#weightFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
