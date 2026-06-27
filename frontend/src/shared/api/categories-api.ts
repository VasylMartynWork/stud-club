import { api } from '@/shared/api/client'
import type { Category } from '@/shared/api/types'

export const categoriesApi = {
  list() {
    return api.get<{ items: Category[] }>('/categories')
  },

  create(name: string) {
    return api.post<Category>('/categories', { name })
  },

  update(id: string, name: string) {
    return api.patch<Category>(`/categories/${id}`, { name })
  },

  delete(id: string) {
    return api.delete(`/categories/${id}`)
  },
}
