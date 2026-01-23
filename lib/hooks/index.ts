/**
 * TanStack Query hooks for API interactions
 *
 * This module exports all custom hooks for data fetching and mutations.
 * Each hook is typed and integrates with TanStack Query for caching,
 * loading states, and error handling.
 */

// Profile hooks
export {
  useProfile,
  useUpdateProfile,
  profileKeys,
} from './use-profiles'

// Journal entry hooks
export {
  useJournalEntries,
  useJournalEntry,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  journalEntryKeys,
  type JournalEntryWithTechniques,
} from './use-journal-entries'

// Technique hooks
export {
  useCreateTechnique,
  useUpdateTechnique,
  techniqueKeys,
} from './use-techniques'

// Achievement hooks
export {
  useAchievements,
  useAchievement,
  useCreateAchievement,
  useDeleteAchievement,
  achievementKeys,
} from './use-achievements'
