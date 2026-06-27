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
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="text-lg font-semibold">
              Stud Club
            </Link>

            <div className="flex items-center gap-2 sm:hidden">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
                >
                  Вийти
                </button>
              ) : (
                <Link
                  to="/login"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
                >
                  Увійти
                </Link>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={navLinkClass} end>
              Головна
            </NavLink>
            <NavLink to="/blog" className={navLinkClass}>
              Блог
            </NavLink>
            {isAuthenticated ? (
              <NavLink to="/posts/new" className={navLinkClass}>
                Створити
              </NavLink>
            ) : null}
            {user?.role === 'ADMIN' ? (
              <NavLink to="/admin/categories" className={navLinkClass}>
                Категорії
              </NavLink>
            ) : null}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">
                  {user?.name}
                  {user?.role === 'ADMIN' ? (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Адмін
                    </span>
                  ) : null}
                </span>
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
