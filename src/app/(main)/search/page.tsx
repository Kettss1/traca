import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { BookSearch } from '@/components/book/book-search'

export const metadata = {
  title: 'Buscar Livros',
  description: 'Busque e adicione livros à sua estante virtual',
}

export default async function SearchPage() {
  const session = await auth()

  // Get user's book IDs to check which are already in shelf
  const userBooks = session?.user?.id
    ? await db.userBook.findMany({
        where: { userId: session.user.id },
        include: { book: { select: { googleBooksId: true, openLibraryKey: true, authors: true } } },
      })
    : []

  const ownBookIds = userBooks.map((ub) => ub.bookId)

  // livros mais adicionados por outros leitores e que ainda não estão na estante
  const popularGroups = await db.userBook.groupBy({
    by: ['bookId'],
    where: { bookId: { notIn: ownBookIds } },
    _count: { bookId: true },
    orderBy: { _count: { bookId: 'desc' } },
    take: 6,
  })
  const popularBooks = popularGroups.length
    ? await db.book.findMany({
        where: { id: { in: popularGroups.map((g) => g.bookId) } },
        select: { id: true, title: true, authors: true, coverUrl: true, colorPrimary: true },
      })
    : []
  const popular = popularGroups
    .map((g) => popularBooks.find((b) => b.id === g.bookId))
    .filter((b): b is (typeof popularBooks)[number] => !!b)

  const authorCounts = new Map<string, number>()
  userBooks.forEach((ub) => ub.book.authors.forEach((a) => authorCounts.set(a, (authorCounts.get(a) ?? 0) + 1)))
  const authors = [...authorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name)

  const userBookIds = userBooks
    .map((ub) => ub.book.googleBooksId || ub.book.openLibraryKey)
    .filter((id): id is string => !!id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-fraunces text-text-dark text-3xl font-bold">Buscar livros</h1>
        <p className="text-text-muted mt-2">Encontre livros e adicione à sua estante</p>
      </div>

      <BookSearch userBookIds={userBookIds} suggestions={{ popular, authors }} />
    </div>
  )
}
