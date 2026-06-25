import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { posts } from './posts.js'
import { users } from './users.js'

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: text('text').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
