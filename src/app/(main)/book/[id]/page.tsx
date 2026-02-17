import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { BookOpen, ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { StatusSelector } from '@/components/book/status-selector'
import { RatingStars } from '@/components/book/rating-stars'
import { BookDetailsForm } from '@/components/book/book-details-form'
import { RereadButton } from '@/components/book/reread-button'
import { ReadingHistory } from '@/components/book/reading-history'
import { AnnotationForm } from '@/components/book/annotation-form'
import { AnnotationCard } from '@/components/book/annotation-card'
import { JsonLd } from '@/components/seo/json-ld'
import { generateBookSchema } from '@/lib/seo/structured-data'

interface BookPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BookPageProps) {
  const { id } = await params
  const book = await db.book.findUnique({ where: { id } })
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lertraca.com.br'

  if (!book) {
    return { title: 'Livro não encontrado' }
  }

  const description = book.synopsis
    ? book.synopsis.slice(0, 160) + (book.synopsis.length > 160 ? '...' : '')
    : `${book.title} por ${book.authors.join(', ')} no Traça`

  return {
    title: book.title,
    description,
    openGraph: {
      title: book.title,
      description,
      type: 'book',
      images: book.coverUrl ? [{ url: book.coverUrl, alt: book.title }] : [],
      url: `${baseUrl}/book/${id}`,
    },
    twitter: {
      card: 'summary',
      title: book.title,
      description,
      images: book.coverUrl ? [book.coverUrl] : [],
    },
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params
  const session = await auth()

  const book = await db.book.findUnique({ where: { id } })

  // Get username for share card
  const user = session?.user?.id
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: { username: true },
      })
    : null

  if (!book) {
    notFound()
  }

  // Get user's relationship with this book
  const userBook = session?.user?.id
    ? await db.userBook.findFirst({
        where: {
          userId: session.user.id,
          bookId: id,
          isReread: false,
        },
        include: {
          annotations: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
          },
          rereads: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              rating: true,
              startDate: true,
              finishDate: true,
              isReread: true,
              createdAt: true,
            },
          },
        },
      })
    : null

  // Build reading history (main reading + rereads)
  const allReadings = userBook
    ? [
        {
          id: userBook.id,
          rating: userBook.rating,
          startDate: userBook.startDate,
          finishDate: userBook.finishDate,
          isReread: false,
          createdAt: userBook.createdAt,
        },
        ...(userBook.rereads || []),
      ]
    : []

  const totalReads = allReadings.length
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lertraca.com.br'

  // Generate structured data for SEO
  const bookSchema = generateBookSchema(
    {
      title: book.title,
      authors: book.authors,
      description: book.synopsis || undefined,
      isbn: book.isbn13 || book.isbn10 || undefined,
      publisher: book.publisher || undefined,
      publishedDate: book.publishedDate || undefined,
      pageCount: book.pageCount || undefined,
      coverUrl: book.coverUrl || undefined,
    },
    `${baseUrl}/book/${id}`
  )

  return (
    <div>
      <JsonLd data={bookSchema} />

      {/* Back link */}
      <Link
        href="/shelf"
        className="text-text-muted hover:text-green-deep mb-6 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para estante
      </Link>

      {/* Book header */}
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Cover */}
        <div
          className="relative h-72 w-48 flex-shrink-0 self-center overflow-hidden rounded-lg shadow-lg md:self-start"
          style={{ backgroundColor: book.colorPrimary || '#e2e8f0' }}
        >
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`Capa de ${book.title}`}
              fill
              className="object-cover"
              sizes="192px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-white/60" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="font-fraunces text-text-dark text-3xl font-bold">{book.title}</h1>
          {book.subtitle && <p className="text-text-muted mt-1 text-lg">{book.subtitle}</p>}

          {book.authors.length > 0 && (
            <p className="text-text-muted mt-3">
              por <span className="font-medium">{book.authors.join(', ')}</span>
            </p>
          )}

          <div className="text-text-muted mt-4 flex flex-wrap gap-4 text-sm">
            {book.publisher && <span>{book.publisher}</span>}
            {book.publishedDate && <span>{book.publishedDate}</span>}
            {book.pageCount && <span>{book.pageCount} páginas</span>}
          </div>

          {book.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {book.categories.slice(0, 5).map((category) => (
                <span
                  key={category}
                  className="bg-cream-dark text-text-muted rounded-full px-3 py-1 text-xs"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* User actions */}
          {userBook && (
            <div className="mt-6 space-y-4 rounded-2xl border border-cream-dark/80 bg-cream-dark/20 p-5">
              <div>
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-muted">Status</h3>
                <StatusSelector
                  userBookId={userBook.id}
                  currentStatus={userBook.status}
                  book={{
                    title: book.title,
                    authors: book.authors,
                    coverUrl: book.coverUrl,
                    colorPrimary: book.colorPrimary,
                    colorSecondary: book.colorSecondary,
                  }}
                  rating={userBook.rating}
                  username={user?.username}
                />
              </div>

              <div className="border-t border-cream-dark/80 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Avaliação</span>
                  <RatingStars userBookId={userBook.id} currentRating={userBook.rating} />
                </div>
              </div>

              {totalReads > 1 && <p className="text-text-muted text-sm">{totalReads}ª leitura</p>}

              {/* Reread button - only show if book is finished */}
              {userBook.status === 'READ' && (
                <div className="border-t border-cream-dark/80 pt-4">
                  <RereadButton userBookId={userBook.id} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User book details and reading history */}
      {userBook && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Book details form */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <BookDetailsForm
              userBookId={userBook.id}
              currentPage={userBook.currentPage}
              pageCount={book.pageCount}
              acquisitionDate={userBook.acquisitionDate}
              acquisitionValue={userBook.acquisitionValue}
              startDate={userBook.startDate}
              finishDate={userBook.finishDate}
              tags={userBook.tags}
            />
          </div>

          {/* Reading history */}
          {allReadings.length > 1 && (
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <ReadingHistory readings={allReadings} />
            </div>
          )}
        </div>
      )}

      {/* Synopsis */}
      {book.synopsis && (
        <div className="mt-8">
          <h2 className="font-fraunces text-text-dark text-xl font-semibold">Sinopse</h2>
          <p className="text-text-muted mt-3 leading-relaxed whitespace-pre-line">
            {book.synopsis}
          </p>
        </div>
      )}

      {/* Annotations */}
      {userBook && (
        <div className="mt-8">
          <h2 className="font-fraunces text-text-dark text-xl font-semibold">
            Anotações e Citações
          </h2>
          <div className="mt-4 space-y-4">
            {/* Add annotation form */}
            <AnnotationForm userBookId={userBook.id} />

            {/* Existing annotations */}
            {userBook.annotations.map((annotation) => (
              <AnnotationCard
                key={annotation.id}
                id={annotation.id}
                type={annotation.type}
                content={annotation.content}
                pageNumber={annotation.pageNumber}
                createdAt={annotation.createdAt}
              />
            ))}

            {userBook.annotations.length === 0 && (
              <p className="text-text-muted text-sm">
                Nenhuma anotação ainda. Adicione suas notas e citações favoritas!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
