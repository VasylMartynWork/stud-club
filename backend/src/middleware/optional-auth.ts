import type { FastifyReply, FastifyRequest } from 'fastify'

export async function optionalAuth(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify()
    if (request.user.type !== 'access') {
      throw new Error('Invalid token type')
    }
  } catch {
    // Guest access is allowed for public routes.
  }
}
