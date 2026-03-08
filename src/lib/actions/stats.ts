'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function setReadingGoal(year: number, targetBooks: number) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autenticado' }
  }

  const currentYear = new Date().getFullYear()
  if (!Number.isInteger(year) || year < 2020 || year > currentYear + 1) {
    return { success: false, error: 'Ano inválido' }
  }

  if (targetBooks < 1 || targetBooks > 365) {
    return { success: false, error: 'Meta deve ser entre 1 e 365 livros' }
  }

  try {
    await db.readingGoal.upsert({
      where: {
        userId_year: {
          userId: session.user.id,
          year,
        },
      },
      update: { targetBooks },
      create: {
        userId: session.user.id,
        year,
        targetBooks,
      },
    })

    revalidatePath('/stats')
    return { success: true }
  } catch (error) {
    console.error('Error setting reading goal:', error)
    return { success: false, error: 'Erro ao definir meta' }
  }
}

export async function logPagesRead(userBookId: string, pagesRead: number, date?: Date) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autenticado' }
  }

  if (!Number.isInteger(pagesRead) || pagesRead < 1 || pagesRead > 5000) {
    return { success: false, error: 'Número de páginas deve ser entre 1 e 5000' }
  }

  const userBook = await db.userBook.findUnique({
    where: { id: userBookId },
  })

  if (!userBook || userBook.userId !== session.user.id) {
    return { success: false, error: 'Livro não encontrado' }
  }

  const logDate = date || new Date()
  const dateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate())

  try {
    await db.readingLog.upsert({
      where: {
        userBookId_date: {
          userBookId,
          date: dateOnly,
        },
      },
      update: { pagesRead },
      create: {
        userBookId,
        date: dateOnly,
        pagesRead,
      },
    })

    revalidatePath('/stats')
    return { success: true }
  } catch (error) {
    console.error('Error logging pages read:', error)
    return { success: false, error: 'Erro ao registrar leitura' }
  }
}
