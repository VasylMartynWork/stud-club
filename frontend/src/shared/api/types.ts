export type UserRole = 'STUDENT' | 'ADMIN'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type AuthResponse = {
  accessToken: string
  user: User
}

export type MeResponse = {
  user: User | null
}

export type ApiErrorResponse = {
  message: string
  code?: string
  errors?: unknown
}

export type PostType = 'POST' | 'EVENT'

export type Category = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type PostAuthor = {
  id: string
  name: string
}

export type PostCategory = {
  id: string
  name: string
}

export type Post = {
  id: string
  title: string
  content: string
  imageUrl: string
  type: PostType
  categoryId: string
  authorId: string
  createdAt: string
  updatedAt: string
  author: PostAuthor
  category: PostCategory
  likesCount: number
  likedByMe: boolean
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PostsListResponse = {
  items: Post[]
  pagination: Pagination
}

export type PostsListQuery = {
  search?: string
  categoryId?: string
  type?: PostType
  page?: number
  limit?: number
}

export type CreatePostPayload = {
  title: string
  content: string
  imageUrl: string
  type?: PostType
  categoryId: string
}

export type UpdatePostPayload = Partial<CreatePostPayload>

export type Comment = {
  id: string
  text: string
  postId: string
  userId: string
  createdAt: string
  author: PostAuthor
}

export type LikeStats = {
  likesCount: number
  likedByMe: boolean
}
