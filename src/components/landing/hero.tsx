import Link from 'next/link'
import { ShelfIllustration } from './shelf-illustration'

export default function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-4 pt-8 pb-16 lg:grid-cols-[1.05fr_1fr] lg:pt-16 lg:pb-24">
      <div className="min-w-0">
        <p className="border-line bg-surface text-text-muted mb-6 inline-flex rounded-full border px-3 py-1 text-sm">
          Estante virtual e rede de leitura
        </p>
        <h1 className="font-fraunces text-text-dark text-[2.75rem] leading-[1.05] font-semibold sm:text-6xl">
          Sua estante digital com{' '}
          <em className="text-terracotta font-medium">alma brasileira</em>
        </h1>
        <p className="text-text-muted mt-6 max-w-md text-lg">
          Organize suas leituras, descubra novos livros e conecte-se com leitores como você.
          Simples, bonito e feito pra quem lê de verdade.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/register"
            className="bg-green-deep text-on-brand rounded-xl px-6 py-3 font-medium shadow-[0_8px_20px_-10px_rgb(17_94_89/0.8)] transition-opacity hover:opacity-90"
          >
            Montar minha estante
          </Link>
          <Link
            href="/login"
            className="text-text-dark hover:bg-cream-dark rounded-xl px-5 py-3 font-medium transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
      <ShelfIllustration />
    </section>
  )
}
