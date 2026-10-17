import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'

interface RetrospectiveBannerProps {
  year: number
  hasData: boolean
}

export function RetrospectiveBanner({ year, hasData }: RetrospectiveBannerProps) {
  if (!hasData) {
    return null
  }

  return (
    <Link
      href={`/retrospective/${year}`}
      className="group bg-green-deep text-on-brand relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl px-6 py-5 transition-transform duration-200 hover:-translate-y-0.5"
    >
      {/* ano gigante cortado na borda, como nas telas da retrospectiva */}
      <span
        aria-hidden
        className="font-fraunces pointer-events-none absolute -right-4 -bottom-8 text-[7.5rem] leading-none font-bold text-white/10"
      >
        {year}
      </span>
      <div className="relative">
        <p className="text-on-brand/70 text-sm">Retrospectiva</p>
        <p className="font-fraunces text-2xl font-semibold">Seu ano de leitura em {year}</p>
      </div>
      <span className="text-green-deep relative flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium">
        <span className="hidden sm:inline">Ver agora</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
