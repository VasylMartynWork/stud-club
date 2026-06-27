import { useAuth } from '@/shared/auth/auth-store'
import { likesApi } from '@/shared/api/likes-api'
import { useState } from 'react'

type LikeButtonProps = {
  postId: string
  initialLikesCount: number
  initialLikedByMe: boolean
  onChange?: (likesCount: number, likedByMe: boolean) => void
}

export function LikeButton({
  postId,
  initialLikesCount,
  initialLikedByMe,
  onChange,
}: LikeButtonProps) {
  const { isAuthenticated } = useAuth()
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [likedByMe, setLikedByMe] = useState(initialLikedByMe)
  const [isLoading, setIsLoading] = useState(false)

  async function toggleLike() {
    if (!isAuthenticated) {
      return
    }

    setIsLoading(true)

    try {
      const response = likedByMe
        ? await likesApi.unlike(postId)
        : await likesApi.like(postId)

      setLikesCount(response.data.likesCount)
      setLikedByMe(response.data.likedByMe)
      onChange?.(response.data.likesCount, response.data.likedByMe)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={!isAuthenticated || isLoading}
      onClick={() => void toggleLike()}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        likedByMe
          ? 'border-red-200 bg-red-50 text-red-600'
          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
      } disabled:cursor-not-allowed disabled:opacity-60`}
      title={isAuthenticated ? undefined : 'Увійдіть, щоб поставити лайк'}
    >
      <span aria-hidden="true">{likedByMe ? '♥' : '♡'}</span>
      <span>{likesCount}</span>
    </button>
  )
}
