import { api } from '@/shared/api/client'
import type { Category } from '@/shared/api/types'

export const categoriesApi = {
  list() {
    return api.get<{ items: Category[] }>('/categories')
  },
}
