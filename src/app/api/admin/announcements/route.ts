import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/announcements
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Admin GET announcements error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch announcements" }, { status: 500 });
  }
}

// POST /api/admin/announcements
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, image, buttonText, link, isActive, startDate, endDate } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        content,
        image: image || null,
        buttonText: buttonText || null,
        link: link || null,
        isActive: isActive ?? true,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    console.error("Admin POST announcement error:", error);
    return NextResponse.json({ success: false, error: "Failed to create announcement" }, { status: 500 });
  }
}
