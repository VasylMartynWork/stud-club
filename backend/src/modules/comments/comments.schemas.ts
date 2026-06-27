import { z } from 'zod'

export const commentAuthorSchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

export const commentSchema = z.object({
  id: z.uuid(),
  text: z.string(),
  postId: z.uuid(),
  userId: z.uuid(),
  createdAt: z.string(),
  author: commentAuthorSchema,
})

export const commentsListSchema = z.object({
  items: z.array(commentSchema),
})

export const createCommentSchema = z.object({
  text: z.string().min(1).max(5000),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
