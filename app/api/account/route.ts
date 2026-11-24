import bcrypt from 'bcrypt'
import { eq, sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

const bodySchema = z.object({ password: z.string().min(1).max(1024) }).strict()
const privateHeaders = { 'Cache-Control': 'private, no-store' }
const sessionCookie = /^(?:__Secure-)?next-auth\.session-token(?:\.\d+)?$/

function failure(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: privateHeaders })
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return failure('Unauthorized', 401)

    const body = bodySchema.safeParse(await request.json().catch(() => null))
    if (!body.success) return failure('Enter your password to confirm account deletion', 400)

    const [account] = await db.select({ password: users.password }).from(users).where(eq(users.id, user.id))
    if (!account || !await bcrypt.compare(body.data.password, account.password)) {
      return failure('Password confirmation failed', 403)
    }

    const { rows } = await db.execute<{ deleted: boolean }>(sql`
      WITH deleted_account AS (
        DELETE FROM users WHERE id = ${user.id}::uuid AND password = ${account.password} RETURNING email
      ), deleted_tokens AS (
        DELETE FROM verification_tokens WHERE identifier IN (SELECT email FROM deleted_account)
      )
      SELECT EXISTS (SELECT 1 FROM deleted_account) AS deleted
    `)
    if (!rows[0]?.deleted) return failure('Account changed. Sign in and try again', 409)

    const response = new NextResponse(null, { status: 204, headers: privateHeaders })
    for (const cookie of request.cookies.getAll()) {
      if (sessionCookie.test(cookie.name)) {
        response.cookies.set(cookie.name, '', {
          path: '/', expires: new Date(0), httpOnly: true, sameSite: 'lax',
          secure: cookie.name.startsWith('__Secure-'),
        })
      }
    }
    return response
  } catch {
    console.error('Account deletion failed')
    return failure('Account deletion failed', 500)
  }
}
