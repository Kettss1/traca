import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { ShelfContent } from '@/components/shelf/shelf-content'
import { CurrentlyReading } from '@/components/shelf/currently-reading'
import { Plus, BookOpen } from '@phosphor-icons/react/dist/ssr'

export const metadata = {
  title: 'Minha Estante',
  description: 'Sua estante virtual de livros',
}

export default async function ShelfPage() {
  const session = await auth()

  const userBooks = session?.user?.id
    ? await db.userBook.findMany({
        where: { userId: session.user.id, isReread: false },
        include: {
          book: true,
          _count: {
            select: { rereads: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  const stats = { total: userBooks.length }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-fraunces text-text-dark text-3xl font-bold">Minha estante</h1>
          <p className="text-text-muted mt-2">
            {stats.total} livro{stats.total !== 1 && 's'} na sua coleção
          </p>
        </div>
        <Link href="/search" className="shrink-0">
          <Button className="whitespace-nowrap">
            <Plus weight="bold" className="mr-2 h-4 w-4" />
            Adicionar livro
          </Button>
        </Link>
      </div>

      <CurrentlyReading books={userBooks.filter((ub) => ub.status === 'READING')} />

      {/* Book list with filters */}
      {userBooks.length > 0 ? (
        <ShelfContent userBooks={userBooks} />
      ) : (
        <div className="border-line flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16">
          <BookOpen className="text-text-muted/40 h-16 w-16" />
          <h3 className="text-text-dark mt-4 text-lg font-medium">Sua estante está vazia</h3>
          <p className="text-text-muted mt-2 text-center">Comece adicionando seu primeiro livro</p>
          <Link href="/search" className="mt-6">
            <Button>
              <Plus weight="bold" className="mr-2 h-4 w-4" />
              Buscar livros
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
