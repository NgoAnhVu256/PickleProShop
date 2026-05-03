import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getUploadDir, getUploadFilePath, getPublicUrl } from "@/lib/uploads";

// Next.js 15 App Router: ensure enough time for large uploads
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "uploads";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    
    const subfolder = folder.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const uploadDir = getUploadDir(subfolder);
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

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
