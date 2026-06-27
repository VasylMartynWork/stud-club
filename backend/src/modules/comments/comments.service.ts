import { desc, eq } from 'drizzle-orm'
import type { Database } from '../../db/client.js'
import { comments, posts, users } from '../../db/schema/index.js'
import { ForbiddenError, NotFoundError } from '../../shared/errors/app-error.js'
import type { CreateCommentInput } from './comments.schemas.js'

export class CommentsService {
  constructor(private readonly db: Database) {}

  async listByPost(postId: string) {
    const post = await this.db.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    const rows = await this.db
      .select({
        id: comments.id,
        text: comments.text,
        postId: comments.postId,
        userId: comments.userId,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          name: users.name,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt))

    return rows.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    }))
  }

  async create(postId: string, userId: string, input: CreateCommentInput) {
    const post = await this.db.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    const [comment] = await this.db
      .insert(comments)
      .values({
        text: input.text,
        postId,
        userId,
      })
      .returning()

    const author = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    return {
      id: comment.id,
      text: comment.text,
      postId: comment.postId,
      userId: comment.userId,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: author!.id,
        name: author!.name,
      },
    }
  }

  async delete(
    postId: string,
    commentId: string,
    currentUser: { id: string; role: 'STUDENT' | 'ADMIN' },
  ) {
    const comment = await this.db.query.comments.findFirst({
      where: eq(comments.id, commentId),
    })

    if (!comment || comment.postId !== postId) {
      throw new NotFoundError('Comment not found')
    }

    if (currentUser.role !== 'ADMIN' && comment.userId !== currentUser.id) {
      throw new ForbiddenError()
    }

    await this.db.delete(comments).where(eq(comments.id, commentId))
  }
}
