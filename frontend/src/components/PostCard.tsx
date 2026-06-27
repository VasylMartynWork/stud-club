import { Link } from 'react-router-dom'
import type { Post } from '@/shared/api/types'
import { formatDate } from '@/shared/utils/format-date'

type PostCardProps = {
  post: Post
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export function PostCard({
  post,
  showActions = false,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}: PostCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/posts/${post.id}`}>
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-44 w-full object-cover sm:h-52"
          loading="lazy"
        />
      </Link>

      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1">{post.category.name}</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">
            {post.type === 'EVENT' ? 'Подія' : 'Пост'}
          </span>
          <span>{formatDate(post.createdAt)}</span>
        </div>

        <Link to={`/posts/${post.id}`} className="block">
          <h2 className="text-lg font-semibold text-slate-900 hover:underline sm:text-xl">{post.title}</h2>
        </Link>

        <p className="line-clamp-3 text-sm text-slate-600">{post.content}</p>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <span>{post.author.name}</span>
          <span>{post.likesCount} лайків</span>
        </div>

        {showActions && (canEdit || canDelete) ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {canEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
              >
                Редагувати
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Видалити
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
