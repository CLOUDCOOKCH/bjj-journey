"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { JournalEntryDialog } from "@/components/journal-entry-dialog"
import { formatDateToYYYYMMDD } from "@/lib/utils/date"
import { getSessionTypeBadgeColor, getSessionTypeLabel } from "@/lib/utils/calendar-stats"
import { JournalEntry as DbJournalEntry } from "@/lib/db/schema"

interface JournalEntryWithTechniques extends DbJournalEntry {
  techniques?: any[]
}

interface CalendarViewProps {
  entries: JournalEntryWithTechniques[]
  userId: string
  onAddPastSession: () => void
}

export default function CalendarView({ entries, userId, onAddPastSession }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => setCurrentDate(new Date(year, month - 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1))
  const goToToday = () => setCurrentDate(new Date())

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day)
    setSelectedDate(clickedDate)
    setIsDialogOpen(true)
  }

  const getEntryForDate = (date: Date): JournalEntryWithTechniques | undefined => {
    const dateStr = formatDateToYYYYMMDD(date)
    return entries.find((entry) => entry.entryDate === dateStr)
  }

  const calendarDays = []
  
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevMonthDay = lastDayOfMonth.getDate() - (startingDayOfWeek - i) + 1
    calendarDays.push(
      <div key={`empty-${i}`} className="calendar-day p-4 border-r border-b border-slate-800/40 text-slate-700 font-medium text-sm">
        {prevMonthDay}
      </div>
    )
  }

  const today = new Date()

  for (let day = 1; day <= daysInMonth; day++) {
    const entry = getEntryForDate(new Date(year, month, day))
    const hasEntry = !!entry
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    const sessionType = entry?.sessionType as "regular" | "competition" | "open_mat" | undefined

    calendarDays.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`
          calendar-day p-4 border-r border-b border-slate-800/40 group cursor-pointer hover:bg-slate-900/40 transition-colors relative
          ${isToday ? "ring-2 ring-teal-500 ring-inset bg-teal-500/10" : ""}
        `}
      >
        <span className={`text-sm font-semibold ${isToday ? "text-teal-400" : hasEntry ? "text-slate-200" : "text-slate-500"}`}>
          {day}
        </span>
        {hasEntry && sessionType && (
          <div className="mt-2 flex flex-col gap-1">
            <div className={`h-1.5 w-full ${getSessionTypeBadgeColor(sessionType).bg} rounded-full ${isToday ? "shadow-[0_0_8px_rgba(45,212,191,0.5)]" : ""}`} />
            <span className={`text-[8px] font-bold uppercase ${getSessionTypeBadgeColor(sessionType).text}`}>
              {getSessionTypeLabel(sessionType)}
            </span>
          </div>
        )}
      </button>
    )
  }

  const remainingCells = 7 - ((startingDayOfWeek + daysInMonth) % 7)
  for (let i = 1; i < (remainingCells === 7 ? 0 : remainingCells); i++) {
    calendarDays.push(
      <div key={`next-${i}`} className="calendar-day p-4 border-r border-b border-slate-800/40 text-slate-700 font-medium text-sm">
        {i}
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-100">{monthNames[month]} {year}</h2>
          <div className="flex gap-1">
            <Button
              onClick={previousMonth}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-slate-900 text-slate-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={nextMonth}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-slate-900 text-slate-400"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          onClick={goToToday}
          variant="outline"
          className="text-xs font-bold uppercase tracking-widest text-teal-400 hover:bg-teal-400/10 px-4 py-2 rounded-lg border-teal-500/20"
        >
          Today
        </Button>
      </div>

      <Card className="glass-card border-slate-800/60 bg-slate-900/40 backdrop-blur-sm rounded-3xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-800/60 bg-slate-900/30">
          {dayNames.map((day) => (
            <div key={day} className="py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 bg-slate-950/20">
          {calendarDays}
        </div>
      </Card>

      <JournalEntryDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setSelectedDate(null)
        }}
        selectedDate={selectedDate}
        userId={userId}
        existingEntry={selectedDate ? getEntryForDate(selectedDate) : undefined}
      />
    </div>
  )
}
