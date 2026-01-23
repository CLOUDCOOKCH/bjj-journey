/**
 * Test suite for lib/utils.ts
 * 
 * Tests cover:
 * - Class merging with cn() utility
 * - Conflict resolution for Tailwind classes
 * - Handling of various input types (strings, arrays, objects)
 * - Edge cases with empty/undefined inputs
 */

import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  describe('basic class merging', () => {
    it('merges simple class strings', () => {
      expect(cn('p-4', 'm-2')).toBe('p-4 m-2')
    })

    it('merges multiple class strings', () => {
      expect(cn('p-4', 'm-2', 'bg-red-500', 'text-white')).toBe('p-4 m-2 bg-red-500 text-white')
    })

    it('with no arguments returns empty string', () => {
      expect(cn()).toBe('')
    })

    it('handles empty string arguments', () => {
      expect(cn('p-4', '', 'm-2')).toBe('p-4 m-2')
    })
  })

  describe('conditional classes with objects', () => {
    it('includes class when condition is true', () => {
      expect(cn('p-4', { 'bg-red-500': true })).toBe('p-4 bg-red-500')
    })

    it('excludes class when condition is false', () => {
      expect(cn('p-4', { 'bg-red-500': false })).toBe('p-4')
    })

    it('handles multiple conditional classes in one object', () => {
      expect(cn('p-4', {
        'bg-red-500': true,
        'text-white': false,
        'rounded': true
      })).toBe('p-4 bg-red-500 rounded')
    })
  })

  describe('conditional classes with arrays', () => {
    it('includes class when condition is true in array', () => {
      expect(cn('p-4', [true && 'bg-red-500'])).toBe('p-4 bg-red-500')
    })

    it('excludes class when condition is false in array', () => {
      expect(cn('p-4', [false && 'bg-red-500'])).toBe('p-4')
    })

    it('handles multiple conditional classes in array', () => {
      expect(cn('p-4', [
        true && 'bg-red-500',
        false && 'text-white',
        true && 'rounded'
      ])).toBe('p-4 bg-red-500 rounded')
    })
  })

  describe('Tailwind conflict resolution', () => {
    it('resolves padding conflicts (later class wins)', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4')
    })

    it('resolves margin conflicts (later class wins)', () => {
      expect(cn('m-2', 'm-4', 'm-8')).toBe('m-8')
    })

    it('resolves color conflicts (later class wins)', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })

    it('preserves order priority', () => {
      expect(cn('p-2', 'm-4', 'p-4', 'bg-red-500', 'bg-blue-500')).toBe('m-4 p-4 bg-blue-500')
    })
  })

  describe('mixed input types', () => {
    it('handles strings, arrays, and objects together', () => {
      expect(cn(
        'p-4',
        ['m-2', true && 'bg-red-500'],
        { 'text-white': true, 'rounded': false }
      )).toBe('p-4 m-2 bg-red-500 text-white')
    })

    it('handles undefined in mixed inputs', () => {
      expect(cn('p-4', undefined, ['m-2', undefined])).toBe('p-4 m-2')
    })

    it('handles null in mixed inputs', () => {
      expect(cn('p-4', null, { 'm-2': null as any })).toBe('p-4')
    })
  })

  describe('edge cases', () => {
    it('handles only conditional classes without base classes', () => {
      expect(cn({ 'p-4': true, 'm-2': false })).toBe('p-4')
    })

    it('handles only array inputs', () => {
      expect(cn(['p-4', 'm-2'])).toBe('p-4 m-2')
    })

    it('handles duplicate classes (should deduplicate)', () => {
      expect(cn('p-4', 'm-2', 'p-4')).toBe('m-2 p-4')
    })

    it('handles complex nested conditions', () => {
      const isActive = true
      const isDisabled = false
      expect(cn('btn', {
        'btn-active': isActive,
        'btn-disabled': isDisabled,
        'btn-primary': isActive && !isDisabled
      })).toBe('btn btn-active btn-primary')
    })
  })
})
