import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const categories = await prisma.postCategory.findMany()
    console.log('Categories found:', categories.length)
    const posts = await prisma.post.findMany()
    console.log('Posts found:', posts.length)
  } catch (e) {
    console.error('Database Error:', e)
  }
}

main().finally(() => prisma.$disconnect())
