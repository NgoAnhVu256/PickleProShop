import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { getUploadDir, getUploadFilePath, getPublicUrl } from "@/lib/uploads";

// Next.js 15 App Router: ensure enough time for large uploads
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Image extensions that should be converted to WebP
const CONVERTIBLE_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"]);

// Max dimensions for uploaded images (resize if larger)
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;

// WebP quality (80 = good balance of quality vs file size, visually lossless)
const WEBP_QUALITY = 80;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "uploads";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    const originalExt = path.extname(file.name).toLowerCase();
    const subfolder = folder.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const uploadDir = getUploadDir(subfolder);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    let filename: string;

    // Auto-convert images to WebP for massive size reduction
    if (CONVERTIBLE_IMAGE_EXTS.has(originalExt)) {
      filename = `${uuidv4()}.webp`;

      // Convert to WebP with sharp:
      // 1. Resize if larger than MAX dimensions (keeps aspect ratio)
      // 2. Convert to WebP at configured quality
      // 3. Strip EXIF/metadata to save even more bytes
      buffer = await sharp(buffer)
        .resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: "inside",       // Keeps aspect ratio, fits within bounds
          withoutEnlargement: true, // Don't upscale small images
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
    } else if (originalExt === ".webp") {
      // Already WebP — just resize if needed, don't re-encode
      filename = `${uuidv4()}.webp`;
      buffer = await sharp(buffer)
        .resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
    } else if (originalExt === ".gif") {
      // GIF: keep as-is (animated GIFs lose animation when converted)
      filename = `${uuidv4()}.gif`;
    } else if (originalExt === ".svg") {
      // SVG: keep as-is (vector format, already tiny)
      filename = `${uuidv4()}.svg`;
    } else {
      // Non-image files (PDF, etc.): keep original extension
      filename = `${uuidv4()}${originalExt}`;
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const url = getPublicUrl(subfolder, filename);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url || !url.startsWith("/uploads/")) {
      return NextResponse.json({ success: false, error: "Invalid file URL" }, { status: 400 });
    }

    const filePath = getUploadFilePath(url);
    
    try {
      await unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Delete file error:", error);
      // Return success anyway to avoid blocking the UI if file is already gone
      return NextResponse.json({ success: true, warning: "File not found or already deleted" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
