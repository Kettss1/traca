'use client'

import { useState, useSyncExternalStore } from 'react'

type Variant = 'slice' | 'blur' | 'squeeze'

// TEMPORÁRIO para comparar no preview: ?spine=slice|blur|squeeze
function useVariant(): Variant {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const v = new URLSearchParams(window.location.search).get('spine')
      return v === 'slice' || v === 'squeeze' ? v : 'blur'
    },
    () => 'blur'
  )
}

interface SpineCoverProps {
  src: string
  /** cor de fundo da lombada, usada para tingir a capa e dar leitura ao título */
  tint: string
}

/**
 * Textura da lombada feita a partir da capa, tingida com a cor principal do livro.
 * Se a imagem falhar, some e fica só a cor.
 */
export function SpineCover({ src, tint }: SpineCoverProps) {
  const [failed, setFailed] = useState(false)
  const variant = useVariant()
  if (failed) return null

  const imgStyle: React.CSSProperties =
    variant === 'squeeze'
      ? { objectFit: 'fill' }
      : variant === 'blur'
        ? { objectFit: 'cover', objectPosition: '12% 50%', filter: 'blur(2.5px) saturate(1.15)', transform: 'scale(1.15)' }
        : { objectFit: 'cover', objectPosition: '12% 50%' }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- capa externa, pequena, sem otimização */}
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        draggable={false}
        onError={() => setFailed(true)}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        style={imgStyle}
      />
      {/* tinge com a cor do livro e escurece as pontas, como uma lombada impressa */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${tint} 0%, color-mix(in srgb, ${tint} 55%, transparent) 14%, color-mix(in srgb, ${tint} 35%, transparent) 50%, color-mix(in srgb, ${tint} 55%, transparent) 86%, ${tint} 100%)`,
        }}
      />
    </>
  )
}
