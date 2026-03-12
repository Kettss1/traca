'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash } from '@phosphor-icons/react'
import { track } from '@vercel/analytics'
import { Button } from '@/components/ui/button'
import { removeFromShelf } from '@/lib/actions/book'

interface RemoveFromShelfButtonProps {
  userBookId: string
  bookTitle: string
}

export function RemoveFromShelfButton({ userBookId, bookTitle }: RemoveFromShelfButtonProps) {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRemove() {
    setIsLoading(true)
    setError(null)

    const result = await removeFromShelf(userBookId)

    if (result.success) {
      track('book_removed', { title: bookTitle })
      router.push('/shelf')
    } else {
      setError(result.error)
      setIsLoading(false)
      setIsConfirming(false)
    }
  }

  if (!isConfirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsConfirming(true)}
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        <Trash className="mr-1 h-4 w-4" />
        Remover da estante
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-red-600">
        Tem certeza? Isso removerá o livro, suas anotações e histórico de leitura.
      </p>
      <div className="flex gap-2">
        <Button
          variant="danger"
          size="sm"
          onClick={handleRemove}
          isLoading={isLoading}
        >
          Sim, remover
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsConfirming(false)}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
