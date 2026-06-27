import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PostForm } from '@/components/PostForm'
import { postsApi } from '@/shared/api/posts-api'
import type { Post } from '@/shared/api/types'

export function EditPostPage() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    const postId = id

    async function loadPost() {
      try {
        const { data } = await postsApi.getById(postId)
        setPost(data)
      } catch {
        setError('Публікацію не знайдено або немає доступу.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadPost()
  }, [id])

  if (isLoading) {
    return <p className="text-sm text-slate-500">Завантаження...</p>
  }

  if (error || !post || !id) {
    return <p className="text-sm text-red-600">{error ?? 'Помилка завантаження.'}</p>
  }

  return (
    <PostForm
      mode="edit"
      postId={id}
      initialValues={{
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl,
        type: post.type,
        categoryId: post.categoryId,
      }}
    />
  )
}
