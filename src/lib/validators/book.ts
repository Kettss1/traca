import { z } from 'zod'

export const readingStatusSchema = z.enum(['WANT_TO_READ', 'READING', 'READ', 'ABANDONED'])

export const addBookSchema = z.object({
  // Book data (from API or manual)
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional(),
  authors: z.array(z.string()).default([]),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  synopsis: z.string().optional(),
  pageCount: z.number().int().positive().optional(),
  categories: z.array(z.string()).default([]),
  coverUrl: z.string().url().optional(),
  isbn10: z.string().optional(),
  isbn13: z.string().optional(),
  googleBooksId: z.string().optional(),
  openLibraryKey: z.string().optional(),
  colorPrimary: z.string().optional(),
  colorSecondary: z.string().optional(),

  // UserBook data
  status: readingStatusSchema.default('WANT_TO_READ'),
  tags: z.array(z.string()).default([]),
})

export const updateUserBookSchema = z.object({
  userBookId: z.string().cuid(),
  status: readingStatusSchema.optional(),
  rating: z
    .number()
    .min(0.5)
    .max(5)
    .refine((val) => val % 0.5 === 0, 'Rating deve ser em incrementos de 0.5')
    .optional()
    .nullable(),
  currentPage: z.number().int().min(0).optional(),
  acquisitionDate: z.date().optional().nullable(),
  acquisitionValue: z.number().positive().optional().nullable(),
  startDate: z.date().optional().nullable(),
  finishDate: z.date().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export const createAnnotationSchema = z.object({
  userBookId: z.string().cuid(),
  type: z.enum(['NOTE', 'QUOTE']),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  pageNumber: z.number().int().positive().optional(),
})

export const searchBooksSchema = z.object({
  query: z.string().min(1, 'Digite algo para buscar'),
})

export type AddBookInput = z.infer<typeof addBookSchema>
export type UpdateUserBookInput = z.infer<typeof updateUserBookSchema>
export type CreateAnnotationInput = z.infer<typeof createAnnotationSchema>
export type ReadingStatus = z.infer<typeof readingStatusSchema>
