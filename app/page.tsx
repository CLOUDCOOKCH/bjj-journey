import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-3xl text-center space-y-8">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-6xl font-bold text-white tracking-tight">Jiu-Jitsu Tracker</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Track your training sessions, document techniques, and monitor your progress on the journey to black belt.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 transition-all duration-200 hover:scale-105"
          >
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-slate-700 bg-slate-900/50 text-white hover:bg-slate-800/50 text-lg px-8 transition-all duration-200 hover:scale-105"
          >
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">Track Sessions</h3>
            <p className="text-sm text-slate-400">Log your training days and monitor attendance patterns</p>
          </div>
          <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">Document Techniques</h3>
            <p className="text-sm text-slate-400">Save moves with YouTube links and personal notes</p>
          </div>
          <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">Track Progress</h3>
            <p className="text-sm text-slate-400">Record belt promotions and stripe achievements</p>
          </div>
        </div>
      </div>
    </div>
  )
}
