const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes'

export interface GoogleBookVolume {
  id: string
  volumeInfo: {
    title: string
    subtitle?: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    pageCount?: number
    categories?: string[]
    imageLinks?: {
      smallThumbnail?: string
      thumbnail?: string
      small?: string
      medium?: string
      large?: string
      extraLarge?: string
    }
    industryIdentifiers?: Array<{
      type: 'ISBN_10' | 'ISBN_13' | 'OTHER'
      identifier: string
    }>
  }
}

export interface GoogleBooksResponse {
  totalItems: number
  items?: GoogleBookVolume[]
}

export interface BookSearchResult {
  googleBooksId: string
  title: string
  subtitle?: string
  authors: string[]
  publisher?: string
  publishedDate?: string
  synopsis?: string
  pageCount?: number
  categories: string[]
  coverUrl?: string
  isbn10?: string
  isbn13?: string
}

function getBestCoverUrl(
  imageLinks?: GoogleBookVolume['volumeInfo']['imageLinks']
): string | undefined {
  if (!imageLinks) return undefined

  // Prefer higher resolution images, convert http to https
  const url =
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.small ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail

  return url?.replace('http://', 'https://')
}

function parseVolume(volume: GoogleBookVolume): BookSearchResult {
  const { volumeInfo } = volume
  const identifiers = volumeInfo.industryIdentifiers || []

  return {
    googleBooksId: volume.id,
    title: volumeInfo.title,
    subtitle: volumeInfo.subtitle,
    authors: volumeInfo.authors || [],
    publisher: volumeInfo.publisher,
    publishedDate: volumeInfo.publishedDate,
    synopsis: volumeInfo.description,
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories || [],
    coverUrl: getBestCoverUrl(volumeInfo.imageLinks),
    isbn10: identifiers.find((i) => i.type === 'ISBN_10')?.identifier,
    isbn13: identifiers.find((i) => i.type === 'ISBN_13')?.identifier,
  }
}

// Detect if query already has a Google Books search prefix (isbn:, inauthor:, intitle:)
const QUERY_PREFIX_REGEX = /^(isbn|inauthor|intitle|inpublisher|subject):/i

async function fetchGoogleBooks(q: string, maxResults: number): Promise<BookSearchResult[]> {
  const params = new URLSearchParams({
    q,
    maxResults: String(maxResults),
    printType: 'books',
    orderBy: 'relevance',
    langRestrict: 'pt',
  })

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  if (apiKey) {
    params.set('key', apiKey)
  }

  const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`Google Books API error: ${response.status}`)
  }

  const data: GoogleBooksResponse = await response.json()

  if (!data.items) return []

  return data.items.map(parseVolume)
}

export type SearchMode = 'title' | 'author'

export async function searchBooks(
  query: string,
  maxResults = 10,
  mode: SearchMode = 'title'
): Promise<BookSearchResult[]> {
  if (!query.trim()) return []

  // If user specified a prefix (isbn:, inauthor:, etc.), use it directly
  if (QUERY_PREFIX_REGEX.test(query.trim())) {
    return fetchGoogleBooks(query, maxResults)
  }

  const prefix = mode === 'author' ? 'inauthor' : 'intitle'
  return fetchGoogleBooks(`${prefix}:${query}`, maxResults)
}

export async function searchByISBN(isbn: string): Promise<BookSearchResult | null> {
  const cleanIsbn = isbn.replace(/[-\s]/g, '')
  const results = await searchBooks(`isbn:${cleanIsbn}`, 1)
  return results[0] || null
}

export async function getBookById(googleBooksId: string): Promise<BookSearchResult | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  const url = apiKey
    ? `${GOOGLE_BOOKS_API_URL}/${googleBooksId}?key=${apiKey}`
    : `${GOOGLE_BOOKS_API_URL}/${googleBooksId}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Google Books API error: ${response.status}`)
  }

  const volume: GoogleBookVolume = await response.json()
  return parseVolume(volume)
}
