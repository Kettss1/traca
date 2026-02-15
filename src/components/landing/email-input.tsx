'use client'

import { LockIcon } from '@phosphor-icons/react'
import { validateEmail } from '@/lib/utils'
import { useState } from 'react'

export default function EmailInput() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setStatus('error')
      setMessage('Por favor, utilize um e-mail válido.')
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const response = await fetch('/api/v1/email-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      if (response.ok) {
        setStatus('success')
        setMessage('Obrigada! Você receberá um e-mail assim que tivermos novidades.')
        setEmail('')
      } else {
        throw new Error('Subscription failed')
      }
    } catch {
      setStatus('error')
      setMessage('Algo deu errado. Por favor, tente novamente.')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Seu melhor e-mail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
        />
        <button type="submit" disabled={status === 'loading'}>
          Quero Participar
        </button>
      </form>
      {message && (
        <p className={status === 'error' ? 'text-red-500' : 'text-green-600'}>{message}</p>
      )}
      <span>
        <LockIcon size={32} />
        Sem spam. Só atualizações sobre o lançamento.
      </span>
    </div>
  )
}
