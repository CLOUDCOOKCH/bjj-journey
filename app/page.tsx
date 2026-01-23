import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="max-w-3xl text-center space-y-8">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent tracking-tight pb-2">Jiu-Jitsu Journey</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track your training sessions, document techniques, and monitor your progress on the journey to black belt.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          <Button
            asChild
            size="lg"
            className="text-lg px-8 transition-all duration-200 hover:scale-105 shadow-lg shadow-primary/20"
          >
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-lg px-8 transition-all duration-200 hover:scale-105 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
          >
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="p-6 bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
            <h3 className="text-lg font-semibold text-foreground mb-2">Track Sessions</h3>
            <p className="text-sm text-muted-foreground">Log your training days and monitor attendance patterns</p>
          </div>
          <div className="p-6 bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
            <h3 className="text-lg font-semibold text-foreground mb-2">Document Techniques</h3>
            <p className="text-sm text-muted-foreground">Save moves with YouTube links and personal notes</p>
          </div>
          <div className="p-6 bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
            <h3 className="text-lg font-semibold text-foreground mb-2">Track Progress</h3>
            <p className="text-sm text-muted-foreground">Record belt promotions and stripe achievements</p>
          </div>
        </div>
      </div>
    </div>
  )
}
