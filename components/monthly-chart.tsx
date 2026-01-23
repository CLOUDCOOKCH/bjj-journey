"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MonthlyChartProps {
  data: {
    month: string
    sessions: number
  }[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-md p-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-500">
      <h3 className="text-xl font-bold text-foreground mb-6">Training Frequency (Last 6 Months)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--muted-foreground)"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              dy={10}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                color: "var(--popover-foreground)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
              }}
              cursor={{ fill: "var(--accent)", opacity: 0.1 }}
            />
            <Bar
              dataKey="sessions"
              fill="var(--primary)"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
