import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/feedback-banners — List all feedback banners
export async function GET() {
  try {
    const banners = await prisma.feedbackBanner.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

// POST /api/admin/feedback-banners — Create feedback banner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, image, link, isActive } = body;

    if (!title || !image) {
      return NextResponse.json({ success: false, error: "Title and image are required" }, { status: 400 });
    }

    const banner = await prisma.feedbackBanner.create({
      data: { title, image, link: link || null, isActive: isActive ?? true },
    });

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create" }, { status: 500 });
  }
}
