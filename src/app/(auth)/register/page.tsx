'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GoogleLogo } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { register, loginWithGoogle } from '@/lib/actions/auth'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await register(formData)

    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
    }
    // If success, the action will redirect
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="font-fraunces text-text-dark text-2xl font-bold">Criar Conta</h1>
        <p className="text-text-muted mt-2">Comece a organizar suas leituras</p>
      </div>

      {/* Google signup */}
      <form action={loginWithGoogle}>
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

      {/* Email signup */}
      <form action={handleSubmit} className="space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div>
          <label htmlFor="name" className="text-text-dark mb-1 block text-sm font-medium">
            Nome
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Seu nome"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="username" className="text-text-dark mb-1 block text-sm font-medium">
            Username
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="seu_username"
            required
            disabled={isLoading}
          />
          <p className="text-text-muted mt-1 text-xs">
            Será usado na URL do seu perfil: lertraca.com/seu_username
          </p>
        </div>

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
            minLength={6}
            disabled={isLoading}
          />
          <p className="text-text-muted mt-1 text-xs">Mínimo de 6 caracteres</p>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Criar Conta
        </Button>
      </form>

      <p className="text-text-muted mt-6 text-center text-sm">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-green-deep font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
