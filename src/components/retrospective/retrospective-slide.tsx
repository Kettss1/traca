'use client'

import { ReactNode } from 'react'

interface RetrospectiveSlideProps {
  children: ReactNode
}

export function RetrospectiveSlide({ children }: RetrospectiveSlideProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="max-w-lg text-center text-white">{children}</div>
    </div>
  )
}
