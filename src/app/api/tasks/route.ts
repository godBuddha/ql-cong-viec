/**
 * Tasks API (MVP)
 * - GET: list latest tasks
 * - POST: create task
 */

import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth/session'

export const runtime = 'nodejs'

function readSessionCookie(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const token = cookie
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(SESSION_COOKIE_NAME + '='))
    ?.split('=')[1]
  return token || null
}

export async function GET(req: Request) {
  const token = readSessionCookie(req)
  if (!token) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const sess = await verifySession(token)

  const snap = await db()
    .collection('orgs')
    .doc(sess.orgId)
    .collection('tasks')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()

  const tasks = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
  return NextResponse.json({ ok: true, tasks })
}

export async function POST(req: Request) {
  const token = readSessionCookie(req)
  if (!token) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const sess = await verifySession(token)
  const body = await req.json().catch(() => ({}))
  const title = String(body.title || '').trim()
  if (!title) return NextResponse.json({ ok: false, error: 'missing_title' }, { status: 400 })

  const taskId = nanoid()
  await db()
    .collection('orgs')
    .doc(sess.orgId)
    .collection('tasks')
    .doc(taskId)
    .set({
      title,
      status: 'TODO',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: sess.userId,
      assigneeId: sess.userId,
      departmentId: sess.departmentId ?? null,
      isArchived: false,
    })

  return NextResponse.json({ ok: true, taskId })
}
