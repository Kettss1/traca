import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { MainNav } from '@/components/layout/main-nav'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="bg-cream min-h-screen">
      <MainNav username={session.user.username} />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
