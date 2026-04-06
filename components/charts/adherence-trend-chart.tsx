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
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e0d2" />
            <XAxis dataKey="label" stroke="#6b7b7a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7b7a" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="adherence"
              stroke="#1eb7a6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#ff7f63" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
