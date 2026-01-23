"use client"

import { Card } from "@/components/ui/card"

interface MonthlyChartProps {
  data: {
    month: string
    sessions: number
  }[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const maxSessions = Math.max(...data.map((d) => d.sessions), 1)
  const currentIndex = data.length - 1 // Last item is current month

  return (
    <section className="animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Training Volume</h2>
      <Card className="border-border/50 bg-card/40 backdrop-blur-md p-6 rounded-2xl h-[300px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Past 6 Months</span>
          <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">Consistent</span>
        </div>

        {/* Bar Chart */}
        <div className="flex-1 flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = (item.sessions / maxSessions) * 100
            const isCurrentMonth = index === currentIndex

            return (
              <div
                key={item.month}
                className={`
                  flex-1 rounded-t-lg relative group transition-all duration-300
                  ${isCurrentMonth ? "bg-primary/20 ring-1 ring-inset ring-primary/40 hover:bg-primary/30" : "bg-muted hover:bg-primary/20"}
                `}
                style={{ height: `${height}%` }}
              >
                {/* Tooltip - visible on hover */}
                <span
                  className={`
                    absolute -top-6 left-1/2 -translate-x-1/2
                    text-[10px] font-bold transition-opacity
                    ${isCurrentMonth ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100"}
                  `}
                >
                  {item.sessions}
                </span>

                {/* Month label */}
                <span
                  className={`
                    absolute -bottom-6 left-1/2 -translate-x-1/2
                    text-[10px] font-medium uppercase
                    ${isCurrentMonth ? "text-primary font-bold" : "text-muted-foreground"}
                  `}
                >
                  {item.month}
                </span>
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}
