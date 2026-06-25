import type { FastifyReply, FastifyRequest } from 'fastify'
import { ForbiddenError } from '../shared/errors/app-error.js'

export function requireRole(...roles: Array<'STUDENT' | 'ADMIN'>) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user || !roles.includes(request.user.role)) {
      throw new ForbiddenError()
    }
  }
}
