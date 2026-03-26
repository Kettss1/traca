import { describe, it, expect } from 'vitest'
import {
  readingStatusSchema,
  addBookSchema,
  updateUserBookSchema,
  createAnnotationSchema,
  searchBooksSchema,
} from '@/lib/validators/book'

describe('readingStatusSchema', () => {
  it.each(['WANT_TO_READ', 'READING', 'READ', 'ABANDONED'])('aceita status "%s"', (status) => {
    expect(readingStatusSchema.parse(status)).toBe(status)
  })

  it('rejeita status inválido', () => {
    expect(() => readingStatusSchema.parse('INVALID')).toThrow()
  })
})

describe('addBookSchema', () => {
  const validInput = {
    title: 'Dom Casmurro',
    authors: ['Machado de Assis'],
    status: 'WANT_TO_READ' as const,
  }

  it('aceita input válido mínimo', () => {
    const result = addBookSchema.parse(validInput)
    expect(result.title).toBe('Dom Casmurro')
    expect(result.authors).toEqual(['Machado de Assis'])
    expect(result.tags).toEqual([])
    expect(result.categories).toEqual([])
  })

  it('aceita input completo', () => {
    const full = {
      ...validInput,
      subtitle: 'Romance',
      publisher: 'Garnier',
      publishedDate: '1899',
      synopsis: 'Uma história sobre ciúme...',
      pageCount: 256,
      categories: ['Fiction'],
      coverUrl: 'https://books.google.com/cover.jpg',
      isbn10: '1234567890',
      isbn13: '1234567890123',
      googleBooksId: 'abc123',
      colorPrimary: '#ff0000',
      colorSecondary: '#00ff00',
      tags: ['clássico', 'brasileiro'],
    }
    const result = addBookSchema.parse(full)
    expect(result.title).toBe('Dom Casmurro')
    expect(result.tags).toEqual(['clássico', 'brasileiro'])
  })

  it('rejeita título vazio', () => {
    expect(() => addBookSchema.parse({ ...validInput, title: '' })).toThrow()
  })

  it('usa default WANT_TO_READ se status não informado', () => {
    const result = addBookSchema.parse({ title: 'Teste' })
    expect(result.status).toBe('WANT_TO_READ')
  })

  it('rejeita pageCount negativo', () => {
    expect(() => addBookSchema.parse({ ...validInput, pageCount: -1 })).toThrow()
  })

  it('rejeita pageCount zero', () => {
    expect(() => addBookSchema.parse({ ...validInput, pageCount: 0 })).toThrow()
  })

  it('rejeita pageCount decimal', () => {
    expect(() => addBookSchema.parse({ ...validInput, pageCount: 3.5 })).toThrow()
  })

  it('rejeita coverUrl de host não permitido', () => {
    expect(() =>
      addBookSchema.parse({ ...validInput, coverUrl: 'https://evil.com/cover.jpg' })
    ).toThrow()
  })

  it('rejeita coverUrl HTTP (não HTTPS)', () => {
    expect(() =>
      addBookSchema.parse({ ...validInput, coverUrl: 'http://books.google.com/cover.jpg' })
    ).toThrow()
  })

  it('aceita coverUrl de hosts permitidos', () => {
    const hosts = [
      'https://books.google.com/cover.jpg',
      'https://covers.openlibrary.org/b/isbn/123-L.jpg',
      'https://lh3.googleusercontent.com/img.jpg',
    ]
    for (const url of hosts) {
      const result = addBookSchema.parse({ ...validInput, coverUrl: url })
      expect(result.coverUrl).toBe(url)
    }
  })
})

describe('updateUserBookSchema', () => {
  const validCuid = 'clxxxxxxxxxxxxxxxxxxxxxxxxx'

  it('aceita update mínimo (só userBookId)', () => {
    const result = updateUserBookSchema.parse({ userBookId: validCuid })
    expect(result.userBookId).toBe(validCuid)
  })

  it('aceita rating válido (incrementos de 0.5)', () => {
    for (const rating of [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]) {
      const result = updateUserBookSchema.parse({ userBookId: validCuid, rating })
      expect(result.rating).toBe(rating)
    }
  })

  it('rejeita rating fora de incremento de 0.5', () => {
    expect(() =>
      updateUserBookSchema.parse({ userBookId: validCuid, rating: 1.3 })
    ).toThrow()
  })

  it('rejeita rating acima de 5', () => {
    expect(() =>
      updateUserBookSchema.parse({ userBookId: validCuid, rating: 5.5 })
    ).toThrow()
  })

  it('rejeita rating abaixo de 0.5', () => {
    expect(() =>
      updateUserBookSchema.parse({ userBookId: validCuid, rating: 0.1 })
    ).toThrow()
  })

  it('aceita rating null (remover avaliação)', () => {
    const result = updateUserBookSchema.parse({ userBookId: validCuid, rating: null })
    expect(result.rating).toBeNull()
  })

  it('rejeita currentPage negativo', () => {
    expect(() =>
      updateUserBookSchema.parse({ userBookId: validCuid, currentPage: -1 })
    ).toThrow()
  })

  it('aceita currentPage zero', () => {
    const result = updateUserBookSchema.parse({ userBookId: validCuid, currentPage: 0 })
    expect(result.currentPage).toBe(0)
  })
})

describe('createAnnotationSchema', () => {
  const validCuid = 'clxxxxxxxxxxxxxxxxxxxxxxxxx'

  it('aceita nota válida', () => {
    const result = createAnnotationSchema.parse({
      userBookId: validCuid,
      type: 'NOTE',
      content: 'Minha anotação',
    })
    expect(result.type).toBe('NOTE')
  })

  it('aceita citação com página', () => {
    const result = createAnnotationSchema.parse({
      userBookId: validCuid,
      type: 'QUOTE',
      content: '"Capitu traiu ou não?"',
      pageNumber: 42,
    })
    expect(result.pageNumber).toBe(42)
  })

  it('rejeita conteúdo vazio', () => {
    expect(() =>
      createAnnotationSchema.parse({
        userBookId: validCuid,
        type: 'NOTE',
        content: '',
      })
    ).toThrow()
  })

  it('rejeita tipo inválido', () => {
    expect(() =>
      createAnnotationSchema.parse({
        userBookId: validCuid,
        type: 'INVALID',
        content: 'algo',
      })
    ).toThrow()
  })

  it('rejeita pageNumber negativo', () => {
    expect(() =>
      createAnnotationSchema.parse({
        userBookId: validCuid,
        type: 'NOTE',
        content: 'algo',
        pageNumber: -1,
      })
    ).toThrow()
  })
})

describe('searchBooksSchema', () => {
  it('aceita query válida', () => {
    const result = searchBooksSchema.parse({ query: 'machado de assis' })
    expect(result.query).toBe('machado de assis')
  })

  it('rejeita query vazia', () => {
    expect(() => searchBooksSchema.parse({ query: '' })).toThrow()
  })
})
