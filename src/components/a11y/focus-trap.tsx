'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface FocusTrapProps {
  children: ReactNode
  active?: boolean
}

export function FocusTrap({ children, active = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  )
}
