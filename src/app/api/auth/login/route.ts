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
  // Hỗ trợ cả:
  // - Browser form submit (multipart/form-data)
  // - fetch() x-www-form-urlencoded
  // - (tuỳ chọn) JSON
  const ct = (req.headers.get('content-type') || '').toLowerCase()

  let username = ''
  let password = ''

  if (ct.includes('application/x-www-form-urlencoded')) {
    const text = await req.text()
    const params = new URLSearchParams(text)
    username = String(params.get('username') || '').trim().toLowerCase()
    password = String(params.get('password') || '')
  } else if (ct.includes('application/json')) {
    const body = (await req.json().catch(() => ({}))) as { username?: unknown; password?: unknown }
    username = String(body.username || '').trim().toLowerCase()
    password = String(body.password || '')
  } else {
    const form = await req.formData()
    username = String(form.get('username') || '').trim().toLowerCase()
    password = String(form.get('password') || '')
  }

  const wantJson = req.headers.get('x-oc-fetch') === '1' || (req.headers.get('accept') || '').includes('application/json')

  if (!username || !password) {
    return wantJson
      ? NextResponse.json({ ok: false, error: 'missing_username_or_password' }, { status: 400 })
      : NextResponse.redirect(new URL('/login', req.url))
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
    return wantJson
      ? NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', req.url))
  }

  const doc = snap.docs[0]
  const user = doc.data() as { passwordHash?: string; role?: string; departmentId?: string | null }

  const ok = await verifyPassword(password, String(user.passwordHash || ''))
  if (!ok) {
    return wantJson
      ? NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', req.url))
  }

  const roleRaw = String(user.role || 'MEMBER').toUpperCase()
  const role = (roleRaw === 'OWNER' || roleRaw === 'LEADER' || roleRaw === 'MEMBER'
    ? roleRaw
    : 'MEMBER') as 'OWNER' | 'LEADER' | 'MEMBER'

  const token = await signSession({
    userId: doc.id,
    orgId,
    role,
    departmentId: user.departmentId || null,
  })

  const res = wantJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL('/dashboard', req.url))

  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
