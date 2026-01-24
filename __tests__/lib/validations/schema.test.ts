/**
 * Test suite for lib/validations/schema.ts
 * 
 * Tests cover:
 * - Authentication schemas (authSchema, signUpSchema)
 * - Profile update schema
 * - Journal entry schema
 * - Technique schema
 * - Achievement schema
 * - Edge cases and boundary values
 */

import {
  authSchema,
  signUpSchema,
  profileUpdateSchema,
  journalEntrySchema,
  techniqueSchema,
  achievementSchema
} from '@/lib/validations/schema'

describe('Authentication Schemas', () => {
  describe('authSchema', () => {
    it('valid email and 6+ char password passes', () => {
      const result = authSchema.safeParse({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.success).toBe(true)
    })

    it('invalid email format fails', () => {
      const result = authSchema.safeParse({
        email: 'not-an-email',
        password: 'password123'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address')
      }
    })

    it('password less than 6 characters fails', () => {
      const result = authSchema.safeParse({
        email: 'test@example.com',
        password: '12345'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters')
      }
    })

    it('email with multiple @ signs fails', () => {
      const result = authSchema.safeParse({
        email: 'test@@example.com',
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })

    it('email without domain fails', () => {
      const result = authSchema.safeParse({
        email: 'test@',
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('signUpSchema', () => {
    it('valid signup data passes', () => {
      const result = signUpSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
      expect(result.success).toBe(true)
    })

    it('passwords do not match fails', () => {
      const result = signUpSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password456'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match")
        expect(result.error.issues[0].path).toEqual(['confirmPassword'])
      }
    })

    it('inherits authSchema validations', () => {
      const result = signUpSchema.safeParse({
        email: 'invalid-email',
        password: 'short',
        confirmPassword: 'short'
      })
      expect(result.success).toBe(false)
    })

    it('confirmPassword is required', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Profile Schemas', () => {
  describe('profileUpdateSchema', () => {
    it('valid belt and monthlyGoal passes', () => {
      const result = profileUpdateSchema.safeParse({
        belt: 'blue',
        monthlyGoal: 12
      })
      expect(result.success).toBe(true)
    })

    it('valid belt colors (white, blue, purple, brown, black) pass', () => {
      const validBelts = ['white', 'blue', 'purple', 'brown', 'black'] as const
      validBelts.forEach(belt => {
        const result = profileUpdateSchema.safeParse({
          belt,
          monthlyGoal: 12
        })
        expect(result.success).toBe(true)
      })
    })

    it('invalid belt enum value fails', () => {
      const result = profileUpdateSchema.safeParse({
        belt: 'red' as any,
        monthlyGoal: 12
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid belt rank')
      }
    })

    it('monthlyGoal less than 1 fails', () => {
      const result = profileUpdateSchema.safeParse({
        belt: 'white',
        monthlyGoal: 0
      })
      expect(result.success).toBe(false)
    })

    it('monthlyGoal greater than 31 fails', () => {
      const result = profileUpdateSchema.safeParse({
        belt: 'white',
        monthlyGoal: 32
      })
      expect(result.success).toBe(false)
    })

    it('monthlyGoal is optional', () => {
      const result = profileUpdateSchema.safeParse({
        belt: 'white'
      })
      expect(result.success).toBe(true)
    })

    it('boundary values: monthlyGoal = 1 and 31 pass', () => {
      const result1 = profileUpdateSchema.safeParse({ belt: 'white', monthlyGoal: 1 })
      const result2 = profileUpdateSchema.safeParse({ belt: 'white', monthlyGoal: 31 })
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })
  })
})

describe('Journal Entry Schemas', () => {
  describe('journalEntrySchema', () => {
    it('valid YYYY-MM-DD format and valid calendar date passes', () => {
      const result = journalEntrySchema.safeParse({
        entryDate: '2024-01-15',
        notes: 'Great training session'
      })
      expect(result.success).toBe(true)
    })

    it('valid date without notes passes', () => {
      const result = journalEntrySchema.safeParse({
        entryDate: '2024-01-15'
      })
      expect(result.success).toBe(true)
    })

    it('null notes is accepted', () => {
      const result = journalEntrySchema.safeParse({
        entryDate: '2024-01-15',
        notes: null
      })
      expect(result.success).toBe(true)
    })

    it('invalid date format fails', () => {
      const result = journalEntrySchema.safeParse({
        entryDate: '01/15/2024',
        notes: 'test'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Date must be in YYYY-MM-DD format')
      }
    })

    it('invalid calendar date (February 30) fails', () => {
      const result = journalEntrySchema.safeParse({
        entryDate: '2024-02-30',
        notes: 'test'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid date (e.g., February 30 is not valid)')
      }
    })

    it('invalid calendar date (month 13) fails', () => {
      const result = journalEntrySchema.safeParse({
        entryDate: '2024-13-01',
        notes: 'test'
      })
      expect(result.success).toBe(false)
    })

    it('invalid calendar date (day 32) fails', () => {
      const result = journalEntrySchema.safeParse({
        entryDate: '2024-01-32',
        notes: 'test'
      })
      expect(result.success).toBe(false)
    })

    it('leap year date (February 29) is valid', () => {
      const result = journalEntrySchema.safeParse({
        entryDate: '2024-02-29',
        notes: 'test'
      })
      expect(result.success).toBe(true)
    })

    it('non-leap year (February 29) is invalid', () => {
      const result = journalEntrySchema.safeParse({
        entryDate: '2023-02-29',
        notes: 'test'
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Technique Schemas', () => {
  describe('techniqueSchema', () => {
    it('valid UUID, name, and YouTube URL passes', () => {
      const result = techniqueSchema.safeParse({
        journalEntryId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Triangle Choke',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        notes: 'Great technique'
      })
      expect(result.success).toBe(true)
    })

    it('valid UUID without optional fields passes', () => {
      const result = techniqueSchema.safeParse({
        journalEntryId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Armbar'
      })
      expect(result.success).toBe(true)
    })

    it('invalid UUID format fails', () => {
      const result = techniqueSchema.safeParse({
        journalEntryId: 'not-a-uuid',
        name: 'Armbar'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid journal entry ID')
      }
    })

    it('empty name fails', () => {
      const result = techniqueSchema.safeParse({
        journalEntryId: '123e4567-e89b-12d3-a456-426614174000',
        name: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Technique name is required')
      }
    })

    it('name with 1 character passes', () => {
      const result = techniqueSchema.safeParse({
        journalEntryId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'A'
      })
      expect(result.success).toBe(true)
    })

    it('name with 200 characters passes', () => {
      const result = techniqueSchema.safeParse({
        journalEntryId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'A'.repeat(200)
      })
      expect(result.success).toBe(true)
    })

    it('name with 201 characters fails', () => {
      const result = techniqueSchema.safeParse({
        journalEntryId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'A'.repeat(201)
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Technique name too long')
      }
    })

    it('invalid YouTube URL format fails', () => {
      const result = techniqueSchema.safeParse({
        journalEntryId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Armbar',
        youtubeUrl: 'not-a-url'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid YouTube URL')
      }
    })

    it('null youtubeUrl is accepted', () => {
      const result = techniqueSchema.safeParse({
        journalEntryId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Armbar',
        youtubeUrl: null
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('Achievement Schemas', () => {
  describe('achievementSchema', () => {
    it('valid belt type achievement passes', () => {
      const result = achievementSchema.safeParse({
        type: 'belt',
        title: 'Blue Belt',
        description: 'Promoted to blue belt',
        achievedDate: '2024-01-15'
      })
      expect(result.success).toBe(true)
    })

    it('valid stripe type achievement passes', () => {
      const result = achievementSchema.safeParse({
        type: 'stripe',
        title: 'Second Stripe',
        description: 'Earned second stripe',
        achievedDate: '2024-02-20'
      })
      expect(result.success).toBe(true)
    })

    it('valid achievement without optional fields passes', () => {
      const result = achievementSchema.safeParse({
        type: 'belt',
        title: 'Blue Belt',
        achievedDate: '2024-01-15'
      })
      expect(result.success).toBe(true)
    })

    it('invalid type enum value fails', () => {
      const result = achievementSchema.safeParse({
        type: 'medal' as any,
        title: 'Gold Medal',
        achievedDate: '2024-01-15'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Type must be either belt or stripe')
      }
    })

    it('empty title fails', () => {
      const result = achievementSchema.safeParse({
        type: 'belt',
        title: '',
        achievedDate: '2024-01-15'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required')
      }
    })

    it('title with 1 character passes', () => {
      const result = achievementSchema.safeParse({
        type: 'belt',
        title: 'A',
        achievedDate: '2024-01-15'
      })
      expect(result.success).toBe(true)
    })

    it('title with 100 characters passes', () => {
      const result = achievementSchema.safeParse({
        type: 'belt',
        title: 'A'.repeat(100),
        achievedDate: '2024-01-15'
      })
      expect(result.success).toBe(true)
    })

    it('title with 101 characters fails', () => {
      const result = achievementSchema.safeParse({
        type: 'belt',
        title: 'A'.repeat(101),
        achievedDate: '2024-01-15'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title too long')
      }
    })

    it('invalid date format fails', () => {
      const result = achievementSchema.safeParse({
        type: 'belt',
        title: 'Blue Belt',
        achievedDate: '01/15/2024'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Date must be in YYYY-MM-DD format')
      }
    })

    it('invalid calendar date fails', () => {
      const result = achievementSchema.safeParse({
        type: 'belt',
        title: 'Blue Belt',
        achievedDate: '2024-02-30'
      })
      expect(result.success).toBe(false)
    })

    it('null description is accepted', () => {
      const result = achievementSchema.safeParse({
        type: 'belt',
        title: 'Blue Belt',
        description: null,
        achievedDate: '2024-01-15'
      })
      expect(result.success).toBe(true)
    })
  })
})
