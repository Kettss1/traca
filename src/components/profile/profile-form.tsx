'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  User,
  FloppyDisk,
  InstagramLogo,
  RedditLogo,
  TiktokLogo,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateProfile } from '@/lib/actions/profile'

interface ProfileFormProps {
  user: {
    id: string
    email: string
    username: string | null
    name: string | null
    bio: string | null
    avatarUrl: string | null
    quote: string | null
    musicUrl: string | null
    socialLinks: unknown
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const socialLinks = user.socialLinks as {
    instagram?: string
    reddit?: string
    tiktok?: string
  } | null

  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    bio: user.bio || '',
    quote: user.quote || '',
    musicUrl: user.musicUrl || '',
    instagram: socialLinks?.instagram || '',
    reddit: socialLinks?.reddit || '',
    tiktok: socialLinks?.tiktok || '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateProfile({
      name: formData.name || undefined,
      username: formData.username || undefined,
      bio: formData.bio || undefined,
      quote: formData.quote || undefined,
      musicUrl: formData.musicUrl || undefined,
      socialLinks: {
        instagram: formData.instagram || undefined,
        reddit: formData.reddit || undefined,
        tiktok: formData.tiktok || undefined,
      },
    })

    setIsSaving(false)

    if (result.success) {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || 'Erro ao atualizar perfil')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar section */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-medium text-text-dark">Foto de Perfil</h2>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-cream-dark">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt="Avatar"
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <User className="h-10 w-10 text-text-muted" />
              </div>
            )}
          </div>
          <div className="text-sm text-text-muted">
            <p>A foto de perfil é obtida automaticamente da sua conta Google.</p>
            <p>Para alterar, atualize sua foto no Google.</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-medium text-text-dark">Informações Básicas</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Email</label>
            <Input type="email" value={user.email} disabled className="bg-cream-dark" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-muted">Nome</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-muted">Username</label>
            <div className="flex items-center">
              <span className="rounded-l-lg border border-r-0 border-line bg-cream-dark px-3 py-2 text-text-muted">
                @
              </span>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value.toLowerCase() })
                }
                placeholder="username"
                className="rounded-l-none"
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Seu perfil público ficará em: lertraca.com/profile/{formData.username || 'username'}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-muted">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Conte um pouco sobre você..."
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
            />
            <p className="mt-1 text-xs text-text-muted">{formData.bio.length}/500 caracteres</p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-muted">Citação Favorita</label>
            <textarea
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              placeholder="Uma citação que te inspira..."
              rows={2}
              maxLength={300}
              className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
            />
            <p className="mt-1 text-xs text-text-muted">{formData.quote.length}/300 caracteres</p>
          </div>
        </div>
      </div>

      {/* Social links */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-medium text-text-dark">Redes Sociais</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm text-text-muted">
              <InstagramLogo className="h-4 w-4" />
              Instagram
            </label>
            <div className="flex items-center">
              <span className="rounded-l-lg border border-r-0 border-line bg-cream-dark px-3 py-2 text-sm text-text-muted">
                instagram.com/
              </span>
              <Input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="seu_usuario"
                className="rounded-l-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-sm text-text-muted">
              <RedditLogo className="h-4 w-4" />
              Reddit
            </label>
            <div className="flex items-center">
              <span className="rounded-l-lg border border-r-0 border-line bg-cream-dark px-3 py-2 text-sm text-text-muted">
                reddit.com/user/
              </span>
              <Input
                type="text"
                value={formData.reddit}
                onChange={(e) => setFormData({ ...formData, reddit: e.target.value })}
                placeholder="seu_usuario"
                className="rounded-l-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-sm text-text-muted">
              <TiktokLogo className="h-4 w-4" />
              TikTok
            </label>
            <div className="flex items-center">
              <span className="rounded-l-lg border border-r-0 border-line bg-cream-dark px-3 py-2 text-sm text-text-muted">
                tiktok.com/@
              </span>
              <Input
                type="text"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                placeholder="seu_usuario"
                className="rounded-l-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Music link */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-medium text-text-dark">Música</h2>
        <div>
          <label className="mb-1 block text-sm text-text-muted">
            Link para sua música favorita (Spotify, YouTube, etc.)
          </label>
          <Input
            type="url"
            value={formData.musicUrl}
            onChange={(e) => setFormData({ ...formData, musicUrl: e.target.value })}
            placeholder="https://open.spotify.com/track/..."
          />
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">
          Perfil atualizado com sucesso!
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        {user.username && (
          <Link
            href={`/profile/${user.username}`}
            className="text-sm text-green-deep hover:underline"
          >
            Ver meu perfil público
          </Link>
        )}
        <Button type="submit" isLoading={isSaving}>
          <FloppyDisk className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>
    </form>
  )
}
