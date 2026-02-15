'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(20, 'Username deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username pode conter apenas letras, números e _'),
})

const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type ActionResult = { success: true } | { success: false; error: string }

export async function register(formData: FormData): Promise<ActionResult> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username'),
  }

  const parsed = registerSchema.safeParse(rawData)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { success: false, error: firstError?.message || 'Dados inválidos' }
  }

  const { name, email, password, username } = parsed.data

  // Check if email already exists
  const existingEmail = await db.user.findUnique({ where: { email } })
  if (existingEmail) {
    return { success: false, error: 'Este email já está em uso' }
  }

  // Check if username already exists
  const existingUsername = await db.user.findUnique({ where: { username } })
  if (existingUsername) {
    return { success: false, error: 'Este username já está em uso' }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Create user
  await db.user.create({
    data: {
      name,
      email,
      username,
      passwordHash,
    },
  })

  // Sign in the user
  await signIn('credentials', {
    email,
    password,
    redirectTo: '/shelf',
  })

  return { success: true }
}

export async function login(formData: FormData): Promise<ActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(rawData)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { success: false, error: firstError?.message || 'Dados inválidos' }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/shelf',
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Email ou senha incorretos' }
        default:
          return { success: false, error: 'Erro ao fazer login' }
      }
    }
    throw error
  }
}

export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/shelf' })
}
