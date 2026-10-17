'use client'

import { useState } from 'react'

interface SpineCoverProps {
  src: string
  /** cor de fundo da lombada, usada para tingir a capa e dar leitura ao título */
  tint: string
}

/**
 * Textura da lombada feita a partir da capa: uma fatia perto da borda esquerda,
 * desfocada para virar só cor e arte (sem letras da capa competindo com o título)
 * e tingida com a cor principal do livro. Se a imagem falhar, fica só a cor.
 */
export function SpineCover({ src, tint }: SpineCoverProps) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

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
        className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
        // scale esconde a borda clara que o blur cria nas laterais
        style={{ objectPosition: '12% 50%', filter: 'blur(2.5px) saturate(1.15)', transform: 'scale(1.15)' }}
      />
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
