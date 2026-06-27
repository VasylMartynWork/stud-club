import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { categoriesApi } from '@/shared/api/categories-api'
import { postsApi } from '@/shared/api/posts-api'
import type { Category, PostType } from '@/shared/api/types'
import { useAuth } from '@/shared/auth/auth-store'

type PostFormProps = {
  mode: 'create' | 'edit'
  postId?: string
  initialValues?: {
    title: string
    content: string
    imageUrl: string
    type: PostType
    categoryId: string
  }
}

export function PostForm({ mode, postId, initialValues }: PostFormProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '')
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? '')
  const [type, setType] = useState<PostType>(initialValues?.type ?? 'POST')
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      const { data } = await categoriesApi.list()
      setCategories(data.items)
      setCategoryId((current) => current || data.items[0]?.id || '')
    }

    void loadCategories()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const payload = {
        title,
        content,
        imageUrl,
        categoryId,
        ...(isAdmin ? { type } : mode === 'create' ? { type: 'POST' as const } : {}),
      }

      if (mode === 'create') {
        const { data } = await postsApi.create(payload)
        navigate(`/posts/${data.id}`)
        return
      }

      if (!postId) {
        throw new Error('Post id is required')
      }

      const { data } = await postsApi.update(postId, payload)
      navigate(`/posts/${data.id}`)
    } catch {
      setError('Не вдалося зберегти публікацію.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold">
        {mode === 'create' ? 'Створити публікацію' : 'Редагувати публікацію'}
      </h1>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1">
          <span className="text-sm text-slate-600">Заголовок</span>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-600">Текст</span>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={8}
            required
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-600">Посилання на зображення</span>
          <Input
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            required
          />
        </label>

        <div className={`grid gap-4 ${isAdmin ? 'sm:grid-cols-2' : ''}`}>
          {isAdmin ? (
            <label className="block space-y-1">
              <span className="text-sm text-slate-600">Тип</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as PostType)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="POST">Пост</option>
                <option value="EVENT">Подія</option>
              </select>
            </label>
          ) : null}

          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Категорія</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Збереження...' : 'Зберегти'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Скасувати
          </Button>
        </div>
      </form>
    </section>
  )
}
