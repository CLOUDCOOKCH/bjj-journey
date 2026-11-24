"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  User,
  Mail,
  Lock as LockIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Check,
  Activity,
  Notebook,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
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

type PasswordStrength = "weak" | "fair" | "good" | "strong"

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return "weak"
  if (score === 2) return "fair"
  if (score === 3) return "good"
  return "strong"
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  const hasLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  const strengthConfig = {
    weak: { bars: 1, color: "bg-red-500", text: "Weak", textColor: "text-red-400" },
    fair: { bars: 2, color: "bg-orange-500", text: "Fair", textColor: "text-orange-400" },
    good: { bars: 3, color: "bg-yellow-500", text: "Good", textColor: "text-yellow-400" },
    strong: { bars: 4, color: "bg-teal-500", text: "Strong", textColor: "text-teal-400" },
  }

  const config = strengthConfig[strength]

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${
              i <= config.bars ? config.color : "bg-slate-700"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-[10px] font-bold tracking-wider uppercase ${config.textColor}`}>
          {config.text} Password
        </p>
        <p className="text-[10px] text-slate-500">
          {password.length >= 8 ? "8+ chars" : "Min 8 chars"}
        </p>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/dashboard")
    }
  }, [status, session, router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!name.trim()) {
      setError("Name is required")
      setIsLoading(false)
      return
    }

    if (name.length < 2) {
      setError("Name must be at least 2 characters")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create account")
        setIsLoading(false)
        return
      }

      toast.success("Account created successfully! Redirecting to login...", {
        duration: 3000,
      })

      setTimeout(() => {
        router.push("/auth/login")
      }, 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
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
            Begin Your Journey{" "}
            <span className="text-[#2dd4bf]">To Black Belt.</span>
          </h1>
          <p className="text-slate-400 text-lg lg:text-xl font-light mb-12">
            Join thousands of martial artists documenting their path. Track every roll, every technique, and every milestone on your way to mastery.
          </p>

          <div className="flex flex-col gap-6">
            <BeltNode
              icon={<Check className="text-black text-xl" />}
              title="White Belt"
              subtitle="The Beginning"
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
              Create your account
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Enter your details to get started
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 ml-1">
                Full Name
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#2dd4bf] transition-colors" style={{ left: "16px" }}>
                  <User className="h-5 w-5" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Wick"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/50 border-slate-800 text-white text-sm rounded-xl !pl-12 p-3.5 placeholder:text-slate-600 focus-visible:border-[#2dd4bf] focus-visible:ring-[#2dd4bf]/20"
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="text-slate-300 ml-1">
                Password
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#2dd4bf] transition-colors" style={{ left: "16px" }}>
                  <LockIcon className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
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
              {password && <PasswordStrengthIndicator password={password} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300 ml-1">
                Confirm Password
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#2dd4bf] transition-colors" style={{ left: "16px" }}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border-slate-800 text-white text-sm rounded-xl !pl-12 !pr-12 p-3.5 placeholder:text-slate-600 focus-visible:border-[#2dd4bf] focus-visible:ring-[#2dd4bf]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center text-slate-500 hover:text-white transition-colors"
                  style={{ right: "16px" }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                {error}
              </p>
            )}

            {isLoading ? (
              <ButtonLoader text="Creating account..." className="w-full bg-[#2dd4bf] text-[#020617] font-bold py-4 rounded-xl shadow-lg shadow-[#2dd4bf]/20 hover:bg-[#26b4a3] hover:shadow-xl hover:shadow-[#2dd4bf]/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2" />
            ) : (
              <Button
                type="submit"
                className="w-full bg-[#2dd4bf] text-[#020617] font-bold py-4 rounded-xl shadow-lg shadow-[#2dd4bf]/20 hover:bg-[#26b4a3] hover:shadow-xl hover:shadow-[#2dd4bf]/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </form>

          <p className="mt-8 text-center text-slate-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[#2dd4bf] font-semibold hover:underline decoration-2 underline-offset-4"
            >
              Sign in here
            </Link>
          </p>
        </div>

      </section>
    </div>
  )
}
