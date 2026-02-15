import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ProfileForm } from '@/components/profile/profile-form'
import { ThemeSelector } from '@/components/profile/theme-selector'

export const metadata = {
  title: 'Configurações',
  description: 'Edite seu perfil no Traça',
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      quote: true,
      musicUrl: true,
      socialLinks: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-fraunces mb-8 text-3xl font-bold text-text-dark dark:text-white">
        Configurações
      </h1>

      {/* Theme settings */}
      <div className="mb-8">
        <h2 className="font-fraunces mb-4 text-xl font-semibold text-text-dark dark:text-white">
          Aparência
        </h2>
        <ThemeSelector />
      </div>

      {/* Profile settings */}
      <div>
        <h2 className="font-fraunces mb-4 text-xl font-semibold text-text-dark dark:text-white">
          Perfil
        </h2>
        <ProfileForm user={user} />
      </div>
    </div>
  )
}
