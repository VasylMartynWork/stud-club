import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/shared/api/auth-api'
import type { LoginPayload, RegisterPayload } from '@/shared/api/auth-api'
import type { User } from '@/shared/api/types'
import { tokenStorage } from '@/shared/auth/token-storage'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const applyAuth = useCallback((accessToken: string, nextUser: User) => {
    tokenStorage.set(accessToken)
    setUser(nextUser)
  }, [])

  const clearAuth = useCallback(() => {
    tokenStorage.set(null)
    setUser(null)
  }, [])

  useEffect(() => {
    async function initialize() {
      try {
        const { data } = await authApi.refresh()
        applyAuth(data.accessToken, data.user)
      } catch {
        clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    void initialize()
  }, [applyAuth, clearAuth])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await authApi.login(payload)
      applyAuth(data.accessToken, data.user)
    },
    [applyAuth],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await authApi.register(payload)
      applyAuth(data.accessToken, data.user)
    },
    [applyAuth],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
