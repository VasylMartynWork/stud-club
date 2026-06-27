import { api } from '@/shared/api/client'
import type { Comment } from '@/shared/api/types'

export const commentsApi = {
  listByPost(postId: string) {
    return api.get<{ items: Comment[] }>(`/posts/${postId}/comments`)
  },

  create(postId: string, text: string) {
    return api.post<Comment>(`/posts/${postId}/comments`, { text })
  },

  delete(postId: string, commentId: string) {
    return api.delete(`/posts/${postId}/comments/${commentId}`)
  },
}
