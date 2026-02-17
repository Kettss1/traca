import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getFeedPosts } from '@/lib/services/feed'

const feedSchema = z.object({
  type: z.enum(['home', 'global', 'user']).default('home'),
  cursor: z.string().optional(),
  userId: z.string().optional(),
})

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)

  const parsed = feedSchema.safeParse({
    type: searchParams.get('type') || 'home',
    cursor: searchParams.get('cursor') || undefined,
    userId: searchParams.get('userId') || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const { type, cursor, userId } = parsed.data

  try {
    const result = await getFeedPosts(session.user.id, {
      feedType: type,
      targetUserId: userId,
      cursor,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ error: 'Erro ao carregar feed' }, { status: 500 })
  }
}
