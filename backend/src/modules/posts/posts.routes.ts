import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { optionalAuth } from '../../middleware/optional-auth.js'
import { requireRole } from '../../middleware/require-role.js'
import { errorResponseSchema } from '../../shared/schemas/common.js'
import { idParamSchema } from '../../shared/schemas/params.js'
import { fastifyJsonSchemaOptions } from '../../shared/schemas/json-schema-options.js'
import { PostsService } from './posts.service.js'
import {
  createPostSchema,
  postSchema,
  postsListQuerySchema,
  postsListResponseSchema,
  updatePostSchema,
  type CreatePostInput,
  type PostsListQuery,
  type UpdatePostInput,
} from './posts.schemas.js'

export async function postsRoutes(fastify: FastifyInstance) {
  const postsService = new PostsService(fastify.db)

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Posts'],
        summary: 'Список публікацій',
        description: 'Підтримує пошук, фільтр за категорією/типом та пагінацію',
        querystring: z.toJSONSchema(postsListQuerySchema, fastifyJsonSchemaOptions),
        response: {
          200: z.toJSONSchema(postsListResponseSchema, fastifyJsonSchemaOptions),
          400: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [optionalAuth],
    },
    async (request) => {
      const query = request.query as PostsListQuery
      const currentUserId = request.user?.type === 'access' ? request.user.sub : undefined
      return postsService.list(query, currentUserId)
    },
  )

  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['Posts'],
        summary: 'Отримати публікацію за ID',
        params: z.toJSONSchema(idParamSchema, fastifyJsonSchemaOptions),
        response: {
          200: z.toJSONSchema(postSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [optionalAuth],
    },
    async (request) => {
      const { id } = request.params as z.infer<typeof idParamSchema>
      const currentUserId = request.user?.type === 'access' ? request.user.sub : undefined
      return postsService.getById(id, currentUserId)
    },
  )

  fastify.post(
    '/',
    {
      schema: {
        tags: ['Posts'],
        summary: 'Створити публікацію',
        security: [{ bearerAuth: [] }],
        body: z.toJSONSchema(createPostSchema, fastifyJsonSchemaOptions),
        response: {
          201: z.toJSONSchema(postSchema, fastifyJsonSchemaOptions),
          400: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const body = request.body as CreatePostInput
      const post = await postsService.create(body, request.user.sub)
      return reply.status(201).send(post)
    },
  )

  fastify.patch(
    '/:id',
    {
      schema: {
        tags: ['Posts'],
        summary: 'Оновити публікацію (автор або ADMIN)',
        security: [{ bearerAuth: [] }],
        params: z.toJSONSchema(idParamSchema, fastifyJsonSchemaOptions),
        body: z.toJSONSchema(updatePostSchema, fastifyJsonSchemaOptions),
        response: {
          200: z.toJSONSchema(postSchema, fastifyJsonSchemaOptions),
          400: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          403: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request) => {
      const { id } = request.params as z.infer<typeof idParamSchema>
      const body = request.body as UpdatePostInput
      return postsService.update(id, body, {
        id: request.user.sub,
        role: request.user.role,
      })
    },
  )

  fastify.delete(
    '/:id',
    {
      schema: {
        tags: ['Posts'],
        summary: 'Видалити публікацію (ADMIN)',
        security: [{ bearerAuth: [] }],
        params: z.toJSONSchema(idParamSchema, fastifyJsonSchemaOptions),
        response: {
          204: { type: 'null', description: 'Публікацію видалено' },
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          403: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate, requireRole('ADMIN')],
    },
    async (request, reply) => {
      const { id } = request.params as z.infer<typeof idParamSchema>
      await postsService.delete(id)
      return reply.status(204).send()
    },
  )
}
