import { ArrowClockwise, Sparkle, StarHalf } from '@phosphor-icons/react/dist/ssr'

const FEATURES = [
  {
    icon: StarHalf,
    title: 'Meia estrela existe',
    text: 'Notas de 0,5 a 5. Aquele livro que não é um 4, mas também não chega a 5, finalmente tem onde ficar.',
  },
  {
    icon: ArrowClockwise,
    title: 'Releitura conta',
    text: 'Cada leitura guarda as próprias datas, nota e anotações. Voltar a um livro também entra na sua história.',
  },
  {
    icon: Sparkle,
    title: 'Retrospectiva do ano',
    text: 'Em dezembro, seu ano de leitura vira uma sequência de telas: autores, ritmo, livro mais rápido e mais demorado.',
  },
]

export function Features() {
  return (
    <section className="border-line border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <span className="bg-terracotta/10 text-terracotta mb-4 flex h-10 w-10 items-center justify-center rounded-xl">
              <Icon className="h-5 w-5" weight="fill" />
            </span>
            <h2 className="section-title">{title}</h2>
            <p className="text-text-muted mt-2">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
