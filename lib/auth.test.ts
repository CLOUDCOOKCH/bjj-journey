/** @jest-environment node */

import bcrypt from 'bcrypt'
import type { CredentialsConfig } from 'next-auth/providers/credentials'
import { authOptions } from './auth'
import { db } from './db'

jest.mock('server-only', () => ({}), { virtual: true })
jest.mock('./db', () => ({ db: { query: { users: { findFirst: jest.fn() } } } }))

const provider = authOptions.providers[0] as CredentialsConfig & {
  options: Pick<CredentialsConfig, 'authorize'>
}
const request = { body: {}, query: {}, headers: {}, method: 'POST' }
const athlete = { id: '5be184cd-6878-4604-b585-df8333f6bdd0', email: 'athlete@example.com', name: 'Athlete' }
const findUser = jest.mocked(db.query.users.findFirst)

beforeEach(() => findUser.mockReset())

test('verifies stored credentials before attaching the user ID to a session', async () => {
  const password = 'correct-training-password'
  findUser.mockResolvedValue({
    ...athlete, password: bcrypt.hashSync(password, 4), emailVerified: null, image: null,
    createdAt: null, updatedAt: null,
  })

  await expect(provider.options.authorize({ email: athlete.email, password: 'incorrect-password' }, request)).resolves.toBeNull()
  const user = await provider.options.authorize({ email: athlete.email, password }, request)
  expect(user).toEqual(athlete)

  // These callbacks transfer the persisted identity through the JWT session.
  const configuredJwt = authOptions.callbacks?.jwt
  const configuredSession = authOptions.callbacks?.session
  if (!configuredJwt || !configuredSession || !user) throw new Error('Expected JWT authentication and a valid athlete')
  const token = await configuredJwt({ token: { id: '' }, user, account: null })
  const response = await configuredSession({
    session: { user: { id: '' }, expires: '2030-01-01T00:00:00.000Z' }, token,
    user: { ...athlete, emailVerified: null }, newSession: undefined, trigger: 'update',
  })
  expect(response.user).toHaveProperty('id', athlete.id)
})

test('rejects malformed credentials before the database lookup', async () => {
  await expect(provider.options.authorize({ email: 'invalid', password: '123' }, request)).resolves.toBeNull()
  expect(findUser).not.toHaveBeenCalled()
})
