'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash, Quotes, NotePencil } from '@phosphor-icons/react'
import { deleteAnnotation } from '@/lib/actions/book'
import { cn } from '@/lib/utils'

interface AnnotationCardProps {
  id: string
  type: 'NOTE' | 'QUOTE'
  content: string
  pageNumber: number | null
  createdAt: Date
}

export function AnnotationCard({
  id,
  type,
  content,
  pageNumber,
  createdAt,
}: AnnotationCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteAnnotation(id)

    if (result.success) {
      router.refresh()
    } else {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="group rounded-lg bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {type === 'QUOTE' ? (
            <Quotes className="h-4 w-4 text-terracotta" />
          ) : (
            <NotePencil className="h-4 w-4 text-green-deep" />
          )}
          <span className={type === 'QUOTE' ? 'text-terracotta' : 'text-green-deep'}>
            {type === 'QUOTE' ? 'Citação' : 'Nota'}
          </span>
          {pageNumber && <span>• Página {pageNumber}</span>}
          <span>
            •{' '}
            {new Date(createdAt).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {showConfirm ? (
            <>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                {isDeleting ? 'Excluindo...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="rounded px-2 py-1 text-xs text-text-muted hover:bg-cream-dark"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded p-1 text-text-muted hover:bg-red-50 hover:text-red-600"
              title="Excluir"
            >
              <Trash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p
        className={cn(
          'whitespace-pre-wrap text-text-dark',
          type === 'QUOTE' && 'italic'
        )}
      >
        {type === 'QUOTE' && '"'}
        {content}
        {type === 'QUOTE' && '"'}
      </p>
    </div>
  )
}
