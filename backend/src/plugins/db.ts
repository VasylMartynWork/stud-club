import fp from 'fastify-plugin'
import { db } from '../db/client.js'

export default fp(async (fastify) => {
  fastify.decorate('db', db)
})
