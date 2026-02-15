import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { ACHIEVEMENTS } from '../src/lib/data/achievements'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(connectionString)

async function seedAchievements() {
  console.log('Seeding achievements...')

  for (const achievement of ACHIEVEMENTS) {
    await sql`
      INSERT INTO achievement (id, code, name, description, icon, category, points, coins, requirement, is_secret, created_at)
      VALUES (
        gen_random_uuid(),
        ${achievement.code},
        ${achievement.name},
        ${achievement.description},
        ${achievement.icon},
        ${achievement.category},
        ${achievement.points},
        ${achievement.coins},
        ${JSON.stringify(achievement.requirement)}::jsonb,
        ${achievement.isSecret},
        NOW()
      )
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        category = EXCLUDED.category,
        points = EXCLUDED.points,
        coins = EXCLUDED.coins,
        requirement = EXCLUDED.requirement,
        is_secret = EXCLUDED.is_secret
    `
    console.log(`  ✓ ${achievement.name}`)
  }

  console.log(`\nSeeded ${ACHIEVEMENTS.length} achievements`)
}

seedAchievements().catch(console.error)
