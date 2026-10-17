import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { TracaLogo } from '@/components/brand/traca-logo'
import { ShelfIllustration } from '@/components/landing/shelf-illustration'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (session?.user) {
    redirect('/shelf')
  }

  return (
    <div className="bg-cream flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-line bg-cream border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link href="/" aria-label="Traça — início">
            <TracaLogo />
          </Link>
        </div>
      </header>

      {/* Conteúdo: formulário + estante ilustrada em telas largas */}
      <main id="main-content" className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 lg:grid-cols-2">
        <div className="mx-auto w-full max-w-md">{children}</div>
        <div className="bg-green-deep hidden h-full max-h-[560px] flex-col justify-between overflow-hidden rounded-3xl p-10 lg:flex">
          <p className="font-fraunces text-on-brand max-w-sm text-3xl leading-tight font-semibold">
            Simples, bonito e feito pra quem lê de verdade.
          </p>
          <ShelfIllustration />
        </div>
      </main>
    </div>
  )
}
