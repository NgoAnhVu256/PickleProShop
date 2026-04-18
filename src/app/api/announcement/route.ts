import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/announcement — Get single active announcement
export async function GET() {
  try {
    const now = new Date();
    const announcement = await prisma.announcement.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        link: true,
      },
    });

    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error("GET /api/announcement error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}
