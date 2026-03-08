import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { searchBooks as searchGoogleBooks } from '@/lib/api/google-books'
import { searchBooks as searchOpenLibrary } from '@/lib/api/open-library'

const searchSchema = z.object({
  q: z.string().min(1).max(200),
  mode: z.enum(['title', 'author']).default('title'),
})

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)

  const parsed = searchSchema.safeParse({
    q: searchParams.get('q'),
    mode: searchParams.get('mode') || 'title',
  })

  if (!parsed.success) {
    return NextResponse.json({ results: [] })
  }

  const { q: query, mode } = parsed.data

  if (query.trim().length < 3) {
    return NextResponse.json({ results: [] })
  }

  try {
    const googleResults = await searchGoogleBooks(query, 10, mode)

    if (googleResults.length > 0) {
      return NextResponse.json({ results: googleResults })
    }

    // If no results from Google, try Open Library as fallback
    const openLibraryResults = await searchOpenLibrary(query, 10)
    return NextResponse.json({ results: openLibraryResults })
  } catch (error) {
    console.error('Error searching books:', error)
    return NextResponse.json({ error: 'Erro ao buscar livros' }, { status: 500 })
  }
}
