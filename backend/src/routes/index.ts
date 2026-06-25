import type { FastifyInstance } from 'fastify'
import { authRoutes } from '../modules/auth/auth.routes.js'
import { healthRoutes } from '../modules/health/health.routes.js'

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes, { prefix: '/api/health' })
  await fastify.register(authRoutes, { prefix: '/api/auth' })
}
