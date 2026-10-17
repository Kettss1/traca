import { Star, StarHalf } from '@phosphor-icons/react/dist/ssr'
import { SpineFace } from '@/components/shelf/spine-face'
import { spineHeight, spinePalette, spineWidth } from '@/components/shelf/spine-style'

// Lombadas ilustrativas — cores escolhidas para a composição, não capas reais.
const SAMPLE = [
  { title: 'Dom Casmurro', author: 'Assis', pages: 256, c1: '#2b3445', c2: '#c9a45c' },
  { title: 'Grande Sertão: Veredas', author: 'Rosa', pages: 608, c1: '#6b3a1f', c2: '#e3b65b' },
  { title: 'A Hora da Estrela', pages: 88, c1: '#d0552c', c2: '#f6d6a8' },
  { title: 'Vidas Secas', author: 'Ramos', pages: 176, c1: '#b07a1e', c2: '#fbeac4' },
  { title: 'Torto Arado', pages: 264, c1: '#7a2f1d', c2: '#e2925a' },
  { title: 'Capitães da Areia', author: 'Amado', pages: 280, c1: '#1f5a4f', c2: '#f0c75e' },
  { title: 'Quarto de Despejo', pages: 200, c1: '#efe6d4', c2: '#3b2f25' },
  { title: 'Macunaíma', pages: 220, c1: '#2f6b3a', c2: '#f4d35e' },
  { title: 'O Cortiço', author: 'Azevedo', pages: 304, c1: '#8c1f28', c2: '#f1c9a0' },
  { title: 'Iracema', author: 'Alencar', pages: 140, c1: '#3d5a80', c2: '#e0c068' },
  { title: 'Úrsula', pages: 180, c1: '#4a2c4f', c2: '#e8b4a0' },
  { title: 'O Alienista', author: 'Assis', pages: 112, c1: '#c9b48a', c2: '#2b3445' },
  { title: 'Triste Fim de Policarpo Quaresma', pages: 336, c1: '#14424a', c2: '#e98a4b' },
  { title: 'Memórias Póstumas de Brás Cubas', pages: 240, c1: '#58331f', c2: '#d8b46a' },
]

export function ShelfIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] pt-10 pb-16" aria-hidden>
      {/* estante */}
      <div className="overflow-hidden rounded-2xl border-[10px] border-[#5a4029] bg-[#3a2a1d] shadow-[0_30px_60px_-30px_rgb(40_25_10/0.7)]">
        <div
          className="flex h-[180px] items-end gap-[3px] overflow-hidden px-5"
          style={{
            background:
              'repeating-linear-gradient(90deg, rgb(0 0 0 / 0.05) 0 1px, transparent 1px 46px), linear-gradient(180deg, #2c2017 0%, #3a2a1d 55%, #47331f 100%)',
          }}
        >
          {SAMPLE.map((book) => {
            const width = spineWidth(book.pages)
            const height = spineHeight(book.title)
            const palette = spinePalette(book.c1, book.c2)
            return (
              <div
                key={book.title}
                className="relative shrink-0 overflow-hidden rounded-[3px]"
                style={{
                  width,
                  height,
                  backgroundColor: palette.background,
                  boxShadow: '1px 0 0 rgb(0 0 0 / 0.25), 3px 2px 6px rgb(0 0 0 / 0.35)',
                }}
              >
                <SpineFace
                  title={book.title}
                  author={book.author && height >= 140 ? book.author : undefined}
                  width={width}
                  palette={palette}
                />
              </div>
            )
          })}
        </div>
        <div
          className="h-3.5"
          style={{
            background: 'linear-gradient(180deg, #b8916a 0%, #9a7451 45%, #7c5b3e 100%)',
            boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.3)',
          }}
        />
      </div>

      {/* nota com meia estrela */}
      <div className="card absolute top-0 right-2 flex items-center gap-2 px-3 py-2 sm:-right-4">
        <span className="text-terracotta flex">
          {[0, 1, 2, 3].map((i) => (
            <Star key={i} weight="fill" className="h-4 w-4" />
          ))}
          <StarHalf weight="fill" className="h-4 w-4" />
        </span>
        <span className="text-text-dark text-sm font-semibold tabular-nums">4,5</span>
      </div>

      {/* lendo agora */}
      <div className="card absolute bottom-0 left-2 flex w-64 items-center gap-3 p-3 sm:-left-6">
        <div className="h-14 w-10 shrink-0 rounded-sm bg-[#7a2f1d] shadow-[0_4px_10px_-4px_rgb(0_0_0/0.4)]" />
        <div className="min-w-0 flex-1">
          <p className="text-text-muted text-xs">Lendo agora</p>
          <p className="font-fraunces text-text-dark truncate text-sm font-semibold">Torto Arado</p>
          <div className="bg-cream-dark mt-1.5 h-1.5 overflow-hidden rounded-full">
            <div className="bg-green-deep h-full w-[62%] rounded-full" />
          </div>
        </div>
        <span className="text-text-muted text-xs tabular-nums">62%</span>
      </div>
    </div>
  )
}
