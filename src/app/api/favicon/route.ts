import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/favicon
 * Serves the favicon dynamically from admin settings.
 */
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "store_favicon" },
    });

    let faviconPath: string;

    if (setting?.value && setting.value.startsWith("/uploads/")) {
      faviconPath = path.join(process.cwd(), "public", setting.value);
    } else {
      faviconPath = path.join(process.cwd(), "public", "favicon.ico");
    }

    if (!existsSync(faviconPath)) {
      faviconPath = path.join(process.cwd(), "public", "favicon.ico");
    }

    if (!existsSync(faviconPath)) {
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await readFile(faviconPath);
    const ext = path.extname(faviconPath).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".ico": "image/x-icon",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
    };

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentTypes[ext] || "image/x-icon",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Favicon error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
