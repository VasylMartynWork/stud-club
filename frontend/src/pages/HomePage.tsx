import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PostCard } from '@/components/PostCard'
import { postsApi } from '@/shared/api/posts-api'
import type { Post } from '@/shared/api/types'
import { useAuth } from '@/shared/auth/auth-store'

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const [events, setEvents] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data } = await postsApi.list({ type: 'EVENT', limit: 3, page: 1 })
        setEvents(data.items)
      } finally {
        setIsLoading(false)
      }
    }

    void loadEvents()
  }, [])

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 px-6 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Студентський клуб</p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold sm:text-5xl">
          Місце, де студенти діляться досвідом, ідеями та подіями
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-200 sm:text-base">
          Читайте новини клубу, долучайтесь до обговорень і слідкуйте за найближчими подіями.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/blog"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            Перейти до блогу
          </Link>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="rounded-md border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Приєднатися
            </Link>
          ) : null}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Найближчі події</h2>
          <Link to="/blog?filter=events" className="text-sm font-medium text-slate-700 underline">
            Усі події
          </Link>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-500">Завантаження подій...</p>
        ) : events.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Поки що немає запланованих подій.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <PostCard key={event.id} post={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
