"use client"

import type { FormEvent } from "react"
import { useEffect, useState } from "react"

import { getSession, signIn, useSession } from "next-auth/react"
import Link from "next/link"
import {
  Check,
  Activity,
  Lock as LockIcon,
  Star,
  Eye,
  EyeOff,
  Mail,
  ArrowRight,
  Shield,
  Notebook
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ButtonLoader } from "@/components/loading/button-loader"

interface BeltNodeProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  status: "completed" | "current" | "locked"
  opacity?: number
}

function BeltNode({ icon, title, subtitle, status, opacity = 100 }: BeltNodeProps) {
  const isCompleted = status === "completed"
  const isCurrent = status === "current"
  const isLocked = status === "locked"

  const borderColor = isCompleted
    ? "border-white bg-white"
    : isCurrent
    ? "border-blue-600 bg-blue-600"
    : isLocked && title === "Purple Belt"
    ? "border-purple-800 bg-transparent"
    : isLocked && title === "Brown Belt"
    ? "border-stone-800 bg-transparent"
    : "border-slate-900 bg-slate-900"

  const textColor = isLocked ? "text-slate-300" : "text-white"
  const subtitleColor = isCurrent ? "text-[#2dd4bf]" : "text-slate-500"
  const subtitleWeight = isCurrent ? "font-semibold" : ""
  const opacityClass = opacity < 100 ? `opacity-${opacity}` : ""

  return (
    <div className={`flex items-center gap-6 group ${opacityClass}`} style={{ opacity: opacity / 100 }}>
      <div
        className={`w-12 h-12 rounded-full border-2 ${borderColor} flex items-center justify-center transition-transform group-hover:scale-110 ${
          isCurrent ? "belt-glow" : ""
        }`}
      >
        {icon}
      </div>
      <div>
        <p className={`font-medium ${textColor}`}>{title}</p>
        <p className={`text-xs ${subtitleColor} uppercase tracking-widest ${subtitleWeight}`}>
          {subtitle}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      window.location.replace("/dashboard")
    }
  }, [status, session])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error === "CredentialsSignin") {
        setError("Invalid email or password")
      } else if (!result?.ok || result.error) {
        setError("Sign-in failed. Open the address configured for this installation and try again.")
      } else if (!(await getSession())?.user) {
        setError("Your browser did not keep the session. Check the site address and allow cookies, then try again.")
      } else {
        window.location.replace("/dashboard")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-[#020617]">
      <style jsx global>{`
        .belt-glow {
          box-shadow: 0 0 15px rgba(45, 212, 191, 0.3);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .belt-node {
          position: relative;
          transition: all 0.3s ease;
        }
        .belt-node:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 100%;
          width: 2px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(-50%);
        }
      `}</style>

      <section className="relative w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 xl:p-24 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border-r border-white/5">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-xl animate-fade-in">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 text-white">
            Welcome Back to Your{" "}
            <span className="text-[#2dd4bf]">BJJ Journey</span>
          </h1>
          <p className="text-slate-400 text-lg lg:text-xl font-light mb-12">
            Every roll is a lesson, every mat hour is progress. Log in to track your
            evolution on the path to mastery.
          </p>

          <div className="flex flex-col gap-6">
            <BeltNode
              icon={<Check className="text-black text-xl" />}
              title="White Belt"
              subtitle="Mastered Fundamentals"
              status="completed"
            />

            <BeltNode
              icon={<Activity className="text-white text-xl animate-pulse" />}
              title="Blue Belt"
              subtitle="Currently Pursuing"
              status="current"
            />

            <BeltNode
              icon={<LockIcon className="text-purple-800 text-xl" />}
              title="Purple Belt"
              subtitle="Technical Refinement"
              status="locked"
              opacity={40}
            />

            <BeltNode
              icon={<LockIcon className="text-stone-800 text-xl" />}
              title="Brown Belt"
              subtitle="Concept Mastery"
              status="locked"
              opacity={20}
            />

            <BeltNode
              icon={<Star className="text-slate-800 text-xl" />}
              title="Black Belt"
              subtitle="Professor Level"
              status="locked"
              opacity={10}
            />
          </div>
        </div>

        <div className="absolute bottom-10 right-10 animate-float opacity-30">
          <Notebook className="text-9xl text-slate-700" />
        </div>
      </section>

      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#2dd4bf]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full" />

        <div className="w-full max-w-md glass-effect p-8 sm:p-12 rounded-[2rem] shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-[#2dd4bf] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2dd4bf]/20 mb-4">
              <Notebook className="text-black text-3xl" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              BJJ Journey
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Sign in to continue your training
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 ml-1">
                Email Address
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#2dd4bf] transition-colors" style={{ left: "16px" }}>
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border-slate-800 text-white text-sm rounded-xl !pl-12 p-3.5 placeholder:text-slate-600 focus-visible:border-[#2dd4bf] focus-visible:ring-[#2dd4bf]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300 ml-1">
                  Password
                </Label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#2dd4bf] transition-colors" style={{ left: "16px" }}>
                  <LockIcon className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border-slate-800 text-white text-sm rounded-xl !pl-12 !pr-12 p-3.5 placeholder:text-slate-600 focus-visible:border-[#2dd4bf] focus-visible:ring-[#2dd4bf]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center text-slate-500 hover:text-white transition-colors"
                  style={{ right: "16px" }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="data-[state=checked]:bg-[#2dd4bf] data-[state=checked]:border-[#2dd4bf] data-[state=checked]:text-black"
                />
                <span className="text-slate-400 group-hover:text-slate-300">
                  Remember me
                </span>
              </label>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                {error}
              </p>
            )}

            {isLoading ? (
              <ButtonLoader text="Signing in..." className="w-full bg-[#2dd4bf] text-[#020617] font-bold py-4 rounded-xl shadow-lg shadow-[#2dd4bf]/20 hover:bg-[#26b4a3] hover:shadow-xl hover:shadow-[#2dd4bf]/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2" />
            ) : (
              <Button
                type="submit"
                className="w-full bg-[#2dd4bf] text-[#020617] font-bold py-4 rounded-xl shadow-lg shadow-[#2dd4bf]/20 hover:bg-[#26b4a3] hover:shadow-xl hover:shadow-[#2dd4bf]/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </form>

          <p className="mt-10 text-center text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-[#2dd4bf] font-semibold hover:underline decoration-2 underline-offset-4"
            >
              Create free account
            </Link>
          </p>
        </div>

      </section>
    </div>
  )
}
