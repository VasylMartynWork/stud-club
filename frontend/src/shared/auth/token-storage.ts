let accessToken: string | null = null

export const tokenStorage = {
  get(): string | null {
    return accessToken
  },
  set(token: string | null) {
    accessToken = token
  },
}
