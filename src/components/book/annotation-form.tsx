'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Quotes, NotePencil, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createAnnotation } from '@/lib/actions/book'
import { cn } from '@/lib/utils'

interface AnnotationFormProps {
  userBookId: string
}

export function AnnotationForm({ userBookId }: AnnotationFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'NOTE' | 'QUOTE'>('NOTE')
  const [content, setContent] = useState('')
  const [pageNumber, setPageNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!content.trim()) {
      setError('Escreva algo para salvar')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createAnnotation({
      userBookId,
      type,
      content: content.trim(),
      pageNumber: pageNumber ? parseInt(pageNumber) : undefined,
    })

    setIsSubmitting(false)

    if (result.success) {
      setContent('')
      setPageNumber('')
      setIsOpen(false)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line py-4 text-sm text-text-muted transition-colors hover:border-green-deep/30 hover:text-green-deep"
      >
        <Plus className="h-5 w-5" />
        Adicionar anotação ou citação
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-surface p-4">
      {/* Type selector */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setType('NOTE')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors',
            type === 'NOTE'
              ? 'bg-green-deep text-on-brand'
              : 'bg-cream-dark text-text-muted hover:text-text-dark'
          )}
        >
          <NotePencil className="h-4 w-4" />
          Nota
        </button>
        <button
          type="button"
          onClick={() => setType('QUOTE')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors',
            type === 'QUOTE'
              ? 'bg-terracotta text-on-brand'
              : 'bg-cream-dark text-text-muted hover:text-text-dark'
          )}
        >
          <Quotes className="h-4 w-4" />
          Citação
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            type === 'QUOTE'
              ? 'Digite a citação do livro...'
              : 'Escreva sua anotação...'
          }
          rows={4}
          className={cn(
            'w-full resize-none rounded-lg border px-3 py-2 text-sm transition-colors',
            'border-line text-text-dark placeholder:text-text-muted',
            'focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20'
          )}
        />
      </div>

      {/* Page number */}
      <div className="mb-4">
        <label className="mb-1 block text-xs text-text-muted">
          Página (opcional)
        </label>
        <Input
          type="number"
          min={1}
          value={pageNumber}
          onChange={(e) => setPageNumber(e.target.value)}
          placeholder="Ex: 42"
          className="w-32"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Salvar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false)
            setContent('')
            setPageNumber('')
            setError(null)
          }}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
