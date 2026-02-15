import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { BookOpen } from '@phosphor-icons/react/dist/ssr'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (session?.user) {
    redirect('/shelf')
  }

  return (
    <div className="bg-cream flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-brown/10 bg-cream border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-green-deep flex h-9 w-9 items-center justify-center rounded-lg">
              <BookOpen className="text-cream h-5 w-5" weight="fill" />
            </div>
            <span className="font-fraunces text-green-deep text-xl font-semibold">Traça</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
