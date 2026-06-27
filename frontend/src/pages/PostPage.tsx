import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CommentSection } from '@/components/CommentSection'
import { LikeButton } from '@/components/LikeButton'
import { Button } from '@/components/ui/Button'
import { postsApi } from '@/shared/api/posts-api'
import type { Post } from '@/shared/api/types'
import { useAuth } from '@/shared/auth/auth-store'
import { formatDate } from '@/shared/utils/format-date'

export function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    const postId = id

    async function loadPost() {
      setIsLoading(true)
      setError(null)

      try {
        const { data } = await postsApi.getById(postId)
        setPost(data)
      } catch {
        setError('Публікацію не знайдено.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadPost()
  }, [id])

  async function handleDelete() {
    if (!post || !window.confirm('Видалити цю публікацію?')) {
      return
    }

    await postsApi.delete(post.id)
    navigate('/blog')
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Завантаження публікації...</p>
  }

  if (error || !post) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">{error ?? 'Публікацію не знайдено.'}</p>
        <Link to="/blog" className="mt-4 inline-block text-slate-900 underline">
          Повернутися до блогу
        </Link>
      </section>
    )
  }

  const canEdit = user?.role === 'ADMIN' || user?.id === post.authorId
  const canDelete = user?.role === 'ADMIN'

  return (
    <article className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <img src={post.imageUrl} alt={post.title} className="max-h-[420px] w-full object-cover" />

        <div className="space-y-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">{post.category.name}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {post.type === 'EVENT' ? 'Подія' : 'Пост'}
            </span>
            <span>{formatDate(post.createdAt)}</span>
          </div>

          <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>

          <p className="text-sm text-slate-500">Автор: {post.author.name}</p>

          <p className="whitespace-pre-wrap text-base leading-7 text-slate-700">{post.content}</p>

          <div className="flex flex-wrap items-center gap-3">
            <LikeButton
              postId={post.id}
              initialLikesCount={post.likesCount}
              initialLikedByMe={post.likedByMe}
              onChange={(likesCount, likedByMe) =>
                setPost((current) => (current ? { ...current, likesCount, likedByMe } : current))
              }
            />

            {canEdit ? (
              <Button variant="secondary" onClick={() => navigate(`/posts/${post.id}/edit`)}>
                Редагувати
              </Button>
            ) : null}

            {canDelete ? (
              <Button variant="danger" onClick={() => void handleDelete()}>
                Видалити
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <CommentSection postId={post.id} />
    </article>
  )
}
