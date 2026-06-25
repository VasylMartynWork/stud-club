import swaggerUi from '@fastify/swagger-ui'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
  })
})
