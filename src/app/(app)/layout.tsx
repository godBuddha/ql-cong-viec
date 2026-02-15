/**
 * Layout phần app (sau login).
 * Tạm dùng UI đơn giản, sau sẽ thay skin ArchitectUI.
 */

import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        <aside className="w-64 border-r border-slate-800 p-4">
          <div className="font-semibold">QL Công Việc</div>
          <nav className="mt-4 space-y-2 text-sm">
            <Link className="block hover:text-emerald-400" href="/dashboard">
              Dashboard
            </Link>
            <Link className="block hover:text-emerald-400" href="/tasks">
              Nhiệm vụ
            </Link>
            <Link className="block hover:text-emerald-400" href="/kanban">
              Kanban
            </Link>
            <Link className="block hover:text-emerald-400" href="/calendar">
              Lịch
            </Link>
          </nav>
          <form className="mt-6" method="post" action="/api/auth/logout">
            <button className="text-xs text-slate-400 hover:text-slate-200">Đăng xuất</button>
          </form>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
