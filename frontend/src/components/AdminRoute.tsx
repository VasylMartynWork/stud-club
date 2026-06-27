import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/shared/auth/auth-store'

export function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-600">
        Завантаження...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
