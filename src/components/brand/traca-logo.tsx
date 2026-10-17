import { cn } from '@/lib/utils'

interface TracaMarkProps {
  className?: string
}

/** Traça (mariposa) — usa currentColor */
export function TracaMark({ className }: TracaMarkProps) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M14.2 11.2C10.5 10.4 5.2 11.6 2.6 14.6c-.9 1.1-.3 2.4 1 2.6 2.4.4 4 2.2 5 4.8.5 1.2 1.8 1.4 2.6.5 1.4-1.7 2.8-3.3 3-4.9ZM5.6 15.2c2.4-1.6 5.4-1.8 7-1.2-1.6.6-4.2 1.3-7 1.2Z"
      />
      <path
        fillRule="evenodd"
        d="M17.8 11.2c3.7-.8 9 .4 11.6 3.4.9 1.1.3 2.4-1 2.6-2.4.4-4 2.2-5 4.8-.5 1.2-1.8 1.4-2.6.5-1.4-1.7-2.8-3.3-3-4.9Zm8.6 4c-2.4-1.6-5.4-1.8-7-1.2 1.6.6 4.2 1.3 7 1.2Z"
      />
      <path d="M16 9.2c1.1 0 1.4 1.1 1.4 2.8l-.3 9.5c-.1 2.2-.5 3.7-1.1 3.7s-1-1.5-1.1-3.7l-.3-9.5c0-1.7.3-2.8 1.4-2.8Z" />
      <path
        d="M15.5 9.6c-.7-2.2-2.3-3.6-4.3-4m2.1 1-.4-1.3m1.5 2.3-.2-1.3M16.5 9.6c.7-2.2 2.3-3.6 4.3-4m-2.1 1 .4-1.3m-1.5 2.3.2-1.3"
        stroke="currentColor"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface TracaLogoProps {
  className?: string
  showName?: boolean
}

export function TracaLogo({ className, showName = true }: TracaLogoProps) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span className="bg-green-deep text-on-brand flex h-9 w-9 items-center justify-center rounded-xl">
        <TracaMark className="h-7 w-7" />
      </span>
      {showName && (
        <span className="font-fraunces text-green-deep text-xl font-semibold">Traça</span>
      )}
    </span>
  )
}
