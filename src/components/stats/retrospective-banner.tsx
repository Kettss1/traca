'use client'

import Link from 'next/link'
import { Sparkle, CaretRight } from '@phosphor-icons/react'

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
      className="group relative block overflow-hidden rounded-xl bg-gradient-to-r from-green-deep via-green-deep to-brown p-6 text-white shadow-lg transition-transform hover:scale-[1.01]"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
            <Sparkle className="h-8 w-8" weight="fill" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Sua Retrospectiva {year}</h3>
            <p className="text-sm text-white/80">
              Reviva sua jornada literária deste ano
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors group-hover:bg-white/30">
          Ver agora
          <CaretRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
