import Link from 'next/link'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-full bg-cream-dark p-4">
        <MagnifyingGlass className="h-12 w-12 text-text-muted" />
      </div>
      <h1 className="font-fraunces mb-2 text-2xl font-bold text-text-dark">
        Página não encontrada
      </h1>
      <p className="mb-6 max-w-md text-text-muted">
        A página que você está procurando não existe ou foi movida.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-green-deep px-6 py-2 font-medium text-white transition-colors hover:bg-green-deep/90"
        >
          Página inicial
        </Link>
        <Link
          href="/shelf"
          className="rounded-lg border border-line px-6 py-2 font-medium text-text-dark transition-colors hover:bg-cream-dark"
        >
          Minha estante
        </Link>
      </div>
    </div>
  )
}
