export type UserRole = 'STUDENT' | 'ADMIN'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type AuthResponse = {
  accessToken: string
  user: User
}

export type MeResponse = {
  user: User | null
}

export type ApiErrorResponse = {
  message: string
  code?: string
  errors?: unknown
}
