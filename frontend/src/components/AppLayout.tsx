import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/shared/auth/auth-store'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200',
  ].join(' ')

export function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-lg font-semibold">
            Stud Club
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={navLinkClass} end>
              Головна
            </NavLink>
            <NavLink to="/blog" className={navLinkClass}>
              Блог
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">{user?.name}</span>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
                >
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
                >
                  Увійти
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                >
                  Реєстрація
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
