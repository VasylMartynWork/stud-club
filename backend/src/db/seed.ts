import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from './client.js'
import { categories } from './schema/index.js'

const defaultCategories = ['Спорт', 'Наука', 'Дозвілля']

async function seed() {
  for (const name of defaultCategories) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.name, name),
    })

    if (!existing) {
      await db.insert(categories).values({ name })
      console.log(`Created category: ${name}`)
    } else {
      console.log(`Category already exists: ${name}`)
    }
  }
}

seed()
  .then(() => {
    console.log('Seed completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
