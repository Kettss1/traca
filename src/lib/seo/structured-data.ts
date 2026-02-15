// Schema.org structured data generators

export interface BookSchemaData {
  title: string
  authors: string[]
  description?: string
  isbn?: string
  publisher?: string
  publishedDate?: string
  pageCount?: number
  coverUrl?: string
  rating?: number
  ratingCount?: number
}

export function generateBookSchema(book: BookSchemaData, url: string) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: book.authors.map((author) => ({
      '@type': 'Person',
      name: author,
    })),
    url,
  }

  if (book.description) {
    schema.description = book.description
  }

  if (book.isbn) {
    schema.isbn = book.isbn
  }

  if (book.publisher) {
    schema.publisher = {
      '@type': 'Organization',
      name: book.publisher,
    }
  }

  if (book.publishedDate) {
    schema.datePublished = book.publishedDate
  }

  if (book.pageCount) {
    schema.numberOfPages = book.pageCount
  }

  if (book.coverUrl) {
    schema.image = book.coverUrl
  }

  if (book.rating && book.ratingCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: book.rating,
      ratingCount: book.ratingCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return schema
}

export interface PersonSchemaData {
  name: string
  username: string
  bio?: string
  avatarUrl?: string
  url: string
}

export function generatePersonSchema(person: PersonSchemaData) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    alternateName: `@${person.username}`,
    url: person.url,
  }

  if (person.bio) {
    schema.description = person.bio
  }

  if (person.avatarUrl) {
    schema.image = person.avatarUrl
  }

  return schema
}

export function generateWebsiteSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Traça',
    alternateName: 'LerTraca',
    url: baseUrl,
    description: 'Sua estante virtual e rede social de leitura',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Traça',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      // Add social media URLs when available
    ],
  }
}
