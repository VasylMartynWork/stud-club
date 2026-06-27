import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Database } from '../db/client.js'

type JwtPayload = {
  sub: string
  role: 'STUDENT' | 'ADMIN'
  type: 'access' | 'refresh'
}

declare module 'fastify' {
  interface FastifyInstance {
    db: Database
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string
      role: 'STUDENT' | 'ADMIN'
      type: 'access' | 'refresh'
    }
    user: {
      sub: string
      role: 'STUDENT' | 'ADMIN'
      type: 'access' | 'refresh'
    }
  }
}

export {}
