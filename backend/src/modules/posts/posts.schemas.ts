import { z } from 'zod'

export const postTypeSchema = z.enum(['POST', 'EVENT'])

export const authorSchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

export const categoryBriefSchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

export const postSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string(),
  type: postTypeSchema,
  categoryId: z.uuid(),
  authorId: z.uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: authorSchema,
  category: categoryBriefSchema,
  likesCount: z.number().int(),
  likedByMe: z.boolean(),
})

export const postsListQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.uuid().optional(),
  type: postTypeSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(6),
})

export const postsListResponseSchema = z.object({
  items: z.array(postSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
})

export const createPostSchema = z.object({
  title: z.string().min(3).max(500),
  content: z.string().min(1),
  imageUrl: z.url().max(2048),
  type: postTypeSchema.optional(),
  categoryId: z.uuid(),
})

export const updatePostSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  content: z.string().min(1).optional(),
  imageUrl: z.url().max(2048).optional(),
  type: postTypeSchema.optional(),
  categoryId: z.uuid().optional(),
})

export type PostsListQuery = z.infer<typeof postsListQuerySchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
