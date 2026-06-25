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
    refreshJwtSign: (payload: JwtPayload) => Promise<string>
    refreshJwtVerify: <T = JwtPayload>(token: string) => Promise<T>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string
      role: 'STUDENT' | 'ADMIN'
      type: 'access'
    }
    user: {
      sub: string
      role: 'STUDENT' | 'ADMIN'
      type: 'access'
    }
  }
}

export {}
