import { NextResponse } from 'next/server'
import { searchBooks as searchGoogleBooks, type SearchMode } from '@/lib/api/google-books'
import { searchBooks as searchOpenLibrary } from '@/lib/api/open-library'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const mode = (searchParams.get('mode') || 'title') as SearchMode

  if (!query || query.trim().length < 3) {
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
