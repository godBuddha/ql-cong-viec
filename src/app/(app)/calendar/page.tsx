/**
 * Calendar MVP trong ngày.
 * - Hiển thị task theo ngày dueDate (list theo ngày).
 */

'use client'

import { format, isSameDay, startOfDay } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

type Task = {
  id: string
  title: string
  status: 'TODO' | 'DOING' | 'DONE'
  dueDate?: string | null
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  async function load() {
    const res = await fetch('/api/tasks')
    const data = await res.json()
    setTasks(data.tasks || [])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  const days = useMemo(() => {
    const withDue: Array<Task & { due: Date }> = tasks
      .filter((t) => t.dueDate)
      .map((t) => ({ ...t, due: new Date(String(t.dueDate)) }))
      .sort((a, b) => a.due.getTime() - b.due.getTime())

    const buckets: Array<{ day: Date; items: Task[] }> = []
    for (const t of withDue) {
      const d = startOfDay(t.due)
      const last = buckets[buckets.length - 1]
      if (!last || !isSameDay(last.day, d)) {
        buckets.push({ day: d, items: [t] })
      } else {
        last.items.push(t)
      }
    }

    return buckets
  }, [tasks])

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Lịch (MVP)</h1>
          <p className="text-sm text-slate-400 mt-1">Task có dueDate sẽ hiển thị theo ngày</p>
        </div>
        <button
          onClick={load}
          className="rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {days.map((b) => (
          <div key={b.day.toISOString()} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="text-sm font-semibold">{format(b.day, 'yyyy-MM-dd')}</div>
            <div className="mt-3 space-y-2">
              {b.items.map((t) => (
                <div key={t.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{t.status}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {days.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 text-sm text-slate-400">
            Chưa có task nào có dueDate.
          </div>
        ) : null}
      </div>
    </div>
  )
}
