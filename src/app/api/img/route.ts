/**
 * Server-side image optimization proxy.
 * 
 * When an image is requested via /api/img?src=/uploads/xxx&w=800&q=80,
 * this endpoint will:
 * 1. Read the original file from disk
 * 2. Resize to the requested width (if provided)
 * 3. Convert to WebP at the requested quality
 * 4. Cache the optimized version to disk for future requests
 * 5. Return the optimized image
 * 
 * This handles ALL old images that were uploaded before the auto-convert feature.
 */
import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir, stat } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getUploadFilePath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

// Cache directory for optimized images
const CACHE_DIR = path.join(process.cwd(), ".next", "cache", "optimized-images");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const src = searchParams.get("src") || searchParams.get("url");
    const width = parseInt(searchParams.get("w") || "0") || 0;
    const quality = parseInt(searchParams.get("q") || "80") || 80;

    if (!src || !src.startsWith("/uploads/")) {
      return new NextResponse("Invalid source", { status: 400 });
    }

    // Build cache key from params
    const cacheKey = `${src.replace(/[^a-z0-9]/gi, "_")}_w${width}_q${quality}.webp`;
    const cachePath = path.join(CACHE_DIR, cacheKey);

    // Check if cached version exists
    try {
      const cached = await readFile(cachePath);
      return new NextResponse(cached, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Optimized": "cached",
        },
      });
    } catch {
      // Cache miss — proceed to optimize
    }

    // Read original file
    const originalPath = getUploadFilePath(src);
    let buffer: Buffer;

    try {
      buffer = await readFile(originalPath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    // Skip non-image files
    const ext = path.extname(originalPath).toLowerCase();
    const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif"]);
    if (!imageExts.has(ext)) {
      return new NextResponse(buffer, {
        headers: { "Content-Type": "application/octet-stream" },
      });
    }

    // Optimize with sharp
    let pipeline = sharp(buffer);

    if (width > 0) {
      pipeline = pipeline.resize(width, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const optimized = await pipeline.webp({ quality }).toBuffer();

    // Save to cache (async, don't wait)
    mkdir(CACHE_DIR, { recursive: true })
      .then(() => writeFile(cachePath, optimized))
      .catch(() => {}); // Silently fail cache write

    return new NextResponse(optimized, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Optimized": "on-the-fly",
        "X-Original-Size": buffer.length.toString(),
        "X-Optimized-Size": optimized.length.toString(),
      },
    });
  } catch (error) {
    console.error("Image optimization error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
