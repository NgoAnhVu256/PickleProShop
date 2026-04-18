import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete all banners that contain "unsplash.com" (mock images)
  const deleted = await prisma.banner.deleteMany({
    where: {
      image: {
        contains: "unsplash.com"
      }
    }
  });

  console.log(`Deleted ${deleted.count} mock banners.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
