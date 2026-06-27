import { api } from '@/shared/api/client'
import type {
  CreatePostPayload,
  Post,
  PostsListQuery,
  PostsListResponse,
  UpdatePostPayload,
} from '@/shared/api/types'

export const postsApi = {
  list(params: PostsListQuery) {
    return api.get<PostsListResponse>('/posts', { params })
  },

  getById(id: string) {
    return api.get<Post>(`/posts/${id}`)
  },

  create(payload: CreatePostPayload) {
    return api.post<Post>('/posts', payload)
  },

  update(id: string, payload: UpdatePostPayload) {
    return api.patch<Post>(`/posts/${id}`, payload)
  },

  delete(id: string) {
    return api.delete(`/posts/${id}`)
  },
}
