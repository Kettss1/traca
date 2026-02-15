import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getFeedPosts } from '@/lib/services/feed'

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as 'home' | 'global' | 'user' || 'home'
  const cursor = searchParams.get('cursor') || undefined
  const targetUserId = searchParams.get('userId') || undefined

  try {
    const result = await getFeedPosts(session.user.id, {
      feedType: type,
      targetUserId,
      cursor,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ error: 'Erro ao carregar feed' }, { status: 500 })
  }
}
