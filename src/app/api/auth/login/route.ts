/**
 * POST /api/auth/login
 * - Nhận username/password
 * - Verify với Firestore orgs/{orgId}/users
 * - Set cookie session
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { SESSION_COOKIE_NAME, signSession } from '@/lib/auth/session'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const form = await req.formData()
  const username = String(form.get('username') || '').trim().toLowerCase()
  const password = String(form.get('password') || '')

  if (!username || !password) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const orgId = 'default'

  const snap = await db()
    .collection('orgs')
    .doc(orgId)
    .collection('users')
    .where('username', '==', username)
    .limit(1)
    .get()

  if (snap.empty) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const doc = snap.docs[0]
  const user = doc.data() as any

  const ok = await verifyPassword(password, String(user.passwordHash || ''))
  if (!ok) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const token = await signSession({
    userId: doc.id,
    orgId,
    role: user.role || 'MEMBER',
    departmentId: user.departmentId || null,
  })

  const res = NextResponse.redirect(new URL('/dashboard', req.url))
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
