import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from './app-error.js'

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
      code: error.code,
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: error.flatten().fieldErrors,
    })
  }

  if ('validation' in error && error.validation) {
    return reply.status(400).send({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: error.validation,
    })
  }

  console.error(error)

  return reply.status(500).send({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  })
}
