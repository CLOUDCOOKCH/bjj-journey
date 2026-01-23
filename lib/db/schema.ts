import { pgTable, uuid, varchar, text, integer, timestamp, date, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================================================
// NextAuth Tables
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: varchar('image', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}))

export const accounts = pgTable('accounts', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 50 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (table) => ({
  providerAccountIdIdx: index('accounts_provider_account_id_idx').on(table.providerAccountId),
}))

export const sessions = pgTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 }).primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => ({
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
}))

export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

// ============================================================================
// Application Tables
// ============================================================================

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  belt: varchar('belt', { length: 50 }).notNull().default('white'),
  stripes: integer('stripes').notNull().default(0),
  currentBeltDate: date('current_belt_date'),
  monthlyGoal: integer('monthly_goal').notNull().default(12),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  entryDate: date('entry_date').notNull(),
  sessionType: varchar('session_type', { length: 20 }).notNull().default('regular'),
  title: text('title'),
  focusAreas: text('focus_areas'),
  intensityLevel: integer('intensity_level'),
  durationMinutes: integer('duration_minutes').default(90),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('journal_entries_user_id_idx').on(table.userId),
  entryDateIdx: index('journal_entries_entry_date_idx').on(table.entryDate),
}))

export const techniques = pgTable('techniques', {
  id: uuid('id').primaryKey().defaultRandom(),
  journalEntryId: uuid('journal_entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  youtubeUrl: text('youtube_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  journalEntryIdIdx: index('techniques_journal_entry_id_idx').on(table.journalEntryId),
}))

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(), // 'belt' or 'stripe'
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  achievedDate: date('achieved_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('achievements_user_id_idx').on(table.userId),
  achievedDateIdx: index('achievements_achieved_date_idx').on(table.achievedDate),
}))

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  profiles: many(profiles),
  journalEntries: many(journalEntries),
  achievements: many(achievements),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
}))

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
  techniques: many(techniques),
}))

export const techniquesRelations = relations(techniques, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [techniques.journalEntryId],
    references: [journalEntries.id],
  }),
}))

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}))

// ============================================================================
// Type Exports
// ============================================================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type JournalEntry = typeof journalEntries.$inferSelect
export type NewJournalEntry = typeof journalEntries.$inferInsert
export type Technique = typeof techniques.$inferSelect
export type NewTechnique = typeof techniques.$inferInsert
export type Achievement = typeof achievements.$inferSelect
export type NewAchievement = typeof achievements.$inferInsert
