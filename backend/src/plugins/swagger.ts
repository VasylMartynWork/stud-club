import swagger from '@fastify/swagger'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Stud Club API',
        description: 'API студентського клубу з блогом, подіями та коментарями',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local development',
        },
      ],
      tags: [
        { name: 'Auth', description: 'Автентифікація та сесії' },
        { name: 'Health', description: 'Перевірка стану сервісу' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Access token у заголовку Authorization',
          },
        },
      },
    },
  })
})
