/**
 * POST /api/auth/bootstrap
 * - Tạo user OWNER đầu tiên nếu org default chưa có users.
 * - Bảo vệ bằng env BOOTSTRAP_TOKEN.
 *
 * Body JSON: { token, username, password, fullName }
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const token = String(body.token || '')

  const expected = process.env.BOOTSTRAP_TOKEN
  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const orgId = 'default'
  const username = String(body.username || '').trim().toLowerCase()
  const password = String(body.password || '')
  const fullName = String(body.fullName || 'Owner')

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }

  const usersCol = db().collection('orgs').doc(orgId).collection('users')
  const existing = await usersCol.limit(1).get()
  if (!existing.empty) {
    return NextResponse.json({ ok: false, error: 'already_initialized' }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)

  const docRef = await usersCol.add({
    username,
    fullName,
    role: 'OWNER',
    departmentId: null,
    passwordHash,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return NextResponse.json({ ok: true, userId: docRef.id })
}
