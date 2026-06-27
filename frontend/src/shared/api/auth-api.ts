import { api } from '@/shared/api/client'
import type { AuthResponse, MeResponse } from '@/shared/api/types'

export type RegisterPayload = {
  name: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export const authApi = {
  register(payload: RegisterPayload) {
    return api.post<AuthResponse>('/auth/register', payload)
  },

  login(payload: LoginPayload) {
    return api.post<AuthResponse>('/auth/login', payload)
  },

  refresh() {
    return api.post<AuthResponse>('/auth/refresh')
  },

  logout() {
    return api.post('/auth/logout')
  },

  me() {
    return api.get<MeResponse>('/auth/me')
  },
}
