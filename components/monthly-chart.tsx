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
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-500">
      <h3 className="text-xl font-bold text-white mb-6">Training Frequency (Last 6 Months)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Bar dataKey="sessions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
