import type { Achievement } from '@/lib/db/schema'
import { calculateBeltProgress } from './progress-calculations'

test('counts only mat sessions from the current belt promotion and includes the promotion day', () => {
  const profile = { belt: 'blue', stripes: 1, currentBeltDate: '2025-02-01' }
  const promotion: Achievement = {
    id: 'promotion', userId: 'athlete', type: 'belt', title: 'Blue Belt Promotion',
    description: null, achievedDate: '2025-01-20', createdAt: null,
  }
  const progress = calculateBeltProgress(profile, [
    { entryDate: '2025-01-19' },
    { entryDate: '2025-01-20' },
    { entryDate: '2025-01-27' },
  ], [promotion])

  expect(progress).toMatchObject({
    currentBelt: 'blue', currentStripes: 1, sessionsSincePromotion: 2, sessionsUntilNextStripe: 33,
  })
})

test('keeps historical totals and leaves promotion unknown when a legacy profile has no belt date', () => {
  const progress = calculateBeltProgress({ belt: 'black', stripes: 4, currentBeltDate: null }, [
    { entryDate: '2025-01-20' },
  ])

  expect(progress).toMatchObject({
    sessionsSincePromotion: 1, timeAtCurrentBelt: 'Unknown',
    sessionsUntilNextStripe: 0, estimatedPromotionDate: null,
  })
})
