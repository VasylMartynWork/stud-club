import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { errorResponseSchema } from '../../shared/schemas/common.js'
import { postIdParamSchema } from '../../shared/schemas/params.js'
import { fastifyJsonSchemaOptions } from '../../shared/schemas/json-schema-options.js'
import { likeStatsSchema } from './likes.schemas.js'
import { LikesService } from './likes.service.js'

export async function likesRoutes(fastify: FastifyInstance) {
  const likesService = new LikesService(fastify.db)

  fastify.post(
    '/:postId/likes',
    {
      schema: {
        tags: ['Likes'],
        summary: 'Поставити лайк',
        security: [{ bearerAuth: [] }],
        params: z.toJSONSchema(postIdParamSchema, fastifyJsonSchemaOptions),
        response: {
          200: z.toJSONSchema(likeStatsSchema, fastifyJsonSchemaOptions),
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          409: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request) => {
      const { postId } = request.params as z.infer<typeof postIdParamSchema>
      return likesService.like(postId, request.user.sub)
    },
  )

  fastify.delete(
    '/:postId/likes',
    {
      schema: {
        tags: ['Likes'],
        summary: 'Прибрати лайк',
        security: [{ bearerAuth: [] }],
        params: z.toJSONSchema(postIdParamSchema, fastifyJsonSchemaOptions),
        response: {
          200: z.toJSONSchema(likeStatsSchema, fastifyJsonSchemaOptions),
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request) => {
      const { postId } = request.params as z.infer<typeof postIdParamSchema>
      return likesService.unlike(postId, request.user.sub)
    },
  )
}
