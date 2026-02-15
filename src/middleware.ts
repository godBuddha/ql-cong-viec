/**
 * Middleware bảo vệ route.
 *
 * - Public: /login, /api/auth/*, /api/health
 * - App: /dashboard, /tasks, /kanban, /calendar
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth/session'

const PUBLIC_PATHS = new Set<string>(['/login'])
const PUBLIC_PREFIXES = ['/api/auth', '/api/health', '/_next', '/favicon.ico']

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (isPublic(pathname)) return NextResponse.next()

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  try {
    await verifySession(token)
    return NextResponse.next()
  } catch {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    const res = NextResponse.redirect(url)
    res.cookies.delete(SESSION_COOKIE_NAME)
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
}
