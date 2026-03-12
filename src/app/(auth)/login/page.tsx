'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GoogleLogo } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { track } from '@vercel/analytics'
import { login, loginWithGoogle } from '@/lib/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await login(formData)

    if (result.success) {
      track('user_logged_in', { method: 'email' })
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="font-fraunces text-text-dark text-2xl font-bold">Entrar no Traça</h1>
        <p className="text-text-muted mt-2">Acesse sua estante virtual</p>
      </div>

      {/* Google login */}
      <form action={loginWithGoogle} onSubmit={() => track('user_logged_in', { method: 'google' })}>
        <Button type="submit" variant="secondary" className="w-full">
          <GoogleLogo weight="bold" className="mr-2 h-5 w-5" />
          Continuar com Google
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="bg-brown/20 h-px flex-1" />
        <span className="text-text-muted text-sm">ou</span>
        <div className="bg-brown/20 h-px flex-1" />
      </div>

      {/* Email login */}
      <form action={handleSubmit} className="space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div>
          <label htmlFor="email" className="text-text-dark mb-1 block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-text-dark mb-1 block text-sm font-medium">
            Senha
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Entrar
        </Button>
      </form>

      <p className="text-text-muted mt-6 text-center text-sm">
        Não tem uma conta?{' '}
        <Link href="/register" className="text-green-deep font-medium hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
