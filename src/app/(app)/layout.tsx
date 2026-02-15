/**
 * Layout phần app (sau login).
 * Hôm nay: dựng UI admin dạng ArchitectUI-clone (gọn, đẹp, nhanh).
 */

import Link from 'next/link'
import { Header } from '@/components/layout/Header'

function SideLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-emerald-400"
      href={href}
    >
      {label}
    </Link>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-6 flex gap-6">
        <aside className="w-64 shrink-0">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <div className="px-3 py-2 font-semibold">QL Công Việc</div>
            <div className="mt-2">
              <SideLink href="/dashboard" label="Dashboard" />
              <SideLink href="/tasks" label="Nhiệm vụ" />
              <SideLink href="/kanban" label="Kanban" />
              <SideLink href="/calendar" label="Lịch" />
            </div>
            <form className="mt-3 border-t border-slate-800 pt-3" method="post" action="/api/auth/logout">
              <button className="w-full rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">
                Đăng xuất
              </button>
            </form>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
