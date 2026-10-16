'use client'

import { useEffect } from 'react'
import { Warning } from '@phosphor-icons/react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-full bg-terracotta/10 p-4">
        <Warning className="h-12 w-12 text-terracotta" />
      </div>
      <h1 className="font-fraunces mb-2 text-2xl font-bold text-text-dark">
        Algo deu errado
      </h1>
      <p className="mb-6 max-w-md text-text-muted">
        Desculpe, ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-green-deep px-6 py-2 font-medium text-white transition-colors hover:bg-green-deep/90"
        >
          Tentar novamente
        </button>
        <a
          href="/"
          className="rounded-lg border border-line px-6 py-2 font-medium text-text-dark transition-colors hover:bg-cream-dark"
        >
          Página inicial
        </a>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-text-muted">Código do erro: {error.digest}</p>
      )}
    </div>
  )
}
