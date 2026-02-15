/**
 * Kanban MVP trong ngày.
 * - Load tasks từ API
 * - Drag task -> drop vào cột => PATCH status
 */

'use client'

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useMemo, useState } from 'react'

type Task = {
  id: string
  title: string
  status: 'TODO' | 'DOING' | 'DONE'
}

const COLUMNS: Array<{ key: Task['status']; label: string }> = [
  { key: 'TODO', label: 'TODO' },
  { key: 'DOING', label: 'DOING' },
  { key: 'DONE', label: 'DONE' },
]

function Column({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={
        'rounded-xl border border-slate-800 p-3 min-h-[260px] ' +
        (isOver ? 'bg-emerald-500/10' : 'bg-slate-900/30')
      }
    >
      <div className="text-sm font-semibold text-slate-200">{label}</div>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={
        'cursor-grab rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-sm active:cursor-grabbing ' +
        (isDragging ? 'opacity-60' : '')
      }
    >
      {task.title}
    </div>
  )
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  async function load() {
    const res = await fetch('/api/tasks')
    const data = await res.json()
    const list = (data.tasks || []) as Array<{ id: string; title: string; status: Task['status'] }>
    setTasks(list.map((t) => ({ id: t.id, title: t.title, status: t.status })))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  const grouped = useMemo(() => {
    const m: Record<string, Task[]> = { TODO: [], DOING: [], DONE: [] }
    for (const t of tasks) m[t.status].push(t)
    return m as Record<Task['status'], Task[]>
  }, [tasks])

  async function setStatus(taskId: string, status: Task['status']) {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  async function onDragEnd(e: DragEndEvent) {
    if (!e.over) return

    const taskId = String(e.active.id)
    const toCol = String(e.over.id) as Task['status']

    if (!['TODO', 'DOING', 'DONE'].includes(toCol)) return

    const current = tasks.find((t) => t.id === taskId)
    if (!current) return
    if (current.status === toCol) return

    await setStatus(taskId, toCol)
    await load()
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kanban</h1>
          <p className="text-sm text-slate-400 mt-1">Kéo thả task giữa các cột</p>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {COLUMNS.map((c) => (
            <Column key={c.key} id={c.key} label={c.label}>
              {grouped[c.key].map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
              {grouped[c.key].length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-800 p-3 text-xs text-slate-500">
                  Thả task vào đây
                </div>
              ) : null}
            </Column>
          ))}
        </div>
      </DndContext>

      <div className="mt-6 text-xs text-slate-500">
        MVP hôm nay: kéo-thả đổi status. Nâng cấp sortable + swimlanes sẽ làm sau.
      </div>
    </div>
  )
}
