import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { env } from '../../config/env.js'
import type { Database } from '../../db/client.js'
import { users, type User } from '../../db/schema/index.js'
import { ConflictError, UnauthorizedError } from '../../shared/errors/app-error.js'
import { hashPassword, verifyPassword } from '../../shared/utils/password.js'
import { parseDurationToMs } from '../../shared/utils/token.js'
import type { LoginInput, RegisterInput } from './auth.schemas.js'

const REFRESH_COOKIE_NAME = 'refreshToken'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: User['role']
}

export type AuthResult = {
  accessToken: string
  user: AuthUser
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

function getRefreshCookieMaxAge(): number {
  return Math.floor(parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN) / 1000)
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: getRefreshCookieMaxAge(),
  }
}

export function getRefreshCookieName() {
  return REFRESH_COOKIE_NAME
}

export class AuthService {
  constructor(
    private readonly db: Database,
    private readonly fastify: FastifyInstance,
  ) {}

  private async issueAccessToken(user: User): Promise<string> {
    return this.fastify.jwt.sign({
      sub: user.id,
      role: user.role,
      type: 'access',
    })
  }

  private async issueRefreshToken(user: User): Promise<string> {
    return this.fastify.jwt.sign(
      {
        sub: user.id,
        role: user.role,
        type: 'refresh',
      },
      {
        key: env.JWT_REFRESH_SECRET,
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      },
    )
  }

  async register(input: RegisterInput): Promise<{ result: AuthResult; refreshToken: string }> {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    })

    if (existing) {
      throw new ConflictError('Email is already registered')
    }

    const passwordHash = await hashPassword(input.password)

    const [user] = await this.db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        passwordHash,
      })
      .returning()

    const accessToken = await this.issueAccessToken(user)
    const refreshToken = await this.issueRefreshToken(user)

    return {
      result: {
        accessToken,
        user: toAuthUser(user),
      },
      refreshToken,
    }
  }

  async login(input: LoginInput): Promise<{ result: AuthResult; refreshToken: string }> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    })

    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const isValidPassword = await verifyPassword(input.password, user.passwordHash)
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const accessToken = await this.issueAccessToken(user)
    const refreshToken = await this.issueRefreshToken(user)

    return {
      result: {
        accessToken,
        user: toAuthUser(user),
      },
      refreshToken,
    }
  }

  async refresh(refreshToken: string | undefined): Promise<{ result: AuthResult; refreshToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is missing')
    }

    let payload: { sub: string; role: User['role']; type: string }

    try {
      payload = await this.fastify.jwt.verify(refreshToken, {
        key: env.JWT_REFRESH_SECRET,
      })
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    })

    if (!user) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    const accessToken = await this.issueAccessToken(user)
    const newRefreshToken = await this.issueRefreshToken(user)

    return {
      result: {
        accessToken,
        user: toAuthUser(user),
      },
      refreshToken: newRefreshToken,
    }
  }
}
