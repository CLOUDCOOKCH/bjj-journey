import { z } from 'zod'

// ============================================================================
// Authentication Schemas
// ============================================================================

export const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signUpSchema = authSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ============================================================================
// Profile Schemas
// ============================================================================

export const profileUpdateSchema = z.object({
  belt: z.enum(['white', 'blue', 'purple', 'brown', 'black'], {
    errorMap: () => ({ message: 'Invalid belt rank' }),
  }).optional(),
  stripes: z.number().int().min(0).max(4).optional(),
  currentBeltDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .nullable()
    .optional(),
  monthlyGoal: z.number().int().min(1).max(31).optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

// ============================================================================
// Journal Entry Schemas
// ============================================================================

export const journalEntrySchema = z.object({
  entryDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((val) => {
      const [year, month, day] = val.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    }, {
      message: 'Invalid date (e.g., February 30 is not valid)',
    }),
  sessionType: z.enum(['gi', 'no_gi', 'drilling', 'open_mat', 'regular', 'competition']).default('regular'),
  title: z.string().max(200, 'Title too long').optional(),
  focusAreas: z.string().max(500, 'Focus areas too long').optional(),
  intensityLevel: z.number().int().min(1).max(5).optional(),
  sessionRpe: z.number().int().min(0).max(10).nullable().optional(),
  durationMinutes: z.number().int().min(15).max(480).default(90),
  notes: z.string().nullable().optional(),
})

export const journalEntryUpdateSchema = z.object({
  sessionType: z.enum(['gi', 'no_gi', 'drilling', 'open_mat', 'regular', 'competition']).optional(),
  title: z.string().max(200).optional(),
  focusAreas: z.string().max(500).optional(),
  intensityLevel: z.number().int().min(1).max(5).optional(),
  sessionRpe: z.number().int().min(0).max(10).nullable().optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  notes: z.string().nullable().optional(),
})

// ============================================================================
// Technique Schemas
// ============================================================================

export const techniqueSchema = z.object({
  journalEntryId: z.string().uuid('Invalid journal entry ID'),
  name: z.string().min(1, 'Technique name is required').max(200, 'Technique name too long'),
  youtubeUrl: z.string().url('Invalid YouTube URL').nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const techniqueUpdateSchema = z.object({
  name: z.string().min(1, 'Technique name is required').max(200, 'Technique name too long'),
  youtubeUrl: z.string().url('Invalid YouTube URL').nullable().optional(),
  notes: z.string().nullable().optional(),
})

// ============================================================================
// Achievement Schemas
// ============================================================================

export const achievementSchema = z.object({
  type: z.enum(['belt', 'stripe'], {
    errorMap: () => ({ message: 'Type must be either belt or stripe' }),
  }),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().nullable().optional(),
  achievedDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((val) => {
      const [year, month, day] = val.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    }, {
      message: 'Invalid date (e.g., February 30 is not valid)',
    }),
})

// ============================================================================
// Review Technique Schemas
// ============================================================================

export const reviewTechniqueSchema = z.object({
  name: z.string().min(1, 'Technique name is required').max(200, 'Technique name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.enum(['guard', 'submissions', 'sweeps', 'takedowns', 'transitions', 'escapes']).optional(),
  beltLevel: z.enum(['white', 'blue', 'purple', 'brown', 'black']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  trainingType: z.enum(['gi', 'no-gi', 'both']).optional(),
  notes: z.string().optional(),
  videos: z.array(z.object({
    youtubeUrl: z.string().url('Invalid YouTube URL'),
    title: z.string().max(200).optional(),
  })).optional(),
})

export const reviewTechniqueUpdateSchema = z.object({
  name: z.string().min(1, 'Technique name is required').max(200, 'Technique name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.enum(['guard', 'submissions', 'sweeps', 'takedowns', 'transitions', 'escapes']).optional(),
  beltLevel: z.enum(['white', 'blue', 'purple', 'brown', 'black']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  trainingType: z.enum(['gi', 'no-gi', 'both']).optional(),
  notes: z.string().optional(),
  isFavorite: z.boolean().optional(),
  videos: z.array(z.object({
    youtubeUrl: z.string().url('Invalid YouTube URL'),
    title: z.string().max(200).optional(),
  })).optional(),
})

export const reviewTechniqueVideoSchema = z.object({
  youtubeUrl: z.string().url('Invalid YouTube URL'),
  title: z.string().max(200).optional(),
})

// ============================================================================
// Type Exports
// ============================================================================

export type AuthInput = z.infer<typeof authSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type JournalEntryInput = z.infer<typeof journalEntrySchema>
export type JournalEntryUpdateInput = z.infer<typeof journalEntryUpdateSchema>
export type TechniqueInput = z.infer<typeof techniqueSchema>
export type TechniqueUpdateInput = z.infer<typeof techniqueUpdateSchema>
export type AchievementInput = z.infer<typeof achievementSchema>
export type ReviewTechniqueInput = z.infer<typeof reviewTechniqueSchema>
export type ReviewTechniqueUpdateInput = z.infer<typeof reviewTechniqueUpdateSchema>
export type ReviewTechniqueVideoInput = z.infer<typeof reviewTechniqueVideoSchema>
