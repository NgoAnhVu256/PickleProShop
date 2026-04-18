import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  
  // 1. Transaction-safe deletion in correct order
  await prisma.variantAttributeValue.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.categoryAttribute.deleteMany({});
  await prisma.attributeValue.deleteMany({});
  await prisma.attribute.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.postCategory.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.promotionBanner.deleteMany({});
  await prisma.announcement.deleteMany({});
  
  console.log("Database cleared successfully (kept Users & Settings).");
}

main()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
