import { JournalEntry } from '@/lib/db/schema'

export type SessionType = 'regular' | 'competition' | 'open_mat'

export interface CalendarStats {
  currentStreak: number
  sessionsThisMonth: number
  monthlyGoal: number
  monthlyProgress: number
  totalMatTime: string
}

export interface SessionCountByType {
  regular: number
  competition: number
  open_mat: number
}

export function calculateCurrentStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.entryDate)
    entryDate.setHours(0, 0, 0, 0)
    
    const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 0) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (daysDiff === 1) {
      streak++
      currentDate = entryDate
    } else {
      break
    }
  }

  return streak
}

export function countSessionsThisMonth(entries: JournalEntry[], year: number, month: number): number {
  return entries.filter(entry => {
    const entryDate = new Date(entry.entryDate)
    return entryDate.getFullYear() === year && entryDate.getMonth() === month
  }).length
}

export function countSessionsByType(entries: JournalEntry[]): SessionCountByType {
  return entries.reduce((acc, entry) => {
    const sessionType = entry.sessionType as SessionType
    acc[sessionType]++
    return acc
  }, { regular: 0, competition: 0, open_mat: 0 })
}

export function calculateTotalMatTime(entries: JournalEntry[]): string {
  const totalMinutes = entries.reduce((sum, entry) => {
    return sum + (entry.durationMinutes || 90)
  }, 0)

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function calculateCalendarStats(
  entries: JournalEntry[],
  monthlyGoal: number
): CalendarStats {
  const currentStreak = calculateCurrentStreak(entries)
  
  const now = new Date()
  const sessionsThisMonth = countSessionsThisMonth(
    entries,
    now.getFullYear(),
    now.getMonth()
  )
  
  const monthlyProgress = monthlyGoal > 0 ? (sessionsThisMonth / monthlyGoal) * 100 : 0
  const totalMatTime = calculateTotalMatTime(entries)

  return {
    currentStreak,
    sessionsThisMonth,
    monthlyGoal,
    monthlyProgress: Math.min(monthlyProgress, 100),
    totalMatTime,
  }
}

export function getSessionTypeColor(sessionType: SessionType): string {
  switch (sessionType) {
    case 'regular':
      return 'bg-teal-500'
    case 'competition':
      return 'bg-purple-500'
    case 'open_mat':
      return 'bg-blue-500'
    default:
      return 'bg-teal-500'
  }
}

export function getSessionTypeLabel(sessionType: SessionType): string {
  switch (sessionType) {
    case 'regular':
      return 'Regular Training'
    case 'competition':
      return 'Competition'
    case 'open_mat':
      return 'Open Mat'
    default:
      return 'Regular Training'
  }
}

export function getSessionTypeBadgeColor(sessionType: SessionType): {
  bg: string
  text: string
} {
  switch (sessionType) {
    case 'regular':
      return {
        bg: 'bg-teal-500/40',
        text: 'text-teal-400',
      }
    case 'competition':
      return {
        bg: 'bg-purple-500/40',
        text: 'text-purple-400',
      }
    case 'open_mat':
      return {
        bg: 'bg-blue-500/40',
        text: 'text-blue-400',
      }
    default:
      return {
        bg: 'bg-teal-500/40',
        text: 'text-teal-400',
      }
  }
}
