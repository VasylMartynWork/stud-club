import { and, count, eq } from 'drizzle-orm'
import type { Database } from '../../db/client.js'
import { likes, posts } from '../../db/schema/index.js'
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js'

export class LikesService {
  constructor(private readonly db: Database) {}

  private async getLikeStats(postId: string, userId?: string) {
    const [likesCountResult, userLike] = await Promise.all([
      this.db.select({ likesCount: count() }).from(likes).where(eq(likes.postId, postId)),
      userId
        ? this.db.query.likes.findFirst({
            where: and(eq(likes.postId, postId), eq(likes.userId, userId)),
          })
        : Promise.resolve(null),
    ])

    return {
      likesCount: Number(likesCountResult[0]?.likesCount ?? 0),
      likedByMe: Boolean(userLike),
    }
  }

  async like(postId: string, userId: string) {
    const post = await this.db.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    const existing = await this.db.query.likes.findFirst({
      where: and(eq(likes.postId, postId), eq(likes.userId, userId)),
    })

    if (existing) {
      throw new ConflictError('Post is already liked')
    }

    await this.db.insert(likes).values({ postId, userId })

    return this.getLikeStats(postId, userId)
  }

  async unlike(postId: string, userId: string) {
    const post = await this.db.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    const existing = await this.db.query.likes.findFirst({
      where: and(eq(likes.postId, postId), eq(likes.userId, userId)),
    })

    if (!existing) {
      throw new NotFoundError('Like not found')
    }

    await this.db.delete(likes).where(eq(likes.id, existing.id))

    return this.getLikeStats(postId, userId)
  }
}
