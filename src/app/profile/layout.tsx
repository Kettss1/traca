import { auth } from '@/lib/auth'
import { MainNav } from '@/components/layout/main-nav'
import Header from '@/components/landing/header'

// Perfil é público: quem está logado vê a navegação do app, visitante vê o header da landing
export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="bg-cream min-h-screen">
      {session?.user ? <MainNav username={session.user.username} /> : <Header />}
      <main id="main-content">{children}</main>
    </div>
  )
}
