import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/banners — Public banner listing by position
// Supports ?position=POPUP to filter by specific position
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const positionFilter = searchParams.get("position");
    const now = new Date();

    const where: Record<string, unknown> = {
      isActive: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    };

    // If a specific position is requested, filter by it
    if (positionFilter) {
      where.position = positionFilter;
    }

    const banners = await prisma.banner.findMany({
      where,
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

    // If filtering by specific position, return flat array
    if (positionFilter) {
      return NextResponse.json({ success: true, data: banners });
    }

    // Otherwise group by position (legacy behavior)
    const grouped = {
      FIXED_TOP: banners.filter((b) => b.position === "FIXED_TOP"),
      HERO: banners.filter((b) => b.position === "HERO"),
      LEFT: banners.filter((b) => b.position === "LEFT"),
      RIGHT_TOP: banners.filter((b) => b.position === "RIGHT_TOP"),
      RIGHT_BOTTOM: banners.filter((b) => b.position === "RIGHT_BOTTOM"),
      POPUP: banners.filter((b) => b.position === "POPUP"),
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
