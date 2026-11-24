/** @jest-environment node */

import { NextRequest } from 'next/server'
import { proxy } from './proxy'

const previousUrl = process.env.NEXTAUTH_URL
const lan = 'http://192.0.2.10:3000'
const publicUrl = 'https://bjj.example.com'

afterEach(() => {
  if (previousUrl === undefined) delete process.env.NEXTAUTH_URL
  else process.env.NEXTAUTH_URL = previousUrl
})

function request(url: string, options: { method?: string; headers?: Record<string, string> } = {}) {
  return new NextRequest(url, { ...options, headers: { host: new URL(url).host, ...options.headers } })
}

test('opens the configured HTTPS sign-in when visiting login from the NAS IP', () => {
  process.env.NEXTAUTH_URL = publicUrl
  expect(proxy(request(`${lan}/auth/login?error=SessionRequired`)).headers.get('location'))
    .toBe(`${publicUrl}/auth/login?error=SessionRequired`)
})

test('accepts the configured public Host even when the proxy origin uses HTTP', () => {
  process.env.NEXTAUTH_URL = publicUrl
  expect(proxy(request('http://bjj.example.com/auth/login')).headers.get('location')).toBeNull()
})

test('a LAN-only setup can sign in locally, including after a stale cookie', () => {
  process.env.NEXTAUTH_URL = lan
  expect(proxy(request(`${lan}/dashboard`)).headers.get('location')).toBe(`${lan}/auth/login`)
  expect(proxy(request(`${lan}/auth/login`, {
    headers: { cookie: 'next-auth.session-token=stale' },
  })).headers.get('location')).toBeNull()
})

test('auth API POSTs are never redirected to another host', () => {
  process.env.NEXTAUTH_URL = publicUrl
  expect(proxy(request(`${lan}/api/auth/callback/credentials`, { method: 'POST' })).headers.get('location')).toBeNull()
})
