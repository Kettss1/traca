import Image from 'next/image'
import { cn } from '@/lib/utils'

// Tons fechados o bastante para texto claro nos dois temas
const AVATAR_COLORS = ['#115e59', '#a8482a', '#5f4a85', '#80601f', '#36557a', '#7a2f4f']

function colorFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface AvatarProps {
  /** usado para escolher a cor de forma estável */
  id: string
  name?: string | null
  src?: string | null
  size?: number
  className?: string
}

export function Avatar({ id, name, src, size = 40, className }: AvatarProps) {
  const label = name || 'Leitor'
  if (src) {
    return (
      <Image
        src={src}
        alt={label}
        width={size}
        height={size}
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold text-white', className)}
      style={{ width: size, height: size, backgroundColor: colorFor(id), fontSize: size * 0.4 }}
    >
      {label.trim()[0]?.toUpperCase()}
    </span>
  )
}
