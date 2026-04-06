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
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1eb7a6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1eb7a6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e0d2" />
            <XAxis dataKey="label" stroke="#6b7b7a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7b7a" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#1d2b2a"
              strokeWidth={3}
              fill="url(#weightFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
