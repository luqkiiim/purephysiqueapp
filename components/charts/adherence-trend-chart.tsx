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

export function AdherenceTrendChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Array<{ label: string; adherence: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1d9ca" />
            <XAxis dataKey="label" stroke="#646464" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#646464" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="adherence"
              stroke="#b39244"
              strokeWidth={3}
              dot={{ r: 4, fill: "#2d2e2d", stroke: "#e8c061", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
