import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/banners
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ position: "asc" }, { order: "asc" }],
    });
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error("Admin GET banners error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch banners" }, { status: 500 });
  }
}

// POST /api/admin/banners
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, image, link, position, order, isActive, startDate, endDate } = body;

    if (!title || !image) {
      return NextResponse.json({ success: false, error: "Title and image are required" }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        image,
        link: link || null,
        position: position || "HERO",
        order: order || 0,
        isActive: isActive ?? true,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (error) {
    console.error("Admin POST banner error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed to create banner" }, { status: 500 });
  }
}
