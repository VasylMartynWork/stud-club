import { z } from 'zod'

export const likeStatsSchema = z.object({
  likesCount: z.number().int(),
  likedByMe: z.boolean(),
})
