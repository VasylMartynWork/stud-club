import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email().max(255),
  password: z.string().min(8).max(128),
})

export const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(1).max(128),
})

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: z.enum(['STUDENT', 'ADMIN']),
})

export const authResultSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
})

export const meResponseSchema = z.object({
  user: userSchema.nullable(),
})

export const refreshCookieSchema = z.object({
  refreshToken: z.string().min(1),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
