import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { signUpSchema } from '@/lib/validations/schema'
import { handleApiError, ApiError } from '@/lib/api/errors'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = signUpSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })

    if (existingUser) {
      throw new ApiError(400, 'User already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
    }).returning()

    // Create profile
    await db.insert(profiles).values({
      id: newUser[0].id,
      belt: 'white',
      monthlyGoal: 12,
    })

    return NextResponse.json(
      { message: 'User created successfully', userId: newUser[0].id },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
