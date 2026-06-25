import { pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { categories } from './categories.js'
import { users } from './users.js'

export const postTypeEnum = pgEnum('post_type', ['POST', 'EVENT'])

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  imageUrl: varchar('image_url', { length: 2048 }).notNull(),
  type: postTypeEnum('type').notNull().default('POST'),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
