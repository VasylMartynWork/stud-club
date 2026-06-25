import { sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { fastifyJsonSchemaOptions } from '../../shared/schemas/json-schema-options.js'
import { healthResponseSchema } from './health.schemas.js'

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health-check',
        response: {
          200: z.toJSONSchema(healthResponseSchema, fastifyJsonSchemaOptions),
        },
      },
    },
    async () => {
      await fastify.db.execute(sql`select 1`)

      return {
        status: 'ok' as const,
        timestamp: new Date().toISOString(),
      }
    },
  )
}
