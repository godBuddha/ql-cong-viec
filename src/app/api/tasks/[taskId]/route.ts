/**
 * Task detail API
 * - PATCH: update fields
 * - DELETE: archive
 */

import { NextResponse } from 'next/server'
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

export async function PATCH(req: Request, ctx: { params: Promise<{ taskId: string }> }) {
  const token = readSessionCookie(req)
  if (!token) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const sess = await verifySession(token)
  const { taskId } = await ctx.params

  const body = await req.json().catch(() => ({}))

  // RBAC tối thiểu: MEMBER chỉ được sửa task của mình
  const ref = db().collection('orgs').doc(sess.orgId).collection('tasks').doc(taskId)
  const snap = await ref.get()
  if (!snap.exists) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  const task = snap.data() as { assigneeId?: string }

  if (sess.role === 'MEMBER' && task.assigneeId !== sess.userId) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const patch: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (typeof body.title === 'string') patch.title = body.title.trim()
  if (typeof body.description === 'string') patch.description = body.description
  if (typeof body.priority === 'string') patch.priority = body.priority
  if (typeof body.status === 'string') patch.status = body.status

  // dueDate: ISO string or null
  if (body.dueDate === null) patch.dueDate = null
  if (typeof body.dueDate === 'string' && body.dueDate) patch.dueDate = new Date(body.dueDate)

  await ref.set(patch, { merge: true })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, ctx: { params: Promise<{ taskId: string }> }) {
  const token = readSessionCookie(req)
  if (!token) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const sess = await verifySession(token)
  const { taskId } = await ctx.params

  const ref = db().collection('orgs').doc(sess.orgId).collection('tasks').doc(taskId)
  const snap = await ref.get()
  if (!snap.exists) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  const task = snap.data() as { assigneeId?: string }

  if (sess.role === 'MEMBER' && task.assigneeId !== sess.userId) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  await ref.set(
    {
      isArchived: true,
      updatedAt: new Date(),
    },
    { merge: true },
  )

  return NextResponse.json({ ok: true })
}
