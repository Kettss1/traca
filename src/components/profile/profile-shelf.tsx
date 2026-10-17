import Link from 'next/link'
import { SpineFace } from '@/components/shelf/spine-face'
import { spineHeight, spinePalette, spineWidth } from '@/components/shelf/spine-style'

interface ProfileShelfProps {
  books: {
    id: string
    book: {
      id: string
      title: string
      authors: string[]
      pageCount: number | null
      colorPrimary: string | null
      colorSecondary: string | null
    }
  }[]
}

/** Estante só de leitura para o perfil público — mesmas lombadas da estante do usuário. */
export function ProfileShelf({ books }: ProfileShelfProps) {
  return (
    <div className="overflow-hidden rounded-2xl border-[10px] border-[#5a4029] bg-[#3a2a1d]">
      <ul
        className="flex h-[180px] items-end gap-[3px] overflow-x-auto px-5 [scrollbar-width:none]"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgb(0 0 0 / 0.05) 0 1px, transparent 1px 46px), linear-gradient(180deg, #2c2017 0%, #3a2a1d 55%, #47331f 100%)',
        }}
      >
        {books.map(({ id, book }) => {
          const width = spineWidth(book.pageCount)
          const height = spineHeight(book.title)
          const palette = spinePalette(book.colorPrimary, book.colorSecondary)
          const surname = book.authors[0]?.split(' ').slice(-1)[0]
          return (
            <li key={id} className="shrink-0">
              <Link
                href={`/book/${book.id}`}
                title={`${book.title}${book.authors.length ? ` — ${book.authors.join(', ')}` : ''}`}
                aria-label={book.title}
                className="relative block overflow-hidden rounded-[3px] transition-transform duration-200 hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-2 focus-visible:outline-[#f3d9a4]"
                style={{
                  width,
                  height,
                  backgroundColor: palette.background,
                  boxShadow: '1px 0 0 rgb(0 0 0 / 0.25), 3px 2px 6px rgb(0 0 0 / 0.35)',
                }}
              >
                <SpineFace
                  title={book.title}
                  author={surname && surname.length <= 7 && width >= 26 && height >= 140 ? surname : undefined}
                  width={width}
                  palette={palette}
                />
              </Link>
            </li>
          )
        })}
      </ul>
      <div
        aria-hidden
        className="h-3.5"
        style={{
          background: 'linear-gradient(180deg, #b8916a 0%, #9a7451 45%, #7c5b3e 100%)',
          boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.3)',
        }}
      />
    </div>
  )
}
