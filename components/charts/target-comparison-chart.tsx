"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TargetComparisonChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Array<{ label: string; actual: number; target: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-60 px-0 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
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
            <Bar dataKey="target" fill="#fae9be" radius={[10, 10, 0, 0]} />
            <Bar dataKey="actual" fill="#e8c061" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
