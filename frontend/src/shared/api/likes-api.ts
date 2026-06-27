import { api } from '@/shared/api/client'
import type { LikeStats } from '@/shared/api/types'

export const likesApi = {
  like(postId: string) {
    return api.post<LikeStats>(`/posts/${postId}/likes`)
  },

  unlike(postId: string) {
    return api.delete<LikeStats>(`/posts/${postId}/likes`)
  },
}
