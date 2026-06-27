import { z } from 'zod'

export const idParamSchema = z.object({
  id: z.uuid(),
})

export const postIdParamSchema = z.object({
  postId: z.uuid(),
})

export const postCommentParamsSchema = z.object({
  postId: z.uuid(),
  id: z.uuid(),
})
