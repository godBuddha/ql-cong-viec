/**
 * Tasks API (MVP trong ngày)
 * - GET: list tasks (filter status)
 * - POST: create task (full fields tối thiểu)
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
  const url = new URL(req.url)
  const status = url.searchParams.get('status')

  let q: FirebaseFirestore.Query = db()
    .collection('orgs')
    .doc(sess.orgId)
    .collection('tasks')
    .where('isArchived', '==', false)

  if (status) {
    q = q.where('status', '==', status)
  }

  // NOTE (MVP): Tránh yêu cầu composite index (isArchived + createdAt).
  // Với Firestore production mode, query where()+orderBy() khác field có thể yêu cầu tạo index,
  // dẫn đến 500. Để hệ thống chạy ổn ngay, ta bỏ orderBy và để client sort nếu cần.
  const snap = await q.limit(100).get()
  const tasks = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
  return NextResponse.json({ ok: true, tasks })
}

export async function POST(req: Request) {
  const token = readSessionCookie(req)
  if (!token) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const sess = await verifySession(token)
  const body = await req.json().catch(() => ({}))

  const title = String(body.title || '').trim()
  if (!title) return NextResponse.json({ ok: false, error: 'missing_title' }, { status: 400 })

  const description = typeof body.description === 'string' ? body.description : ''
  const priority = (String(body.priority || 'MEDIUM') as string).toUpperCase()
  const dueDate = body.dueDate ? new Date(String(body.dueDate)) : null

  const taskId = nanoid()

  await db()
    .collection('orgs')
    .doc(sess.orgId)
    .collection('tasks')
    .doc(taskId)
    .set({
      title,
      description,
      status: 'TODO',
      priority,
      dueDate,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: sess.userId,
      assigneeId: sess.userId,
      departmentId: sess.departmentId ?? null,
      isArchived: false,
    })

  return NextResponse.json({ ok: true, taskId })
}
