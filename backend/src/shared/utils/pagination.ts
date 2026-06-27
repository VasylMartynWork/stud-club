export type PaginationInput = {
  page?: number
  limit?: number
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function resolvePagination(input: PaginationInput, defaultLimit = 6) {
  const page = Math.max(1, input.page ?? 1)
  const limit = Math.min(50, Math.max(1, input.limit ?? defaultLimit))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}
