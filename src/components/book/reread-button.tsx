'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { createReread } from '@/lib/actions/book'

interface RereadButtonProps {
  userBookId: string
}

export function RereadButton({ userBookId }: RereadButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReread() {
    setIsLoading(true)
    setError(null)

    const result = await createReread(userBookId)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleReread}
        isLoading={isLoading}
      >
        <ArrowClockwise className="mr-1 h-4 w-4" />
        Ler de Novo
      </Button>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
