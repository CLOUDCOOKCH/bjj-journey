import { pgTable, uuid, varchar, text, integer, timestamp, date, index, boolean, jsonb, unique, uniqueIndex, foreignKey, check } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import type { TrainingDetails } from '@/lib/validations/journal-details'

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
  sessionRpe: integer('session_rpe'),
  trainingDetails: jsonb('training_details').$type<TrainingDetails>(),
  durationMinutes: integer('duration_minutes').default(90),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('journal_entries_user_id_idx').on(table.userId),
  entryDateIdx: index('journal_entries_entry_date_idx').on(table.entryDate),
  sessionRpeCheck: check('journal_entries_session_rpe_check', sql`${table.sessionRpe} between 0 and 10`),
  ownerKey: unique('journal_entries_id_owner_key').on(table.id, table.userId),
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

export const reviewTechniques = pgTable('review_techniques', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }), // 'guard', 'submissions', 'sweeps', 'takedowns', 'transitions', 'escapes'
  beltLevel: varchar('belt_level', { length: 20 }), // 'white', 'blue', 'purple', 'brown', 'black'
  difficulty: varchar('difficulty', { length: 20 }), // 'beginner', 'intermediate', 'advanced', 'expert'
  trainingType: varchar('training_type', { length: 20 }), // 'gi', 'no-gi', 'both'
  notes: text('notes'), // Markdown content
  viewCount: integer('view_count').notNull().default(0),
  lastReviewed: timestamp('last_reviewed'),
  isFavorite: boolean('is_favorite').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('review_techniques_user_id_idx').on(table.userId),
  categoryIdx: index('review_techniques_category_idx').on(table.category),
  reviewTechniqueOwnerKey: unique('review_techniques_owner_key').on(table.id, table.userId),
  beltLevelIdx: index('review_techniques_belt_level_idx').on(table.beltLevel),
}))

export const journalTechniqueLinks = pgTable('journal_technique_links', {
  ownerId: uuid('owner_id').notNull(),
  journalEntryId: uuid('journal_entry_id').notNull(),
  reviewTechniqueId: uuid('review_technique_id').notNull(),
}, table => [
  unique('journal_technique_links_unique').on(table.journalEntryId, table.reviewTechniqueId),
  index('journal_technique_links_review_idx').on(table.reviewTechniqueId),
  foreignKey({
    name: 'journal_technique_links_journal_owner_fk',
    columns: [table.journalEntryId, table.ownerId],
    foreignColumns: [journalEntries.id, journalEntries.userId],
  }).onDelete('cascade'),
  foreignKey({
    name: 'journal_technique_links_review_owner_fk',
    columns: [table.reviewTechniqueId, table.ownerId],
    foreignColumns: [reviewTechniques.id, reviewTechniques.userId],
  }).onDelete('cascade'),
])

export const reviewTechniqueVideos = pgTable('review_technique_videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewTechniqueId: uuid('review_technique_id').notNull().references(() => reviewTechniques.id, { onDelete: 'cascade' }),
  youtubeUrl: text('youtube_url').notNull(),
  title: varchar('title', { length: 200 }),
  thumbnailUrl: text('thumbnail_url'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  reviewTechniqueIdIdx: index('review_technique_videos_technique_id_idx').on(table.reviewTechniqueId),
}))

export const trainingRecords = pgTable('training_records', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  collection: varchar('collection', { length: 40 }).notNull(),
  data: jsonb('data').$type<Record<string, unknown>>().notNull(),
  version: integer('version').notNull().default(1),
  parentId: uuid('parent_id'),
  templateId: uuid('template_id'),
  recordKey: varchar('record_key', { length: 200 }),
  state: varchar('state', { length: 20 }),
  activityDate: date('activity_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique('training_records_owner_key').on(table.id, table.userId),
  uniqueIndex('training_records_collection_key').on(table.userId, table.collection, table.recordKey)
    .where(sql`${table.recordKey} IS NOT NULL`),
  index('training_records_list_idx').on(table.userId, table.collection, table.createdAt, table.id),
  index('training_records_activity_date_idx').on(table.userId, table.collection, table.activityDate, table.state),
  index('training_records_parent_idx').on(table.parentId),
  index('training_records_template_idx').on(table.templateId),
  uniqueIndex('training_records_activity_workout_key').on(table.parentId)
    .where(sql`${table.collection} = 'workouts' AND ${table.parentId} IS NOT NULL`),
  check('training_records_collection_check', sql`${table.collection} in ('workouts','activities','templates','exercises','exercise_favourites','preferences','recovery','discomfort','benchmarks','benchmark-results','goals','competitions','reflections','programmes')`),
  check('training_records_version_check', sql`${table.version} > 0`),
  check('training_records_data_check', sql`jsonb_typeof(${table.data}) = 'object'`),
  foreignKey({
    name: 'training_records_parent_owner_fk', columns: [table.parentId, table.userId], foreignColumns: [table.id, table.userId],
  }),
  foreignKey({
    name: 'training_records_template_owner_fk', columns: [table.templateId, table.userId], foreignColumns: [table.id, table.userId],
  }),
])

export const trainingJournalLinks = pgTable('training_journal_links', {
  activityId: uuid('activity_id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  journalEntryId: uuid('journal_entry_id').notNull().unique(),
}, (table) => [
  foreignKey({
    name: 'training_journal_links_activity_owner_fk',
    columns: [table.activityId, table.userId],
    foreignColumns: [trainingRecords.id, trainingRecords.userId],
  }).onDelete('cascade'),
  foreignKey({
    name: 'training_journal_links_journal_owner_fk',
    columns: [table.journalEntryId, table.userId],
    foreignColumns: [journalEntries.id, journalEntries.userId],
  }).onDelete('cascade'),
])

export const trainingExerciseCatalog = pgTable('training_exercise_catalog', {
  slug: varchar('slug', { length: 160 }).primaryKey(),
  category: varchar('category', { length: 20 }).notNull(),
  data: jsonb('data').$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('training_exercise_catalog_category_idx').on(table.category),
  check('training_exercise_catalog_category_check', sql`${table.category} IN ('mobility','strength','conditioning','solo','recovery')`),
  check('training_exercise_catalog_data_check', sql`jsonb_typeof(${table.data}) = 'object'`),
])

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  profiles: many(profiles),
  journalEntries: many(journalEntries),
  achievements: many(achievements),
  reviewTechniques: many(reviewTechniques),
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

export const reviewTechniquesRelations = relations(reviewTechniques, ({ one, many }) => ({
  user: one(users, {
    fields: [reviewTechniques.userId],
    references: [users.id],
  }),
  videos: many(reviewTechniqueVideos),
}))

export const reviewTechniqueVideosRelations = relations(reviewTechniqueVideos, ({ one }) => ({
  reviewTechnique: one(reviewTechniques, {
    fields: [reviewTechniqueVideos.reviewTechniqueId],
    references: [reviewTechniques.id],
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
export type ReviewTechnique = typeof reviewTechniques.$inferSelect
export type NewReviewTechnique = typeof reviewTechniques.$inferInsert
export type ReviewTechniqueVideo = typeof reviewTechniqueVideos.$inferSelect
export type NewReviewTechniqueVideo = typeof reviewTechniqueVideos.$inferInsert
