'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { extractColorsFromImage } from '@/lib/api/colors'
import { createFeedPost } from '@/lib/services/feed'
import { awardPoints } from '@/lib/services/gamification'
import {
  addBookSchema,
  updateUserBookSchema,
  createAnnotationSchema,
  type AddBookInput,
  type UpdateUserBookInput,
  type CreateAnnotationInput,
} from '@/lib/validators/book'

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }

async function getAuthenticatedUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Não autenticado')
  }
  return session.user
}

export async function addBookToShelf(
  input: AddBookInput
): Promise<ActionResult<{ userBookId: string }>> {
  try {
    const user = await getAuthenticatedUser()
    const validated = addBookSchema.parse(input)

    // Extract colors if cover URL exists and colors not provided
    let colorPrimary = validated.colorPrimary
    let colorSecondary = validated.colorSecondary

    if (validated.coverUrl && (!colorPrimary || !colorSecondary)) {
      const colors = await extractColorsFromImage(validated.coverUrl)
      if (colors) {
        colorPrimary = colorPrimary || colors.primary
        colorSecondary = colorSecondary || colors.secondary
      }
    }

    // Find or create the book
    let book = validated.googleBooksId
      ? await db.book.findUnique({ where: { googleBooksId: validated.googleBooksId } })
      : validated.openLibraryKey
        ? await db.book.findUnique({ where: { openLibraryKey: validated.openLibraryKey } })
        : null

    if (!book) {
      book = await db.book.create({
        data: {
          title: validated.title,
          subtitle: validated.subtitle,
          authors: validated.authors,
          publisher: validated.publisher,
          publishedDate: validated.publishedDate,
          synopsis: validated.synopsis,
          pageCount: validated.pageCount,
          categories: validated.categories,
          coverUrl: validated.coverUrl,
          isbn10: validated.isbn10,
          isbn13: validated.isbn13,
          googleBooksId: validated.googleBooksId,
          openLibraryKey: validated.openLibraryKey,
          colorPrimary,
          colorSecondary,
        },
      })
    }

    // Check if user already has this book
    const existingUserBook = await db.userBook.findFirst({
      where: {
        userId: user.id,
        bookId: book.id,
        isReread: false,
      },
    })

    if (existingUserBook) {
      return { success: false, error: 'Você já tem este livro na sua estante' }
    }

    // Get the next shelf position
    const lastPosition = await db.userBook.findFirst({
      where: { userId: user.id },
      orderBy: { shelfPosition: 'desc' },
      select: { shelfPosition: true },
    })

    const userBook = await db.userBook.create({
      data: {
        userId: user.id,
        bookId: book.id,
        status: validated.status,
        tags: validated.tags,
        shelfPosition: (lastPosition?.shelfPosition ?? 0) + 1,
        startDate: validated.status === 'READING' ? new Date() : null,
      },
    })

    // Award points for adding a book
    await awardPoints(user.id, 'BOOK_ADDED', {
      description: `Adicionou "${validated.title}" à estante`,
      referenceId: userBook.id,
    })

    revalidatePath('/shelf')
    return { success: true, data: { userBookId: userBook.id } }
  } catch (error) {
    console.error('Error adding book to shelf:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao adicionar livro',
    }
  }
}

export async function updateUserBook(input: UpdateUserBookInput): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser()
    const validated = updateUserBookSchema.parse(input)

    const userBook = await db.userBook.findUnique({
      where: { id: validated.userBookId },
    })

    if (!userBook || userBook.userId !== user.id) {
      return { success: false, error: 'Livro não encontrado' }
    }

    const previousStatus = userBook.status

    // Auto-set dates based on status changes
    const updates: Record<string, unknown> = { ...validated }
    delete updates.userBookId

    if (validated.status === 'READING' && userBook.status !== 'READING') {
      updates.startDate = updates.startDate ?? new Date()
    }

    if (validated.status === 'READ' && userBook.status !== 'READ') {
      updates.finishDate = updates.finishDate ?? new Date()
    }

    await db.userBook.update({
      where: { id: validated.userBookId },
      data: updates,
    })

    // Create feed post for status changes
    if (validated.status && validated.status !== previousStatus) {
      const feedPostType =
        validated.status === 'READING'
          ? 'STARTED'
          : validated.status === 'READ'
            ? 'FINISHED'
            : validated.status === 'ABANDONED'
              ? 'ABANDONED'
              : null

      if (feedPostType) {
        await createFeedPost(user.id, feedPostType, validated.userBookId)
      }

      // Award points for finishing a book
      if (validated.status === 'READ') {
        await awardPoints(user.id, 'BOOK_FINISHED', {
          description: 'Terminou de ler um livro',
          referenceId: validated.userBookId,
        })
      }
    }

    // Create feed post for rating changes (reviews)
    if (validated.rating !== undefined && validated.rating !== null && validated.rating !== userBook.rating && validated.rating > 0) {
      await createFeedPost(user.id, 'REVIEW', validated.userBookId)

      // Award points for rating
      await awardPoints(user.id, 'BOOK_RATED', {
        description: `Avaliou um livro com ${validated.rating} estrelas`,
        referenceId: validated.userBookId,
      })
    }

    revalidatePath('/shelf')
    revalidatePath('/feed')
    revalidatePath(`/book/${userBook.bookId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error updating user book:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar livro',
    }
  }
}

export async function createReread(
  userBookId: string
): Promise<ActionResult<{ newUserBookId: string }>> {
  try {
    const user = await getAuthenticatedUser()

    const originalUserBook = await db.userBook.findUnique({
      where: { id: userBookId },
      include: { book: true },
    })

    if (!originalUserBook || originalUserBook.userId !== user.id) {
      return { success: false, error: 'Livro não encontrado' }
    }

    // Get the next shelf position
    const lastPosition = await db.userBook.findFirst({
      where: { userId: user.id },
      orderBy: { shelfPosition: 'desc' },
      select: { shelfPosition: true },
    })

    const newUserBook = await db.userBook.create({
      data: {
        userId: user.id,
        bookId: originalUserBook.bookId,
        status: 'READING',
        isReread: true,
        rereadOfId: originalUserBook.id,
        shelfPosition: (lastPosition?.shelfPosition ?? 0) + 1,
        startDate: new Date(),
      },
    })

    revalidatePath('/shelf')
    return { success: true, data: { newUserBookId: newUserBook.id } }
  } catch (error) {
    console.error('Error creating reread:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar releitura',
    }
  }
}

export async function removeFromShelf(userBookId: string): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser()

    const userBook = await db.userBook.findUnique({
      where: { id: userBookId },
    })

    if (!userBook || userBook.userId !== user.id) {
      return { success: false, error: 'Livro não encontrado' }
    }

    await db.userBook.delete({
      where: { id: userBookId },
    })

    revalidatePath('/shelf')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error removing from shelf:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao remover livro',
    }
  }
}

export async function createAnnotation(
  input: CreateAnnotationInput
): Promise<ActionResult<{ annotationId: string }>> {
  try {
    const user = await getAuthenticatedUser()
    const validated = createAnnotationSchema.parse(input)

    const userBook = await db.userBook.findUnique({
      where: { id: validated.userBookId },
    })

    if (!userBook || userBook.userId !== user.id) {
      return { success: false, error: 'Livro não encontrado' }
    }

    const annotation = await db.annotation.create({
      data: {
        userBookId: validated.userBookId,
        type: validated.type,
        content: validated.content,
        pageNumber: validated.pageNumber,
      },
    })

    // Award points for creating annotation
    await awardPoints(user.id, 'ANNOTATION_CREATED', {
      description: validated.type === 'QUOTE' ? 'Salvou uma citação' : 'Criou uma anotação',
      referenceId: annotation.id,
    })

    revalidatePath(`/book/${userBook.bookId}`)
    return { success: true, data: { annotationId: annotation.id } }
  } catch (error) {
    console.error('Error creating annotation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar anotação',
    }
  }
}

export async function deleteAnnotation(annotationId: string): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser()

    const annotation = await db.annotation.findUnique({
      where: { id: annotationId },
      include: { userBook: true },
    })

    if (!annotation || annotation.userBook.userId !== user.id) {
      return { success: false, error: 'Anotação não encontrada' }
    }

    // Soft delete
    await db.annotation.update({
      where: { id: annotationId },
      data: { deletedAt: new Date() },
    })

    revalidatePath(`/book/${annotation.userBook.bookId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error deleting annotation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar anotação',
    }
  }
}

export async function updateShelfOrder(
  orderData: { userBookId: string; position: number }[]
): Promise<ActionResult> {
  try {
    const user = await getAuthenticatedUser()

    // Verify all books belong to the user
    const userBookIds = orderData.map((d) => d.userBookId)
    const userBooks = await db.userBook.findMany({
      where: {
        id: { in: userBookIds },
        userId: user.id,
      },
    })

    if (userBooks.length !== orderData.length) {
      return { success: false, error: 'Alguns livros não foram encontrados' }
    }

    // Update positions in a transaction
    await db.$transaction(
      orderData.map((item) =>
        db.userBook.update({
          where: { id: item.userBookId },
          data: { shelfPosition: item.position },
        })
      )
    )

    revalidatePath('/shelf')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error updating shelf order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao reordenar estante',
    }
  }
}
