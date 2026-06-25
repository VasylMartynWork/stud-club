import { relations } from 'drizzle-orm'
import { categories } from './categories.js'
import { comments } from './comments.js'
import { likes } from './likes.js'
import { posts } from './posts.js'
import { users } from './users.js'

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
  likes: many(likes),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}))

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}))
