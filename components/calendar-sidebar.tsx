import { Card } from '@/components/ui/card'
import { Flame, Clock, Plus } from 'lucide-react'
import { JournalEntry } from '@/lib/db/schema'
import { calculateCalendarStats, getSessionTypeColor, getSessionTypeLabel } from '@/lib/utils/calendar-stats'

interface CalendarSidebarProps {
  entries: JournalEntry[]
  monthlyGoal: number
  onAddPastSession: () => void
}

export function CalendarSidebar({ entries, monthlyGoal, onAddPastSession }: CalendarSidebarProps) {
  const stats = calculateCalendarStats(entries, monthlyGoal)

  const sessionTypes = ['regular', 'competition', 'open_mat'] as const

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
      <Card className="glass-card border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-6 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <Flame className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h3 className="font-bold uppercase tracking-widest text-slate-400 text-xs">Current Streak</h3>
            <p className="text-2xl font-bold text-slate-100">{stats.currentStreak} Days</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sessions This Month</span>
            <div className="flex items-end justify-between mt-1">
              <span className="text-xl font-bold text-slate-200">{stats.sessionsThisMonth}</span>
              <span className="text-xs font-semibold text-teal-400">Goal: {stats.monthlyGoal}</span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.4)] transition-all duration-500"
                style={{ width: `${stats.monthlyProgress}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mat Time</span>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-slate-400" />
              <p className="text-xl font-bold text-slate-200">{stats.totalMatTime}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="glass-card border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-6 rounded-3xl">
        <h4 className="font-bold uppercase tracking-widest text-slate-500 text-sm mb-4">Legend</h4>
        <div className="space-y-3">
          {sessionTypes.map((type) => (
            <div key={type} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getSessionTypeColor(type)}`} />
              <span className="text-xs font-medium text-slate-300">{getSessionTypeLabel(type)}</span>
            </div>
          ))}
        </div>
      </Card>

      <button
        onClick={onAddPastSession}
        className="w-full flex items-center justify-center gap-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-teal-500/10 active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
      >
        <Plus className="h-5 w-5" />
        <span>Add Past Session</span>
      </button>
    </div>
  )
}
