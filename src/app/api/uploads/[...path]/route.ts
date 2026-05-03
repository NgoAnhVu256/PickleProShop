import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { getUploadFilePath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/**
 * API route to serve dynamic uploads that are not recognized by the static file server
 * during production (next start) because they were added after build-time.
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
    try {
      await stat(filePath);
    } catch {
      console.warn(`[uploads] File not found: ${filePath}`);
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on extension
    const ext = path.extname(filePath).toLowerCase();
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
