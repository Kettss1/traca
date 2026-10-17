import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { LandingPage } from '@/components/landing/landing-page'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect('/shelf')
  }

  return <LandingPage />
}
