#!/usr/bin/env node

/**
 * Fix Image References in Database
 * 
 * After running optimize-images.mjs, any .jpg/.png files
 * that were converted to .webp need their database references updated.
 * 
 * This script scans the database for image URLs ending in
 * .jpg/.jpeg/.png and updates them to .webp if the .webp file exists.
 * 
 * Usage: node scripts/fix-image-refs.mjs
 */

import { PrismaClient } from "@prisma/client";
import { stat } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

function toWebpUrl(url) {
  if (!url) return null;
  return url.replace(/\.(jpg|jpeg|png|bmp|tiff|tif)$/i, ".webp");
}

function getFilePath(url) {
  if (!url || !url.startsWith("/uploads/")) return null;
  const relativePath = url.slice("/uploads/".length);
  return path.join(UPLOAD_DIR, relativePath);
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

let updated = 0;

async function updateField(model, id, field, oldUrl) {
  const newUrl = toWebpUrl(oldUrl);
  if (!newUrl || newUrl === oldUrl) return;
  
  const filePath = getFilePath(newUrl);
  if (!filePath) return;
  
  const exists = await fileExists(filePath);
  if (!exists) return;

  try {
    await prisma[model].update({
      where: { id },
      data: { [field]: newUrl },
    });
    console.log(`  ✅ ${model}.${field}: ${oldUrl} → ${newUrl}`);
    updated++;
  } catch (error) {
    console.error(`  ❌ Failed to update ${model} ${id}: ${error.message}`);
  }
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  🔧 Fix Image References in Database");
  console.log("═══════════════════════════════════════════\n");

  // 1. Products — thumbnail and images array
  console.log("📦 Checking Products...");
  const products = await prisma.product.findMany({
    select: { id: true, thumbnail: true, images: true },
  });
  for (const p of products) {
    if (p.thumbnail && /\.(jpg|jpeg|png)$/i.test(p.thumbnail)) {
      await updateField("product", p.id, "thumbnail", p.thumbnail);
    }
    if (p.images && Array.isArray(p.images)) {
      const newImages = p.images.map(img => {
        const webpUrl = toWebpUrl(img);
        return webpUrl || img;
      });
      const hasChanges = newImages.some((img, i) => img !== p.images[i]);
      if (hasChanges) {
        // Check that at least one webp file actually exists
        const firstWebp = getFilePath(newImages[0]);
        if (firstWebp && await fileExists(firstWebp)) {
          await prisma.product.update({
            where: { id: p.id },
            data: { images: newImages },
          });
          console.log(`  ✅ product.images: updated ${newImages.length} URLs`);
          updated++;
        }
      }
    }
  }

  // 2. Banners
  console.log("\n🖼️  Checking Banners...");
  const banners = await prisma.banner.findMany({
    select: { id: true, image: true },
  });
  for (const b of banners) {
    if (b.image && /\.(jpg|jpeg|png)$/i.test(b.image)) {
      await updateField("banner", b.id, "image", b.image);
    }
  }

  // 3. Posts
  console.log("\n📝 Checking Posts...");
  const posts = await prisma.post.findMany({
    select: { id: true, image: true, ogImage: true },
  });
  for (const p of posts) {
    if (p.image && /\.(jpg|jpeg|png)$/i.test(p.image)) {
      await updateField("post", p.id, "image", p.image);
    }
    if (p.ogImage && /\.(jpg|jpeg|png)$/i.test(p.ogImage)) {
      await updateField("post", p.id, "ogImage", p.ogImage);
    }
  }

  // 4. Categories
  console.log("\n📂 Checking Categories...");
  const categories = await prisma.category.findMany({
    select: { id: true, image: true },
  });
  for (const c of categories) {
    if (c.image && /\.(jpg|jpeg|png)$/i.test(c.image)) {
      await updateField("category", c.id, "image", c.image);
    }
  }

  // 5. PromotionBanners
  console.log("\n🎁 Checking PromotionBanners...");
  const promos = await prisma.promotionBanner.findMany({
    select: { id: true, image: true },
  });
  for (const p of promos) {
    if (p.image && /\.(jpg|jpeg|png)$/i.test(p.image)) {
      await updateField("promotionBanner", p.id, "image", p.image);
    }
  }

  // 6. ProductVariants
  console.log("\n🎨 Checking ProductVariants...");
  const variants = await prisma.productVariant.findMany({
    select: { id: true, images: true },
  });
  for (const v of variants) {
    if (v.images && Array.isArray(v.images)) {
      const newImages = v.images.map(img => {
        const webpUrl = toWebpUrl(img);
        return webpUrl || img;
      });
      const hasChanges = newImages.some((img, i) => img !== v.images[i]);
      if (hasChanges) {
        // Check that at least one webp file actually exists
        const firstWebp = getFilePath(newImages[0]);
        if (firstWebp && await fileExists(firstWebp)) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: { images: newImages },
          });
          console.log(`  ✅ productVariant.images: updated ${newImages.length} URLs`);
          updated++;
        }
      }
    }
  }

  // 7. Announcements
  console.log("\n📢 Checking Announcements...");
  const announcements = await prisma.announcement.findMany({
    select: { id: true, image: true },
  });
  for (const a of announcements) {
    if (a.image && /\.(jpg|jpeg|png)$/i.test(a.image)) {
      await updateField("announcement", a.id, "image", a.image);
    }
  }

  // 8. FeedbackBanners
  console.log("\n💬 Checking FeedbackBanners...");
  const feedbackBanners = await prisma.feedbackBanner.findMany({
    select: { id: true, image: true },
  });
  for (const f of feedbackBanners) {
    if (f.image && /\.(jpg|jpeg|png)$/i.test(f.image)) {
      await updateField("feedbackBanner", f.id, "image", f.image);
    }
  }

  console.log("\n═══════════════════════════════════════════");
  console.log(`  📊 Updated ${updated} database references`);
  console.log("═══════════════════════════════════════════");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
