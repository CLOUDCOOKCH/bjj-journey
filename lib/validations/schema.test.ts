import {
  achievementSchema, authSchema, journalEntrySchema, journalEntryUpdateSchema, profileUpdateSchema,
  reviewTechniqueSchema, reviewTechniqueUpdateSchema, signUpSchema, techniqueSchema,
} from './schema'
import { cn } from '@/lib/utils'

test('checks credentials and confirms new account passwords', () => {
  const credentials = { email: 'athlete@example.com', password: 'training-pass' }
  expect(authSchema.parse(credentials)).toEqual(credentials)
  expect(authSchema.safeParse({ email: 'athlete', password: '123' }).success).toBe(false)
  expect(signUpSchema.safeParse({ ...credentials, name: 'Athlete', confirmPassword: credentials.password }).success).toBe(true)
  expect(signUpSchema.safeParse({ ...credentials, name: 'Athlete', confirmPassword: 'another-password' }).success).toBe(false)
})

test('retains journal defaults and rejects invalid dates and out-of-range updates', () => {
  expect(journalEntrySchema.parse({ entryDate: '2024-02-29' })).toMatchObject({ durationMinutes: 90, sessionType: 'regular' })
  for (const entryDate of ['2025-02-29', '2026-14-01', '2026-06-31']) {
    expect(journalEntrySchema.safeParse({ entryDate }).success).toBe(false)
  }
  expect(journalEntryUpdateSchema.safeParse({ durationMinutes: 0, intensityLevel: 6 }).success).toBe(false)
  expect(journalEntryUpdateSchema.parse({ notes: null })).toEqual({ notes: null })
})

test('validates belt progression and promotion dates', () => {
  expect(profileUpdateSchema.parse({ belt: 'blue', stripes: 2 })).toEqual({ belt: 'blue', stripes: 2 })
  expect(profileUpdateSchema.safeParse({ belt: 'yellow', stripes: 5 }).success).toBe(false)
  expect(achievementSchema.safeParse({ type: 'badge', title: 'Promotion', achievedDate: '2024-06-10' }).success).toBe(false)
  const promotion = { type: 'belt', title: 'Blue Belt Promotion' }
  expect(achievementSchema.safeParse({ ...promotion, achievedDate: '2024-02-29' }).success).toBe(true)
  for (const achievedDate of ['2025-02-29', '2026-14-01', '2026-06-31']) {
    expect(achievementSchema.safeParse({ ...promotion, achievedDate }).success).toBe(false)
  }
})

test('supports technique metadata and rejects invalid references', () => {
  expect(techniqueSchema.safeParse({ name: 'Armbar', journalEntryId: 'not-an-id' }).success).toBe(false)
  expect(reviewTechniqueSchema.safeParse({ name: 'Armbar', category: 'submissions' }).success).toBe(true)
  expect(reviewTechniqueSchema.safeParse({ name: 'Armbar', videos: [{ youtubeUrl: 'no-url' }] }).success).toBe(false)
  expect(reviewTechniqueUpdateSchema.parse({ isFavorite: false })).toEqual({ isFavorite: false })
})

test('merges conditional Tailwind classes using the most recent conflicting class', () => {
  expect(cn('p-2 text-sm', { hidden: false, 'font-semibold': true }, 'p-4')).toBe('text-sm font-semibold p-4')
})
