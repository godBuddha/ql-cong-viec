/**
 * Tasks page (MVP trong ngày).
 */

'use client'

import { useEffect, useMemo, useState } from 'react'

type Task = {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'DOING' | 'DONE'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string | null
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-300">
      {children}
    </span>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filteredUrl = useMemo(() => {
    const qs = new URLSearchParams()
    if (statusFilter) qs.set('status', statusFilter)
    const q = qs.toString()
    return '/api/tasks' + (q ? `?${q}` : '')
  }, [statusFilter])

  async function load() {
    const res = await fetch(filteredUrl)
    const data = (await res.json()) as { tasks?: Task[] }
    setTasks(data.tasks || [])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredUrl])

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      }),
    })
    if (res.ok) {
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setDueDate('')
      await load()
    }
  }

  async function setStatus(taskId: string, status: Task['status']) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) await load()
  }

  async function archive(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    if (res.ok) await load()
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Nhiệm vụ</h1>
          <p className="text-sm text-slate-400 mt-1">Tạo nhanh + đổi trạng thái</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="TODO">TODO</option>
            <option value="DOING">DOING</option>
            <option value="DONE">DONE</option>
          </select>
        </div>
      </div>

      <form onSubmit={createTask} className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-400">Tiêu đề</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md bg-slate-950/60 border border-slate-800 px-3 py-2"
              placeholder="VD: Hoàn thiện module Kanban"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-400">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-md bg-slate-950/60 border border-slate-800 px-3 py-2"
              placeholder="(tuỳ chọn)"
              rows={3}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
              className="mt-1 w-full rounded-md bg-slate-950/60 border border-slate-800 px-3 py-2"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Due date</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-md bg-slate-950/60 border border-slate-800 px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2">
            Tạo task
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{t.title}</div>
                {t.description ? <div className="mt-1 text-sm text-slate-300">{t.description}</div> : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>{t.status}</Badge>
                  <Badge>{t.priority || 'MEDIUM'}</Badge>
                  {t.dueDate ? <Badge>Due: {new Date(t.dueDate).toLocaleString()}</Badge> : null}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatus(t.id, 'TODO')}
                    className="rounded-md bg-slate-900 border border-slate-800 px-3 py-1 text-xs hover:bg-slate-800"
                  >
                    TODO
                  </button>
                  <button
                    onClick={() => setStatus(t.id, 'DOING')}
                    className="rounded-md bg-slate-900 border border-slate-800 px-3 py-1 text-xs hover:bg-slate-800"
                  >
                    DOING
                  </button>
                  <button
                    onClick={() => setStatus(t.id, 'DONE')}
                    className="rounded-md bg-slate-900 border border-slate-800 px-3 py-1 text-xs hover:bg-slate-800"
                  >
                    DONE
                  </button>
                </div>
                <button
                  onClick={() => archive(t.id)}
                  className="rounded-md bg-rose-600/20 border border-rose-900 px-3 py-1 text-xs text-rose-200 hover:bg-rose-600/30"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 text-sm text-slate-400">
            Chưa có task nào.
          </div>
        ) : null}
      </div>
    </div>
  )
}
