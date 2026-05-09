import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, stat, mkdir } from "fs/promises";
import path from "path";
import { getUploadFilePath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

// Image extensions eligible for on-the-fly WebP optimization
const OPTIMIZABLE_EXTS = new Set([".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"]);

// Max file size that triggers optimization (files above this WILL be optimized)
const OPTIMIZE_THRESHOLD = 500 * 1024; // 500KB

/**
 * API route to serve dynamic uploads.
 * 
 * NEW: If the image is larger than 500KB and is a supported format,
 * it will be automatically optimized to WebP on-the-fly and the
 * optimized version will be saved back to disk for future requests.
 * This handles all legacy images uploaded before the auto-convert feature.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path: pathSegments } = await params;
    
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Build the relative path from segments
    const relativePath = pathSegments.join("/");
    const filePath = getUploadFilePath(relativePath);

    // Check file exists
    let fileStat;
    try {
      fileStat = await stat(filePath);
    } catch {
      console.warn(`[uploads] File not found: ${filePath}`);
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // Auto-optimize large images on-the-fly
    if (OPTIMIZABLE_EXTS.has(ext) && fileStat.size > OPTIMIZE_THRESHOLD) {
      try {
        // Dynamic import of sharp to avoid issues if sharp isn't installed
        const sharp = (await import("sharp")).default;
        
        const optimized = await sharp(fileBuffer)
          .resize(1920, 1920, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer();

        // Only use optimized version if it's actually smaller
        if (optimized.length < fileStat.size * 0.9) {
          // Save optimized version back to disk (fire-and-forget)
          // This ensures next request gets the optimized version directly
          const webpPath = filePath.replace(/\.[^.]+$/, ".webp");
          writeFile(webpPath === filePath ? filePath : webpPath, optimized).catch(() => {});

          return new NextResponse(optimized, {
            headers: {
              "Content-Type": "image/webp",
              "Cache-Control": "public, max-age=31536000, immutable",
              "X-Original-Size": fileStat.size.toString(),
              "X-Optimized-Size": optimized.length.toString(),
            },
          });
        }
      } catch (error) {
        // If sharp fails, fall through to serve original
        console.warn("[uploads] Sharp optimization failed, serving original:", error);
      }
    }
    
    // Serve original file (non-image, small image, or optimization failed)
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".avif": "image/avif",
      ".mp4": "video/mp4",
      ".pdf": "application/pdf",
    };

    const contentType = contentTypeMap[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Serve uploads error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
