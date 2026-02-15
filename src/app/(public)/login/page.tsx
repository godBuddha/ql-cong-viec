/**
 * Trang đăng nhập username/password.
 */

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow">
        <h1 className="text-xl font-semibold">QL Công Việc</h1>
        <p className="text-sm text-slate-300 mt-1">Đăng nhập bằng username/password</p>

        <form className="mt-6 space-y-3" method="post" action="/api/auth/login">
          <div>
            <label className="text-sm">Username</label>
            <input
              name="username"
              className="mt-1 w-full rounded-md bg-slate-950/60 border border-slate-800 px-3 py-2"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input
              name="password"
              type="password"
              className="mt-1 w-full rounded-md bg-slate-950/60 border border-slate-800 px-3 py-2"
              autoComplete="current-password"
              required
            />
          </div>
          <button className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 py-2 font-medium">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  )
}
