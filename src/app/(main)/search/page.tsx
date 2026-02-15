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
        include: { book: { select: { googleBooksId: true, openLibraryKey: true } } },
      })
    : []

  const userBookIds = userBooks
    .map((ub) => ub.book.googleBooksId || ub.book.openLibraryKey)
    .filter((id): id is string => !!id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-fraunces text-text-dark text-3xl font-bold">Buscar Livros</h1>
        <p className="text-text-muted mt-2">Encontre livros e adicione à sua estante</p>
      </div>

      <BookSearch userBookIds={userBookIds} />
    </div>
  )
}
