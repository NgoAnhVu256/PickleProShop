import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debug() {
  console.log("--- Debugging Products API Query ---");
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        brand:    { select: { id: true, name: true } },
        _count:   { select: { variants: true } },
      },
    });
    console.log(`✅ Products query successful: ${products.length} found`);
  } catch (e: any) {
    console.error("❌ Products query failed:", e.message);
  }

  console.log("\n--- Debugging Brands API Query ---");
  try {
    const brands = await prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
    });
    console.log(`✅ Brands query successful: ${brands.length} found`);
  } catch (e: any) {
    console.error("❌ Brands query failed:", e.message);
  }

  console.log("\n--- Debugging Attributes API Query ---");
  try {
    const attrs = await prisma.attribute.findMany({
      include: { _count: { select: { variantValues: true } } },
    });
    console.log(`✅ Attributes query successful: ${attrs.length} found`);
  } catch (e: any) {
    console.error("❌ Attributes query failed:", e.message);
  }
}

debug()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
