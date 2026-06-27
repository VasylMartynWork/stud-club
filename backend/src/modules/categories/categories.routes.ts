import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireRole } from '../../middleware/require-role.js'
import { errorResponseSchema } from '../../shared/schemas/common.js'
import { idParamSchema } from '../../shared/schemas/params.js'
import { fastifyJsonSchemaOptions } from '../../shared/schemas/json-schema-options.js'
import { CategoriesService } from './categories.service.js'
import {
  categoriesListSchema,
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from './categories.schemas.js'

export async function categoriesRoutes(fastify: FastifyInstance) {
  const categoriesService = new CategoriesService(fastify.db)

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Список категорій',
        response: {
          200: z.toJSONSchema(categoriesListSchema, fastifyJsonSchemaOptions),
        },
      },
    },
    async () => {
      const items = await categoriesService.list()
      return { items }
    },
  )

  fastify.post(
    '/',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Створити категорію (ADMIN)',
        security: [{ bearerAuth: [] }],
        body: z.toJSONSchema(createCategorySchema, fastifyJsonSchemaOptions),
        response: {
          201: z.toJSONSchema(categorySchema, fastifyJsonSchemaOptions),
          400: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          403: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          409: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate, requireRole('ADMIN')],
    },
    async (request, reply) => {
      const body = request.body as CreateCategoryInput
      const category = await categoriesService.create(body)
      return reply.status(201).send(category)
    },
  )

  fastify.patch(
    '/:id',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Оновити категорію (ADMIN)',
        security: [{ bearerAuth: [] }],
        params: z.toJSONSchema(idParamSchema, fastifyJsonSchemaOptions),
        body: z.toJSONSchema(updateCategorySchema, fastifyJsonSchemaOptions),
        response: {
          200: z.toJSONSchema(categorySchema, fastifyJsonSchemaOptions),
          400: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          403: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          409: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate, requireRole('ADMIN')],
    },
    async (request) => {
      const { id } = request.params as z.infer<typeof idParamSchema>
      const body = request.body as UpdateCategoryInput
      return categoriesService.update(id, body)
    },
  )

  fastify.delete(
    '/:id',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Видалити категорію (ADMIN)',
        security: [{ bearerAuth: [] }],
        params: z.toJSONSchema(idParamSchema, fastifyJsonSchemaOptions),
        response: {
          204: { type: 'null', description: 'Категорію видалено' },
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          403: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate, requireRole('ADMIN')],
    },
    async (request, reply) => {
      const { id } = request.params as z.infer<typeof idParamSchema>
      await categoriesService.delete(id)
      return reply.status(204).send()
    },
  )
}
