import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(connectionString)

const themesData = [
  { name: 'Madeira Clara', shelf_style: 'wood-light', is_default: true },
  { name: 'Madeira Escura', shelf_style: 'wood-dark', is_default: false },
  { name: 'Minimalista', shelf_style: 'minimal', is_default: false },
  { name: 'Rosa Floral', shelf_style: 'pink-floral', is_default: false },
  { name: 'Industrial', shelf_style: 'industrial', is_default: false },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create themes
  let themesCreated = 0
  for (const theme of themesData) {
    const existing = await sql`SELECT id FROM theme WHERE name = ${theme.name}`
    if (existing.length === 0) {
      await sql`
        INSERT INTO theme (id, name, shelf_style, is_default, created_at)
        VALUES (gen_random_uuid(), ${theme.name}, ${theme.shelf_style}, ${theme.is_default}, NOW())
      `
      themesCreated++
    }
  }
  console.log(`✅ Created ${themesCreated} themes`)

  // Create sample book
  const existingBook = await sql`SELECT id FROM book WHERE google_books_id = 'sample-book-1'`

  if (existingBook.length === 0) {
    await sql`
      INSERT INTO book (
        id, title, authors, publisher, published_date, page_count, synopsis,
        categories, cover_url, google_books_id, color_primary, color_secondary,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        'Dom Casmurro',
        ARRAY['Machado de Assis'],
        'Editora Nova Aguilar',
        '1899',
        256,
        'Bentinho conta sua história de amor com Capitu, desde a infância no bairro de Matacavalos até as suspeitas de traição que o atormentam.',
        ARRAY['Ficção Brasileira', 'Romance', 'Clássico'],
        'https://covers.openlibrary.org/b/isbn/8520923062-L.jpg',
        'sample-book-1',
        '#2D3748',
        '#718096',
        NOW(),
        NOW()
      )
    `
    console.log('✅ Created sample book: Dom Casmurro')
  } else {
    console.log('✅ Sample book already exists: Dom Casmurro')
  }

  console.log('🎉 Seeding complete!')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
