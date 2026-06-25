import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '../../db/schema/index.js'
import { errorResponseSchema } from '../../shared/schemas/common.js'
import { fastifyJsonSchemaOptions } from '../../shared/schemas/json-schema-options.js'
import {
  AuthService,
  getRefreshCookieName,
  getRefreshCookieOptions,
} from './auth.service.js'
import {
  authResultSchema,
  loginSchema,
  meResponseSchema,
  refreshCookieSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from './auth.schemas.js'

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.db, fastify)

  fastify.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Реєстрація нового користувача',
        body: z.toJSONSchema(registerSchema, fastifyJsonSchemaOptions),
        response: {
          201: z.toJSONSchema(authResultSchema, fastifyJsonSchemaOptions),
          400: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          409: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
    },
    async (request, reply) => {
      const body = request.body as RegisterInput
      const { result, refreshToken } = await authService.register(body)

      reply.setCookie(getRefreshCookieName(), refreshToken, getRefreshCookieOptions())

      return reply.status(201).send(result)
    },
  )

  fastify.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Вхід у систему',
        body: z.toJSONSchema(loginSchema, fastifyJsonSchemaOptions),
        response: {
          200: z.toJSONSchema(authResultSchema, fastifyJsonSchemaOptions),
          400: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
    },
    async (request, reply) => {
      const body = request.body as LoginInput
      const { result, refreshToken } = await authService.login(body)

      reply.setCookie(getRefreshCookieName(), refreshToken, getRefreshCookieOptions())

      return reply.send(result)
    },
  )

  fastify.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Оновлення access token',
        description: 'Потребує HttpOnly cookie `refreshToken`',
        cookies: z.toJSONSchema(refreshCookieSchema, fastifyJsonSchemaOptions),
        response: {
          200: z.toJSONSchema(authResultSchema, fastifyJsonSchemaOptions),
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
    },
    async (request, reply) => {
      const refreshToken = request.cookies[getRefreshCookieName()]
      const { result, refreshToken: newRefreshToken } = await authService.refresh(refreshToken)

      reply.setCookie(getRefreshCookieName(), newRefreshToken, getRefreshCookieOptions())

      return reply.send(result)
    },
  )

  fastify.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Вихід з системи',
        description: 'Очищає HttpOnly cookie `refreshToken`',
        response: {
          204: {
            type: 'null',
            description: 'Успішний вихід',
          },
        },
      },
    },
    async (_request, reply) => {
      reply.clearCookie(getRefreshCookieName(), getRefreshCookieOptions())

      return reply.status(204).send()
    },
  )

  fastify.get(
    '/me',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Поточний користувач',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.toJSONSchema(meResponseSchema, fastifyJsonSchemaOptions),
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request) => {
      const user = await fastify.db.query.users.findFirst({
        where: eq(users.id, request.user.sub),
      })

      if (!user) {
        return { user: null }
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }
    },
  )
}
