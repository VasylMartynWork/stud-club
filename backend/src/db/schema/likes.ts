import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { posts } from './posts.js'
import { users } from './users.js'

export const likes = pgTable(
  'likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('likes_user_post_unique').on(table.userId, table.postId)],
)

export type Like = typeof likes.$inferSelect
export type NewLike = typeof likes.$inferInsert
