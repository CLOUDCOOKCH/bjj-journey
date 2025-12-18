"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { JournalEntryDialog } from "@/components/journal-entry-dialog"

interface Technique {
  id: string
  name: string
  youtube_url: string | null
  notes: string | null
}

interface JournalEntry {
  id: string
  entry_date: string
  notes: string | null
  techniques: Technique[]
}

interface CalendarViewProps {
  entries: JournalEntry[]
  userId: string
}

export default function CalendarView({ entries, userId }: CalendarViewProps) {
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day)
    setSelectedDate(clickedDate)
    setIsDialogOpen(true)
  }

  const getEntryForDate = (day: number): JournalEntry | undefined => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0]
    return entries.find((entry) => entry.entry_date === dateStr)
  }

  const calendarDays = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="aspect-square" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const entry = getEntryForDate(day)
    const hasEntry = !!entry
    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

    calendarDays.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`
          aspect-square p-2 rounded-lg transition-all duration-200 group
          ${isToday ? "ring-2 ring-blue-500" : ""}
          ${hasEntry ? "bg-blue-600/20 hover:bg-blue-600/30 border-2 border-blue-500/50" : "bg-slate-800/30 hover:bg-slate-800/50 border-2 border-slate-700/30"}
          hover:scale-105 hover:shadow-lg
        `}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span className={`text-sm font-semibold ${hasEntry ? "text-blue-300" : "text-slate-300"}`}>{day}</span>
          {hasEntry && (
            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse group-hover:scale-125 transition-transform" />
          )}
        </div>
      </button>,
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {monthNames[month]} {year}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={previousMonth}
              variant="outline"
              size="icon"
              className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={nextMonth}
              variant="outline"
              size="icon"
              className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">{calendarDays}</div>

        <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-800">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-slate-300">Training Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-blue-500" />
              <span className="text-slate-300">Today</span>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedDate(new Date())
              setIsDialogOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
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
        existingEntry={selectedDate ? getEntryForDate(selectedDate.getDate()) : undefined}
      />
    </div>
  )
}
