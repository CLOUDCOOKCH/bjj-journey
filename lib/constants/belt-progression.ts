/**
 * Belt progression constants and utilities for Jiu Jitsu rank tracking
 */

export const BELT_ORDER = ['white', 'blue', 'purple', 'brown', 'black'] as const
export type BeltRank = typeof BELT_ORDER[number]

export const BELT_COLORS: Record<BeltRank, { bg: string; text: string; border: string; name: string }> = {
  white: {
    bg: 'bg-white',
    text: 'text-slate-900',
    border: 'border-slate-300',
    name: 'White Belt'
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-600',
    name: 'Blue Belt'
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-white',
    border: 'border-purple-600',
    name: 'Purple Belt'
  },
  brown: {
    bg: 'bg-amber-700',
    text: 'text-white',
    border: 'border-amber-800',
    name: 'Brown Belt'
  },
  black: {
    bg: 'bg-slate-900',
    text: 'text-white',
    border: 'border-slate-700',
    name: 'Black Belt'
  },
}

export const MAX_STRIPES = 4

/**
 * Typical time requirements for belt promotion (varies by school/instructor)
 */
export const TIME_REQUIREMENTS: Record<BeltRank, { minMonths: number; typicalSessions: number }> = {
  white: { minMonths: 12, typicalSessions: 150 },
  blue: { minMonths: 24, typicalSessions: 300 },
  purple: { minMonths: 36, typicalSessions: 450 },
  brown: { minMonths: 48, typicalSessions: 600 },
  black: { minMonths: 60, typicalSessions: 1000 },
}

/**
 * Get the next belt rank after the current one
 */
export function getNextBelt(currentBelt: BeltRank): BeltRank | null {
  const currentIndex = BELT_ORDER.indexOf(currentBelt)
  return currentIndex < BELT_ORDER.length - 1 ? BELT_ORDER[currentIndex + 1] : null
}

/**
 * Get belt display name with proper capitalization
 */
export function getBeltDisplayName(belt: string): string {
  return BELT_COLORS[belt as BeltRank]?.name || belt.charAt(0).toUpperCase() + belt.slice(1)
}

/**
 * Calculate how many sessions until next stripe (approximately every 35 sessions)
 */
export function calculateSessionsUntilNextStripe(sessionsSincePromotion: number, currentStripes: number): number {
  if (currentStripes >= MAX_STRIPES) return 0

  const sessionsPerStripe = 35
  const sessionsForCurrentStripe = sessionsSincePromotion % sessionsPerStripe
  return sessionsPerStripe - sessionsForCurrentStripe
}
