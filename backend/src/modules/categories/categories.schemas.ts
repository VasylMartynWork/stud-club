import { z } from 'zod'

export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const categoriesListSchema = z.object({
  items: z.array(categorySchema),
})

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
})

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
