"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AccuracyTrendProps {
  data: Array<{
    date: string
    detections: number
    accuracy: number
  }>
}

export default function AccuracyTrend({ data }: AccuracyTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" stroke="var(--muted-foreground)" />
        <YAxis stroke="var(--muted-foreground)" domain={[80, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: `1px solid var(--border)`,
            borderRadius: "8px",
          }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ fill: "var(--primary)", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
