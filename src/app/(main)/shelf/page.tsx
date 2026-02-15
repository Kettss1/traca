import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { ShelfContent } from '@/components/shelf/shelf-content'
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

  const stats = {
    total: userBooks.length,
    reading: userBooks.filter((ub) => ub.status === 'READING').length,
    read: userBooks.filter((ub) => ub.status === 'READ').length,
    wantToRead: userBooks.filter((ub) => ub.status === 'WANT_TO_READ').length,
    abandoned: userBooks.filter((ub) => ub.status === 'ABANDONED').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-fraunces text-text-dark text-3xl font-bold">Minha Estante</h1>
          <p className="text-text-muted mt-2">
            {stats.total} livro{stats.total !== 1 && 's'} na sua coleção
          </p>
        </div>
        <Link href="/search">
          <Button>
            <Plus weight="bold" className="mr-2 h-4 w-4" />
            Adicionar Livro
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-text-muted text-sm">Lendo</p>
          <p className="text-green-deep text-2xl font-bold">{stats.reading}</p>
          {stats.total > 0 && (
            <p className="text-text-muted text-xs">
              {Math.round((stats.reading / stats.total) * 100)}%
            </p>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-text-muted text-sm">Lidos</p>
          <p className="text-green-deep text-2xl font-bold">{stats.read}</p>
          {stats.total > 0 && (
            <p className="text-text-muted text-xs">
              {Math.round((stats.read / stats.total) * 100)}%
            </p>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-text-muted text-sm">Quero Ler</p>
          <p className="text-terracotta text-2xl font-bold">{stats.wantToRead}</p>
          {stats.total > 0 && (
            <p className="text-text-muted text-xs">
              {Math.round((stats.wantToRead / stats.total) * 100)}%
            </p>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-text-muted text-sm">Abandonados</p>
          <p className="text-text-muted text-2xl font-bold">{stats.abandoned}</p>
          {stats.total > 0 && (
            <p className="text-text-muted text-xs">
              {Math.round((stats.abandoned / stats.total) * 100)}%
            </p>
          )}
        </div>
      </div>

      {/* Book list with filters */}
      {userBooks.length > 0 ? (
        <ShelfContent userBooks={userBooks} />
      ) : (
        <div className="border-brown/20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16">
          <BookOpen className="text-text-muted/40 h-16 w-16" />
          <h3 className="text-text-dark mt-4 text-lg font-medium">Sua estante está vazia</h3>
          <p className="text-text-muted mt-2 text-center">Comece adicionando seu primeiro livro</p>
          <Link href="/search" className="mt-6">
            <Button>
              <Plus weight="bold" className="mr-2 h-4 w-4" />
              Buscar Livros
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
