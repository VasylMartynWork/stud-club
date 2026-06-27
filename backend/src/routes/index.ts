import type { FastifyInstance } from 'fastify'
import { authRoutes } from '../modules/auth/auth.routes.js'
import { categoriesRoutes } from '../modules/categories/categories.routes.js'
import { postCommentsRoutes } from '../modules/comments/comments.routes.js'
import { healthRoutes } from '../modules/health/health.routes.js'
import { likesRoutes } from '../modules/likes/likes.routes.js'
import { postsRoutes } from '../modules/posts/posts.routes.js'

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes, { prefix: '/api/health' })
  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(categoriesRoutes, { prefix: '/api/categories' })
  await fastify.register(postsRoutes, { prefix: '/api/posts' })
  await fastify.register(postCommentsRoutes, { prefix: '/api/posts' })
  await fastify.register(likesRoutes, { prefix: '/api/posts' })
}
