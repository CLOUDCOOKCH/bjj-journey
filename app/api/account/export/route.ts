import { sql } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/api/auth'
import { db } from '@/lib/db'

const privateHeaders = { 'Cache-Control': 'private, no-store' }

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders })

    const { rows } = await db.execute<{ contents: unknown }>(sql`
      SELECT jsonb_build_object(
        'formatVersion', 1,
        'exportedAt', now(),
        'account', jsonb_build_object('id', u.id, 'email', u.email, 'name', u.name, 'image', u.image,
          'emailVerified', u."emailVerified", 'createdAt', u.created_at, 'updatedAt', u.updated_at),
        'profile', (SELECT to_jsonb(p) FROM profiles p WHERE p.id = u.id),
        'journalEntries', (SELECT coalesce(jsonb_agg(to_jsonb(j) ORDER BY j.entry_date, j.id), '[]'::jsonb)
          FROM journal_entries j WHERE j.user_id = u.id),
        'journalTechniques', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.id), '[]'::jsonb) FROM techniques t
          JOIN journal_entries j ON j.id = t.journal_entry_id WHERE j.user_id = u.id),
        'journalTechniqueLinks', (SELECT coalesce(jsonb_agg(to_jsonb(link) ORDER BY link.journal_entry_id, link.review_technique_id), '[]'::jsonb)
          FROM journal_technique_links link WHERE link.owner_id = u.id),
        'trainingJournalLinks', (SELECT coalesce(jsonb_agg(to_jsonb(link) ORDER BY link.activity_id), '[]'::jsonb)
          FROM training_journal_links link WHERE link.user_id = u.id),
        'techniqueLibrary', (SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.id), '[]'::jsonb) FROM review_techniques t WHERE t.user_id = u.id),
        'techniqueLibraryVideos', (SELECT coalesce(jsonb_agg(to_jsonb(v) ORDER BY v.id), '[]'::jsonb) FROM review_technique_videos v
          JOIN review_techniques t ON t.id = v.review_technique_id WHERE t.user_id = u.id),
        'beltAchievements', (SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.achieved_date, a.id), '[]'::jsonb)
          FROM achievements a WHERE a.user_id = u.id),
        'training', (SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.collection, r.created_at, r.id), '[]'::jsonb)
          FROM training_records r WHERE r.user_id = u.id)
      ) AS contents
      FROM users u WHERE u.id = ${user.id}::uuid
    `)
    if (!rows[0]) return Response.json({ error: 'Account unavailable' }, { status: 404, headers: privateHeaders })
    return Response.json(rows[0].contents, {
      headers: { ...privateHeaders, 'Content-Disposition': 'attachment; filename="bjj-journey-export.json"' },
    })
  } catch {
    console.error('Account export failed')
    return Response.json({ error: 'Account export failed' }, { status: 500, headers: privateHeaders })
  }
}
