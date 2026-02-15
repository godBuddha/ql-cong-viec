/**
 * Trang đăng nhập username/password.
 *
 * Lưu ý: Một số in-app browser (Telegram) có thể xử lý redirect/cookie kém.
 * Vì vậy dùng submit qua fetch để đảm bảo cookie được set đúng.
 */

'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const form = new URLSearchParams()
      form.set('username', username)
      form.set('password', password)

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
        credentials: 'include',
        redirect: 'follow',
      })

      // Nếu login ok, server sẽ redirect sang /dashboard
      if (res.ok) {
        window.location.href = '/dashboard'
        return
      }

      setError('Đăng nhập thất bại. Kiểm tra lại username/password.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow">
        <h1 className="text-xl font-semibold">QL Công Việc</h1>
        <p className="text-sm text-slate-300 mt-1">Đăng nhập bằng username/password</p>

        {error ? (
          <div className="mt-4 rounded-md border border-rose-900 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md bg-slate-950/60 border border-slate-800 px-3 py-2"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-md bg-slate-950/60 border border-slate-800 px-3 py-2"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          Nếu anh đang mở trong Telegram mà không vào được, hãy bấm “Open in browser” (mở bằng Chrome/Safari)
          để cookie hoạt động ổn định.
        </p>
      </div>
    </div>
  )
}
