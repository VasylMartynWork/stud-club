import { z } from 'zod'

export const errorResponseSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
})
