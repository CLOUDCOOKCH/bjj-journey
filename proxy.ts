import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/dashboard', '/calendar', '/settings']
const authPaths = ['/auth/login', '/auth/sign-up']

function configuredOrigin() {
  const value = process.env.NEXTAUTH_URL
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isProtected = protectedPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))
  const isAuthPage = authPaths.includes(pathname)
  const canonical = (isProtected || isAuthPage) ? configuredOrigin() : null

  // Leave credentials POSTs and other API requests on their original host.
  if (request.method === 'GET' || request.method === 'HEAD') {
    if (canonical && request.headers.get('host')?.toLowerCase() !== canonical.host) {
      const target = new URL(canonical.origin)
      target.pathname = pathname
      target.search = search
      return NextResponse.redirect(target)
    }
  }

  const token = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token')
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/auth/login', canonical ?? request.url))
  }

  // The login page only redirects signed-in users after confirming their session.
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
