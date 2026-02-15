import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lertraca.com.br'

  // Get all public profiles
  const users = await db.user.findMany({
    where: { username: { not: null } },
    select: { username: true, updatedAt: true },
  })

  // Get all books
  const books = await db.book.findMany({
    select: { id: true, updatedAt: true },
    take: 1000, // Limit for performance
    orderBy: { updatedAt: 'desc' },
  })

  const profileUrls = users.map((user) => ({
    url: `${baseUrl}/profile/${user.username}`,
    lastModified: user.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const bookUrls = books.map((book) => ({
    url: `${baseUrl}/book/${book.id}`,
    lastModified: book.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...profileUrls,
    ...bookUrls,
  ]
}
