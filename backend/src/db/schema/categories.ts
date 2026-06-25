import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
