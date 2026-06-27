import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from 'drizzle-orm'
import type { Database } from '../../db/client.js'
import { categories, likes, posts, users } from '../../db/schema/index.js'
import { ForbiddenError, NotFoundError } from '../../shared/errors/app-error.js'
import { buildPaginationMeta, resolvePagination } from '../../shared/utils/pagination.js'
import type { CreatePostInput, PostsListQuery, UpdatePostInput } from './posts.schemas.js'

type PostRow = {
  id: string
  title: string
  content: string
  imageUrl: string
  type: 'POST' | 'EVENT'
  categoryId: string
  authorId: string
  createdAt: Date
  updatedAt: Date
  author: { id: string; name: string }
  category: { id: string; name: string }
}

export class PostsService {
  constructor(private readonly db: Database) {}

  private buildWhere(query: PostsListQuery): SQL | undefined {
    const conditions: SQL[] = []

    if (query.search) {
      const pattern = `%${query.search}%`
      conditions.push(or(ilike(posts.title, pattern), ilike(posts.content, pattern))!)
    }

    if (query.categoryId) {
      conditions.push(eq(posts.categoryId, query.categoryId))
    }

    if (query.type) {
      conditions.push(eq(posts.type, query.type))
    }

    return conditions.length > 0 ? and(...conditions) : undefined
  }

  private async enrichPosts(postRows: PostRow[], currentUserId?: string) {
    if (postRows.length === 0) {
      return []
    }

    const postIds = postRows.map((post) => post.id)

    const [likeCounts, userLikes] = await Promise.all([
      this.db
        .select({ postId: likes.postId, likesCount: count() })
        .from(likes)
        .where(inArray(likes.postId, postIds))
        .groupBy(likes.postId),
      currentUserId
        ? this.db
            .select({ postId: likes.postId })
            .from(likes)
            .where(and(inArray(likes.postId, postIds), eq(likes.userId, currentUserId)))
        : Promise.resolve([]),
    ])

    const likesCountMap = new Map(likeCounts.map((row) => [row.postId, Number(row.likesCount)]))
    const likedPostIds = new Set(userLikes.map((row) => row.postId))

    return postRows.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      type: post.type,
      categoryId: post.categoryId,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      category: post.category,
      likesCount: likesCountMap.get(post.id) ?? 0,
      likedByMe: likedPostIds.has(post.id),
    }))
  }

  private async fetchPostRow(postId: string): Promise<PostRow | null> {
    const [post] = await this.db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        imageUrl: posts.imageUrl,
        type: posts.type,
        categoryId: posts.categoryId,
        authorId: posts.authorId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.id, postId))
      .limit(1)

    return post ?? null
  }

  async list(query: PostsListQuery, currentUserId?: string) {
    const { page, limit, offset } = resolvePagination(query)
    const where = this.buildWhere(query)

    const [rows, totalResult] = await Promise.all([
      this.db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          imageUrl: posts.imageUrl,
          type: posts.type,
          categoryId: posts.categoryId,
          authorId: posts.authorId,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          author: {
            id: users.id,
            name: users.name,
          },
          category: {
            id: categories.id,
            name: categories.name,
          },
        })
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .innerJoin(categories, eq(posts.categoryId, categories.id))
        .where(where)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(posts).where(where),
    ])

    const total = Number(totalResult[0]?.total ?? 0)
    const items = await this.enrichPosts(rows, currentUserId)

    return {
      items,
      pagination: buildPaginationMeta(page, limit, total),
    }
  }

  async getById(postId: string, currentUserId?: string) {
    const post = await this.fetchPostRow(postId)

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    const [enriched] = await this.enrichPosts([post], currentUserId)
    return enriched
  }

  async create(
    input: CreatePostInput,
    authorId: string,
    role: 'STUDENT' | 'ADMIN',
  ) {
    const postType = input.type ?? 'POST'

    if (postType === 'EVENT' && role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can create event posts')
    }

    const category = await this.db.query.categories.findFirst({
      where: eq(categories.id, input.categoryId),
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    const [created] = await this.db
      .insert(posts)
      .values({
        title: input.title,
        content: input.content,
        imageUrl: input.imageUrl,
        type: postType,
        categoryId: input.categoryId,
        authorId,
      })
      .returning()

    return this.getById(created.id, authorId)
  }

  async update(
    postId: string,
    input: UpdatePostInput,
    currentUser: { id: string; role: 'STUDENT' | 'ADMIN' },
  ) {
    const post = await this.db.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    if (currentUser.role !== 'ADMIN' && post.authorId !== currentUser.id) {
      throw new ForbiddenError()
    }

    if (input.type !== undefined) {
      const nextType = input.type

      if (nextType === 'EVENT' && currentUser.role !== 'ADMIN') {
        throw new ForbiddenError('Only admins can create event posts')
      }

      if (post.type === 'EVENT' && nextType !== 'EVENT' && currentUser.role !== 'ADMIN') {
        throw new ForbiddenError('Only admins can change event post type')
      }
    }

    if (input.categoryId) {
      const category = await this.db.query.categories.findFirst({
        where: eq(categories.id, input.categoryId),
      })

      if (!category) {
        throw new NotFoundError('Category not found')
      }
    }

    const updateData: Partial<{
      title: string
      content: string
      imageUrl: string
      type: 'POST' | 'EVENT'
      categoryId: string
      updatedAt: Date
    }> = {
      updatedAt: new Date(),
    }

    if (input.title !== undefined) updateData.title = input.title
    if (input.content !== undefined) updateData.content = input.content
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl
    if (input.type !== undefined) updateData.type = input.type
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId

    await this.db.update(posts).set(updateData).where(eq(posts.id, postId))

    return this.getById(postId, currentUser.id)
  }

  async delete(postId: string) {
    const post = await this.db.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    await this.db.delete(posts).where(eq(posts.id, postId))
  }
}
