import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting DB Backup...");
  const data: any = {};
  
  const models = [
    'user', 'brand', 'category', 'attribute', 'attributeValue', 
    'categoryAttribute', 'product', 'productImage', 'productVariant', 
    'variantAttributeValue', 'order', 'orderItem', 'coupon', 'setting', 
    'announcement', 'banner', 'postCategory', 'post', 'promotionBanner', 
    'feedback', 'feedbackBanner', 'promotion', 'promotionCondition', 
    'promotionReward'
  ];

  for (const model of models) {
    try {
      console.log(`- Backing up model: ${model}...`);
      const client = (prisma as any)[model];
      if (client) {
        data[model] = await client.findMany();
        console.log(`  ✅ Done. Records: ${data[model].length}`);
      } else {
        console.warn(`  ⚠️ Model ${model} not found on prisma client.`);
      }
    } catch (e: any) {
      console.error(`  ❌ Error backing up model ${model}:`, e.message || e);
    }
  }

  const backupPath = path.resolve(process.cwd(), 'scratch', 'db_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n🎉 DB Backup completed! Saved to: ${backupPath}`);
}

main()
  .catch((e) => {
    console.error("Backup script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
