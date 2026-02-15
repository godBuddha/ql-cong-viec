/**
 * Header đơn giản theo style admin.
 */

import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm text-slate-300">ql-cong-viec</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="text-slate-300 hover:text-emerald-400" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-slate-300 hover:text-emerald-400" href="/tasks">
            Tasks
          </Link>
          <Link className="text-slate-300 hover:text-emerald-400" href="/kanban">
            Kanban
          </Link>
          <Link className="text-slate-300 hover:text-emerald-400" href="/calendar">
            Calendar
          </Link>
        </nav>
      </div>
    </header>
  )
}
