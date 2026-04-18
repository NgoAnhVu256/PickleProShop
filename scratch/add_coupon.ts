import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.coupon.upsert({
    where: { code: "PICKLE10" },
    update: {},
    create: {
      code: "PICKLE10",
      type: "PERCENT",
      value: 10,
      maxDiscount: 200000,
      minOrderValue: 0,
      isActive: true,
      limit: 100,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FREESHIP50K" },
    update: {},
    create: {
      code: "FREESHIP50K",
      type: "FIXED",
      value: 50000,
      minOrderValue: 500000,
      isActive: true,
      limit: 50,
    },
  });

  console.log("Tạo thành công 2 mã ưu đãi sample!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
