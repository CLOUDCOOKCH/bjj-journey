/**
 * Progress calculation utilities for belt progression tracking
 */

import { JournalEntry } from '@/lib/db/schema'
import { BeltRank, getNextBelt, TIME_REQUIREMENTS, calculateSessionsUntilNextStripe, parseBeltInfo } from '@/lib/constants/belt-progression'
import type { Achievement } from '@/lib/db/schema'

export interface BeltProgressStats {
  currentBelt: BeltRank
  currentStripes: number
  timeAtCurrentBelt: string // e.g., "8 months"
  sessionsSincePromotion: number
  sessionsUntilNextStripe: number
  estimatedPromotionDate: Date | null
}

/**
 * Calculate comprehensive belt progress statistics
 */
export function calculateBeltProgress(
  profile: { belt: string; stripes: number; currentBeltDate: string | null },
  journalEntries: JournalEntry[],
  achievements: Achievement[] = []
): BeltProgressStats {
  const currentBelt = profile.belt as BeltRank
  const currentStripes = profile.stripes || 0

  // Determine promotion date from achievements or profile
  let promotionDate: Date | null = profile.currentBeltDate ? new Date(profile.currentBeltDate) : null

  // Try to find the specific promotion achievement for the current belt
  // This is often more accurate than the profile date if manually updated
  const beltAchievement = achievements.find(a => {
    const info = parseBeltInfo(a.title, 'belt')
    return a.type === 'belt' && info.belt === currentBelt
  })

  // If we found a matching belt achievement, use its date
  if (beltAchievement) {
    promotionDate = new Date(beltAchievement.achievedDate)
  }
  const sessionsSincePromotion = promotionDate
    ? journalEntries.filter(e => new Date(e.entryDate) >= promotionDate).length
    : journalEntries.length

  // Calculate time at current belt
  const timeAtCurrentBelt = promotionDate
    ? getTimeDifference(promotionDate, new Date())
    : 'Unknown'

  // Calculate sessions until next stripe
  const sessionsUntilNextStripe = calculateSessionsUntilNextStripe(
    sessionsSincePromotion,
    currentStripes
  )

  // Estimate promotion date based on time requirements
  const nextBelt = getNextBelt(currentBelt)
  const estimatedPromotionDate = nextBelt && promotionDate
    ? calculateEstimatedPromotionDate(promotionDate, currentBelt)
    : null

  return {
    currentBelt,
    currentStripes,
    timeAtCurrentBelt,
    sessionsSincePromotion,
    sessionsUntilNextStripe,
    estimatedPromotionDate,
  }
}

/**
 * Get human-readable time difference between two dates
 */
function getTimeDifference(startDate: Date, endDate: Date): string {
  const months = getMonthsDiff(startDate, endDate)

  if (months < 1) {
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return `${days} day${days !== 1 ? 's' : ''}`
  }

  if (months < 12) {
    return `${months} month${months > 1 ? 's' : ''}`
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) {
    return `${years} year${years > 1 ? 's' : ''}`
  }

  return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
}

/**
 * Get the number of complete months between two dates
 */
function getMonthsDiff(startDate: Date, endDate: Date): number {
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  )
}

/**
 * Calculate estimated promotion date based on time requirements
 */
function calculateEstimatedPromotionDate(promotionDate: Date, currentBelt: BeltRank): Date {
  const requiredMonths = TIME_REQUIREMENTS[currentBelt].minMonths
  return new Date(
    promotionDate.getFullYear(),
    promotionDate.getMonth() + requiredMonths,
    promotionDate.getDate()
  )
}

/**
 * Get percentage progress toward next belt based on time requirement
 */
export function getBeltProgressPercentage(
  currentBelt: BeltRank,
  currentBeltDate: string | null
): number {
  if (!currentBeltDate) return 0

  const startDate = new Date(currentBeltDate)
  const now = new Date()
  const monthsAtBelt = getMonthsDiff(startDate, now)
  const requiredMonths = TIME_REQUIREMENTS[currentBelt].minMonths

  return Math.min(Math.round((monthsAtBelt / requiredMonths) * 100), 100)
}
