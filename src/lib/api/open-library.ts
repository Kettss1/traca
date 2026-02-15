const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json'
const OPEN_LIBRARY_COVERS_URL = 'https://covers.openlibrary.org/b'

export interface OpenLibraryDoc {
  key: string
  title: string
  subtitle?: string
  author_name?: string[]
  publisher?: string[]
  first_publish_year?: number
  number_of_pages_median?: number
  subject?: string[]
  isbn?: string[]
  cover_i?: number
}

export interface OpenLibraryResponse {
  numFound: number
  docs: OpenLibraryDoc[]
}

export interface BookSearchResult {
  openLibraryKey: string
  title: string
  subtitle?: string
  authors: string[]
  publisher?: string
  publishedDate?: string
  pageCount?: number
  categories: string[]
  coverUrl?: string
  isbn10?: string
  isbn13?: string
}

function getCoverUrl(coverId?: number, isbn?: string): string | undefined {
  if (coverId) {
    return `${OPEN_LIBRARY_COVERS_URL}/id/${coverId}-L.jpg`
  }
  if (isbn) {
    return `${OPEN_LIBRARY_COVERS_URL}/isbn/${isbn}-L.jpg`
  }
  return undefined
}

function parseDoc(doc: OpenLibraryDoc): BookSearchResult {
  const isbns = doc.isbn || []
  const isbn10 = isbns.find((i) => i.length === 10)
  const isbn13 = isbns.find((i) => i.length === 13)

  return {
    openLibraryKey: doc.key,
    title: doc.title,
    subtitle: doc.subtitle,
    authors: doc.author_name || [],
    publisher: doc.publisher?.[0],
    publishedDate: doc.first_publish_year?.toString(),
    pageCount: doc.number_of_pages_median,
    categories: doc.subject?.slice(0, 5) || [],
    coverUrl: getCoverUrl(doc.cover_i, isbn13 || isbn10),
    isbn10,
    isbn13,
  }
}

export async function searchBooks(query: string, limit = 20): Promise<BookSearchResult[]> {
  if (!query.trim()) return []

  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    lang: 'por', // Prefer Portuguese
    fields:
      'key,title,subtitle,author_name,publisher,first_publish_year,number_of_pages_median,subject,isbn,cover_i',
  })

  const response = await fetch(`${OPEN_LIBRARY_SEARCH_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status}`)
  }

  const data: OpenLibraryResponse = await response.json()

  return data.docs.map(parseDoc)
}

export async function searchByISBN(isbn: string): Promise<BookSearchResult | null> {
  const cleanIsbn = isbn.replace(/[-\s]/g, '')
  const results = await searchBooks(`isbn:${cleanIsbn}`, 1)
  return results[0] || null
}
