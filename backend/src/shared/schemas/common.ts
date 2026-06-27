import { z } from 'zod'

export const errorResponseSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  // Can be either Zod fieldErrors map or Fastify/Ajv validation array.
  errors: z.unknown().optional(),
})
