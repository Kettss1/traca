import Link from 'next/link'
import { TracaLogo } from '@/components/brand/traca-logo'

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
      <Link href="/" aria-label="Traça — início">
        <TracaLogo />
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/login"
          className="text-text-dark hover:bg-cream-dark rounded-lg px-3 py-2 font-medium transition-colors"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="bg-green-deep text-on-brand hidden rounded-lg px-4 py-2 font-medium transition-opacity hover:opacity-90 sm:block"
        >
          Criar conta
        </Link>
      </nav>
    </header>
  )
}
