import fjwt from '@fastify/jwt'
import fp from 'fastify-plugin'
import { env } from '../config/env.js'
import { UnauthorizedError } from '../shared/errors/app-error.js'

export default fp(async (fastify) => {
  await fastify.register(fjwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    },
  })

  fastify.decorate('authenticate', async (request, _reply) => {
    try {
      await request.jwtVerify()
      if (request.user.type !== 'access') {
        throw new UnauthorizedError()
      }
    } catch {
      throw new UnauthorizedError()
    }
  })
})
