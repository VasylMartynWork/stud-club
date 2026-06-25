import Fastify from 'fastify'
import { env } from './config/env.js'
import cookiePlugin from './plugins/cookies.js'
import corsPlugin from './plugins/cors.js'
import dbPlugin from './plugins/db.js'
import jwtPlugin from './plugins/jwt.js'
import swaggerPlugin from './plugins/swagger.js'
import swaggerUiPlugin from './plugins/swagger-ui.js'
import { registerRoutes } from './routes/index.js'
import { errorHandler } from './shared/errors/error-handler.js'

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === 'development',
  })

  app.setErrorHandler(errorHandler)

  await app.register(swaggerPlugin)
  await app.register(corsPlugin)
  await app.register(cookiePlugin)
  await app.register(dbPlugin)
  await app.register(jwtPlugin)
  await app.register(registerRoutes)
  await app.register(swaggerUiPlugin)

  return app
}
