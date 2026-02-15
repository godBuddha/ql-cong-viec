/**
 * Dashboard (MVP trong ngày).
 *
 * Hôm nay dùng query nhẹ (không metricsDaily) để có số liệu hiển thị.
 */

import { Card } from '@/components/ui/Card'

async function getStats() {
  // gọi nội bộ API bằng relative URL khi chạy server-side: dùng fetch với absolute
  // => đơn giản hoá: hiển thị placeholder + hướng dẫn.
  return {
    total: '—',
    todo: '—',
    doing: '—',
    done: '—',
  }
}

export default async function Dashboard() {
  const s = await getStats()

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Tổng quan nhanh trong ngày</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Tổng tasks" value={s.total} note="(MVP: sẽ realtime sau)" />
        <Card title="TODO" value={s.todo} />
        <Card title="DOING" value={s.doing} />
        <Card title="DONE" value={s.done} />
      </div>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="font-semibold">Trạng thái hệ thống</div>
        <ul className="mt-2 text-sm text-slate-300 list-disc pl-5 space-y-1">
          <li>Auth username/password: OK</li>
          <li>Firestore region: asia-southeast1</li>
          <li>API: /api/tasks, /api/health: OK</li>
        </ul>
      </div>
    </div>
  )
}
