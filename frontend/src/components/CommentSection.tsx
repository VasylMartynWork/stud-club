import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { commentsApi } from '@/shared/api/comments-api'
import type { Comment } from '@/shared/api/types'
import { useAuth } from '@/shared/auth/auth-store'
import { formatDate } from '@/shared/utils/format-date'

type CommentSectionProps = {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadComments() {
    setIsLoading(true)
    try {
      const { data } = await commentsApi.listByPost(postId)
      setComments(data.items)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadComments()
  }, [postId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!text.trim()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { data } = await commentsApi.create(postId, text.trim())
      setComments((prev) => [data, ...prev])
      setText('')
    } catch {
      setError('Не вдалося додати коментар.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(comment: Comment) {
    if (!window.confirm('Видалити цей коментар?')) {
      return
    }

    await commentsApi.delete(postId, comment.id)
    setComments((prev) => prev.filter((item) => item.id !== comment.id))
  }

  function canDeleteComment(comment: Comment) {
    if (!user) {
      return false
    }

    return user.role === 'ADMIN' || user.id === comment.userId
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Коментарі</h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Напишіть коментар..."
            rows={4}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Надсилання...' : 'Додати коментар'}
          </Button>
        </form>
      ) : (
        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Щоб залишити коментар,{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            увійдіть
          </Link>
          .
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Завантаження коментарів...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-500">Коментарів ще немає.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{comment.author.name}</p>
                  <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                </div>
                {canDeleteComment(comment) ? (
                  <button
                    type="button"
                    onClick={() => void handleDelete(comment)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Видалити
                  </button>
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{comment.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
