import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PostCard } from '@/components/PostCard'
import { Pagination } from '@/components/Pagination'
import { Input } from '@/components/ui/Input'
import { categoriesApi } from '@/shared/api/categories-api'
import { postsApi } from '@/shared/api/posts-api'
import type { Category, Post, PostType } from '@/shared/api/types'
import { useAuth } from '@/shared/auth/auth-store'
import { debounce } from '@/shared/utils/debounce'

const EVENTS_FILTER = 'events'

export function BlogPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 })
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const [isLoading, setIsLoading] = useState(true)

  const page = Number(searchParams.get('page') ?? '1')
  const filter = searchParams.get('filter') ?? 'all'
  const search = searchParams.get('search') ?? ''

  const queryType: PostType | undefined = filter === EVENTS_FILTER ? 'EVENT' : 'POST'
  const categoryId = filter !== 'all' && filter !== EVENTS_FILTER ? filter : undefined

  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await postsApi.list({
        search: search || undefined,
        categoryId,
        type: queryType,
        page,
        limit: 6,
      })
      setPosts(data.items)
      setPagination(data.pagination)
    } finally {
      setIsLoading(false)
    }
  }, [search, categoryId, queryType, page])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  useEffect(() => {
    async function loadCategories() {
      const { data } = await categoriesApi.list()
      setCategories(data.items)
    }

    void loadCategories()
  }, [])

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        const next = new URLSearchParams(searchParams)
        if (value) {
          next.set('search', value)
        } else {
          next.delete('search')
        }
        next.set('page', '1')
        setSearchParams(next)
      }, 300),
    [searchParams, setSearchParams],
  )

  function updateFilter(nextFilter: string) {
    const next = new URLSearchParams(searchParams)
    next.set('filter', nextFilter)
    next.set('page', '1')
    setSearchParams(next)
  }

  function updatePage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  async function handleDelete(post: Post) {
    if (!window.confirm('Видалити цю публікацію?')) {
      return
    }

    await postsApi.delete(post.id)
    void loadPosts()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Блог</h1>
          <p className="mt-2 text-sm text-slate-600">
            Новини, статті та звіти студентського клубу.
          </p>
        </div>

        {user ? (
          <Link
            to="/posts/new"
            className="inline-flex justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Створити публікацію
          </Link>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <Input
          value={searchInput}
          onChange={(event) => {
            const value = event.target.value
            setSearchInput(value)
            debouncedSearch(value)
          }}
          placeholder="Пошук за заголовком або текстом..."
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => updateFilter('all')}>
            Усі
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              active={filter === category.id}
              onClick={() => updateFilter(category.id)}
            >
              {category.name}
            </FilterChip>
          ))}
          <FilterChip
            active={filter === EVENTS_FILTER}
            onClick={() => updateFilter(EVENTS_FILTER)}
          >
            Події
          </FilterChip>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Завантаження публікацій...</p>
      ) : posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Нічого не знайдено.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              showActions
              canEdit={user?.role === 'ADMIN' || user?.id === post.authorId}
              canDelete={user?.role === 'ADMIN'}
              onEdit={() => navigate(`/posts/${post.id}/edit`)}
              onDelete={() => void handleDelete(post)}
            />
          ))}
        </div>
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={updatePage}
      />
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
        active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )
}
