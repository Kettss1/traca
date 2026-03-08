'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PaperPlaneRight, Trash } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { submitComment, removeComment, getPostCommentsAction } from '@/lib/actions/social'
import { Input } from '@/components/ui/input'

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    username: string | null
    name: string | null
    avatarUrl: string | null
  }
}

interface CommentSectionProps {
  postId: string
  currentUserId?: string
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadComments() {
      try {
        const data = await getPostCommentsAction(postId)
        setComments(data)
      } catch (error) {
        console.error('Error loading comments:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadComments()
  }, [postId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const result = await submitComment(postId, newComment)

    if (result.success && result.comment) {
      setComments([...comments, result.comment])
      setNewComment('')
    }

    setIsSubmitting(false)
  }

  async function handleDelete(commentId: string) {
    const result = await removeComment(commentId)
    if (result.success) {
      setComments(comments.filter((c) => c.id !== commentId))
    }
  }

  return (
    <div className="mt-4 border-t border-cream-dark/60 pt-4">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="flex-1"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-deep text-cream transition-colors hover:bg-green-light disabled:opacity-40"
        >
          <PaperPlaneRight className="h-4 w-4" />
        </button>
      </form>

      {/* Comments list */}
      <div className="mt-3 space-y-2.5">
        {isLoading ? (
          <p className="py-2 text-center text-sm text-text-muted">Carregando...</p>
        ) : comments.length === 0 ? (
          <p className="py-2 text-center text-sm text-text-muted">
            Nenhum comentário ainda
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Link href={`/profile/${comment.user.username}`} className="shrink-0">
                {comment.user.avatarUrl ? (
                  <Image
                    src={comment.user.avatarUrl}
                    alt={comment.user.name || comment.user.username || 'Avatar'}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-deep/10 text-xs font-medium text-green-deep">
                    {(comment.user.name || comment.user.username || 'U')[0].toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="min-w-0 flex-1 rounded-xl bg-cream-dark/30 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/profile/${comment.user.username}`}
                    className="truncate text-sm font-medium text-text-dark hover:text-green-deep"
                  >
                    {comment.user.name || comment.user.username}
                  </Link>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[11px] text-text-muted">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                    {currentUserId === comment.user.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="rounded p-0.5 text-text-muted/60 transition-colors hover:text-terracotta"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-0.5 text-sm text-text-dark">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
