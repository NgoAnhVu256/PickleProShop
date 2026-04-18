import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/banners — Public banner listing by position
export async function GET() {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        image: true,
        link: true,
        position: true,
        order: true,
      },
    });

    // Group by position
    const grouped = {
      FIXED_TOP: banners.filter((b) => b.position === "FIXED_TOP"),
      HERO: banners.filter((b) => b.position === "HERO"),
      LEFT: banners.filter((b) => b.position === "LEFT"),
      RIGHT_TOP: banners.filter((b) => b.position === "RIGHT_TOP"),
      RIGHT_BOTTOM: banners.filter((b) => b.position === "RIGHT_BOTTOM"),
    };

    return NextResponse.json({ success: true, data: grouped });
  } catch (error) {
    console.error("GET /api/banners error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}
