import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { errorResponseSchema } from '../../shared/schemas/common.js'
import { postCommentParamsSchema, postIdParamSchema } from '../../shared/schemas/params.js'
import { fastifyJsonSchemaOptions } from '../../shared/schemas/json-schema-options.js'
import { CommentsService } from './comments.service.js'
import {
  commentSchema,
  commentsListSchema,
  createCommentSchema,
  type CreateCommentInput,
} from './comments.schemas.js'

export async function postCommentsRoutes(fastify: FastifyInstance) {
  const commentsService = new CommentsService(fastify.db)

  fastify.get(
    '/:postId/comments',
    {
      schema: {
        tags: ['Comments'],
        summary: 'Коментарі до публікації',
        params: z.toJSONSchema(postIdParamSchema, fastifyJsonSchemaOptions),
        response: {
          200: z.toJSONSchema(commentsListSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
    },
    async (request) => {
      const { postId } = request.params as z.infer<typeof postIdParamSchema>
      const items = await commentsService.listByPost(postId)
      return { items }
    },
  )

  fastify.post(
    '/:postId/comments',
    {
      schema: {
        tags: ['Comments'],
        summary: 'Додати коментар',
        security: [{ bearerAuth: [] }],
        params: z.toJSONSchema(postIdParamSchema, fastifyJsonSchemaOptions),
        body: z.toJSONSchema(createCommentSchema, fastifyJsonSchemaOptions),
        response: {
          201: z.toJSONSchema(commentSchema, fastifyJsonSchemaOptions),
          400: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { postId } = request.params as z.infer<typeof postIdParamSchema>
      const body = request.body as CreateCommentInput
      const comment = await commentsService.create(postId, request.user.sub, body)
      return reply.status(201).send(comment)
    },
  )

  fastify.delete(
    '/:postId/comments/:id',
    {
      schema: {
        tags: ['Comments'],
        summary: 'Видалити коментар (автор або ADMIN)',
        security: [{ bearerAuth: [] }],
        params: z.toJSONSchema(postCommentParamsSchema, fastifyJsonSchemaOptions),
        response: {
          204: { type: 'null', description: 'Коментар видалено' },
          401: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          403: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
          404: z.toJSONSchema(errorResponseSchema, fastifyJsonSchemaOptions),
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { postId, id } = request.params as z.infer<typeof postCommentParamsSchema>
      await commentsService.delete(postId, id, {
        id: request.user.sub,
        role: request.user.role,
      })
      return reply.status(204).send()
    },
  )
}
