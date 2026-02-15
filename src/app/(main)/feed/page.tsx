import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getFeedPosts } from '@/lib/services/feed'
import { FeedContent } from '@/components/social/feed-content'

export const metadata = {
  title: 'Feed',
  description: 'Acompanhe o que seus amigos estão lendo',
}

export default async function FeedPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { posts } = await getFeedPosts(session.user.id, {
    feedType: 'home',
  })

  return <FeedContent initialPosts={posts} userId={session.user.id} />
}
