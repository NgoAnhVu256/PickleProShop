#!/usr/bin/env node

/**
 * Batch Image Optimizer — converts all existing uploads to WebP
 * 
 * Usage: node scripts/optimize-images.mjs
 * 
 * This script:
 * 1. Scans all files in public/uploads/
 * 2. For each JPG/PNG/BMP/TIFF image:
 *    a. Converts to WebP (quality 80)
 *    b. Resizes to max 1920x1920 (keeps aspect ratio)
 *    c. Saves as .webp replacing original
 * 3. Skips GIF (animated), SVG (vector), already-optimized WebP
 * 4. Reports total savings
 */

import sharp from "sharp";
import { readdir, stat, readFile, writeFile, rename, unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const WEBP_QUALITY = 80;
// Files smaller than this are already "small enough" — skip
const MIN_SIZE_BYTES = 50 * 1024; // 50KB

const CONVERTIBLE_EXTS = new Set([".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"]);

let totalOriginal = 0;
let totalOptimized = 0;
let totalConverted = 0;
let totalSkipped = 0;

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  // Skip non-convertible files
  if (!CONVERTIBLE_EXTS.has(ext) && ext !== ".webp") {
    return;
  }

  try {
    const fileStat = await stat(filePath);
    
    // Skip small files
    if (fileStat.size < MIN_SIZE_BYTES) {
      totalSkipped++;
      return;
    }

    const originalSize = fileStat.size;
    const buffer = await readFile(filePath);

    // Optimize
    const optimized = await sharp(buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    // Only save if it's actually smaller
    if (optimized.length >= originalSize * 0.95) {
      console.log(`  ⏭ SKIP (already optimal): ${path.basename(filePath)} (${(originalSize / 1024).toFixed(0)}KB)`);
      totalSkipped++;
      return;
    }

    // If it's not already .webp, save as new .webp and remove original
    if (ext !== ".webp") {
      const newPath = filePath.replace(/\.[^.]+$/, ".webp");
      await writeFile(newPath, optimized);
      // Remove original
      await unlink(filePath);
      console.log(`  ✅ ${path.basename(filePath)} → .webp | ${(originalSize / 1024).toFixed(0)}KB → ${(optimized.length / 1024).toFixed(0)}KB (${((1 - optimized.length / originalSize) * 100).toFixed(0)}% smaller)`);
    } else {
      // Already .webp, just overwrite with optimized version
      await writeFile(filePath, optimized);
      console.log(`  ✅ ${path.basename(filePath)} (re-optimized) | ${(originalSize / 1024).toFixed(0)}KB → ${(optimized.length / 1024).toFixed(0)}KB (${((1 - optimized.length / originalSize) * 100).toFixed(0)}% smaller)`);
    }

    totalOriginal += originalSize;
    totalOptimized += optimized.length;
    totalConverted++;
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        console.log(`\n📁 ${fullPath}`);
        await processDirectory(fullPath);
      } else if (entry.isFile()) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  🖼️  PicklePro Batch Image Optimizer");
  console.log("═══════════════════════════════════════════");
  console.log(`📂 Scanning: ${UPLOAD_DIR}`);
  console.log(`⚙️  Settings: max ${MAX_WIDTH}x${MAX_HEIGHT}, WebP quality ${WEBP_QUALITY}`);
  console.log("");

  await processDirectory(UPLOAD_DIR);

  console.log("\n═══════════════════════════════════════════");
  console.log("  📊 Results");
  console.log("═══════════════════════════════════════════");
  console.log(`  ✅ Converted: ${totalConverted} files`);
  console.log(`  ⏭  Skipped:   ${totalSkipped} files`);
  
  if (totalConverted > 0) {
    const savedMB = ((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(1);
    const savedPercent = ((1 - totalOptimized / totalOriginal) * 100).toFixed(0);
    console.log(`  💾 Saved:     ${savedMB} MB (${savedPercent}% reduction)`);
    console.log(`  📦 Before:    ${(totalOriginal / 1024 / 1024).toFixed(1)} MB`);
    console.log(`  📦 After:     ${(totalOptimized / 1024 / 1024).toFixed(1)} MB`);
  }
  
  console.log("\n⚠️  IMPORTANT: If any image filenames changed (.jpg→.webp),");
  console.log("   you need to update the references in the database!");
  console.log("   Run: node scripts/fix-image-refs.mjs");
}

main().catch(console.error);
