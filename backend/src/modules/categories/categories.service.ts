import { asc, count, eq } from 'drizzle-orm'
import type { Database } from '../../db/client.js'
import { categories, posts } from '../../db/schema/index.js'
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js'
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.schemas.js'

export class CategoriesService {
  constructor(private readonly db: Database) {}

  async list() {
    return this.db.query.categories.findMany({
      orderBy: [asc(categories.name)],
    })
  }

  async create(input: CreateCategoryInput) {
    const existing = await this.db.query.categories.findFirst({
      where: eq(categories.name, input.name),
    })

    if (existing) {
      throw new ConflictError('Category with this name already exists')
    }

    const [category] = await this.db
      .insert(categories)
      .values({ name: input.name })
      .returning()

    return category
  }

  async update(id: string, input: UpdateCategoryInput) {
    const category = await this.db.query.categories.findFirst({
      where: eq(categories.id, id),
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    const duplicate = await this.db.query.categories.findFirst({
      where: eq(categories.name, input.name),
    })

    if (duplicate && duplicate.id !== id) {
      throw new ConflictError('Category with this name already exists')
    }

    const [updated] = await this.db
      .update(categories)
      .set({ name: input.name, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning()

    return updated
  }

  async delete(id: string) {
    const category = await this.db.query.categories.findFirst({
      where: eq(categories.id, id),
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    const [postsCountResult] = await this.db
      .select({ total: count() })
      .from(posts)
      .where(eq(posts.categoryId, id))

    if (Number(postsCountResult?.total ?? 0) > 0) {
      throw new ConflictError('Cannot delete category with existing posts')
    }

    await this.db.delete(categories).where(eq(categories.id, id))
  }
}
