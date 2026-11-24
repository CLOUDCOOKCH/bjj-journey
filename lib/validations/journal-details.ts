import { z } from 'zod'

const notes = z.string().trim().max(2000).optional()
const count = z.number().int().min(0).max(500).optional()

export const trainingDetailsSchema = z.object({
  sparringRounds: count,
  sparringMinutes: z.number().int().min(0).max(480).optional(),
  roundMinutes: z.number().int().min(0).max(120).optional(),
  positionalSparring: notes,
  successfulTechniques: notes,
  techniquesToImprove: notes,
  submissionsPerformed: count,
  submissionsReceived: count,
  positionsTrained: notes,
  observations: notes,
  trainingFocus: notes,
  postSessionFatigue: z.number().int().min(0).max(10).optional(),
}).strict()

export const journalDetailsSchema = z.object({
  sessionRpe: z.number().int().min(0).max(10).nullable(),
  details: trainingDetailsSchema,
  techniqueIds: z.array(z.string().uuid()).max(50).transform(ids => [...new Set(ids)]),
}).strict()

export type TrainingDetails = z.infer<typeof trainingDetailsSchema>
export type JournalDetails = z.infer<typeof journalDetailsSchema>
