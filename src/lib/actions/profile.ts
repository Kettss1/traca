'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100).optional(),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username pode conter apenas letras, números e _')
    .optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  quote: z.string().max(300, 'Citação deve ter no máximo 300 caracteres').optional(),
  musicUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  socialLinks: z
    .object({
      instagram: z.string().max(30).regex(/^[a-zA-Z0-9_.]*$/, 'Handle inválido').optional(),
      reddit: z.string().max(30).regex(/^[a-zA-Z0-9_-]*$/, 'Handle inválido').optional(),
      tiktok: z.string().max(30).regex(/^[a-zA-Z0-9_.]*$/, 'Handle inválido').optional(),
    })
    .optional(),
})

export async function updateProfile(data: z.infer<typeof updateProfileSchema>) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autenticado' }
  }

  const parsed = updateProfileSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { username, name, bio, quote, musicUrl, socialLinks } = parsed.data

  // Check if username is already taken (if changing)
  if (username) {
    const existingUser = await db.user.findFirst({
      where: {
        username,
        NOT: { id: session.user.id },
      },
    })

    if (existingUser) {
      return { success: false, error: 'Este username já está em uso' }
    }
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(bio !== undefined && { bio }),
        ...(quote !== undefined && { quote }),
        ...(musicUrl !== undefined && { musicUrl: musicUrl || null }),
        ...(socialLinks !== undefined && { socialLinks }),
      },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        quote: true,
        musicUrl: true,
        socialLinks: true,
        avatarUrl: true,
      },
    })

    // Revalidate profile pages
    if (updatedUser.username) {
      revalidatePath(`/profile/${updatedUser.username}`)
    }
    revalidatePath('/settings')

    return { success: true, data: updatedUser }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Erro ao atualizar perfil' }
  }
}

const ALLOWED_AVATAR_HOSTS = [
  'lh3.googleusercontent.com',
]

const avatarUrlSchema = z.string().url().refine((url) => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && ALLOWED_AVATAR_HOSTS.includes(parsed.hostname)
  } catch {
    return false
  }
}, 'URL de avatar não permitida')

export async function updateAvatar(avatarUrl: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autenticado' }
  }

  const parsed = avatarUrlSchema.safeParse(avatarUrl)
  if (!parsed.success) {
    return { success: false, error: 'URL de avatar inválida' }
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: parsed.data },
    })

    if (updatedUser.username) {
      revalidatePath(`/profile/${updatedUser.username}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating avatar:', error)
    return { success: false, error: 'Erro ao atualizar avatar' }
  }
}

export async function getPublicProfile(username: string) {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      quote: true,
      musicUrl: true,
      socialLinks: true,
      points: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  // Get reading stats
  const userBooks = await db.userBook.findMany({
    where: { userId: user.id, isReread: false },
    select: { status: true },
  })

  const stats = {
    total: userBooks.length,
    read: userBooks.filter((ub) => ub.status === 'READ').length,
    reading: userBooks.filter((ub) => ub.status === 'READING').length,
    wantToRead: userBooks.filter((ub) => ub.status === 'WANT_TO_READ').length,
  }

  // Get recent books
  const recentBooks = await db.userBook.findMany({
    where: { userId: user.id, isReread: false },
    include: { book: true },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })

  return {
    ...user,
    stats,
    recentBooks,
  }
}
