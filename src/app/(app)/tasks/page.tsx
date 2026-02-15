/**
 * Tasks page (client fetch từ API).
 */

'use client'

import { useEffect, useState } from 'react'

type Task = {
  id: string
  title: string
  status: 'TODO' | 'DOING' | 'DONE'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')

  async function load() {
    const res = await fetch('/api/tasks')
    const data = await res.json()
    setTasks(data.tasks || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (res.ok) {
      setTitle('')
      await load()
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Nhiệm vụ</h1>

      <form onSubmit={createTask} className="mt-4 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-md bg-slate-900 border border-slate-800 px-3 py-2"
          placeholder="Nhập tiêu đề nhiệm vụ..."
          required
        />
        <button className="rounded-md bg-emerald-600 hover:bg-emerald-500 px-4">Tạo</button>
      </form>

      <div className="mt-6 space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="rounded-md border border-slate-800 bg-slate-900/40 p-3">
            <div className="font-medium">{t.title}</div>
            <div className="text-xs text-slate-400">{t.status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
