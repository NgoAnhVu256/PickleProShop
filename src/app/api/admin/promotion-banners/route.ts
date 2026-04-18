import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — list all promotion banners
export async function GET() {
  try {
    const banners = await prisma.promotionBanner.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error("Error fetching promotion banners:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

// POST — create a new promotion banner
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, image, link, isActive, startDate, endDate } = body;

    if (!title || !image) {
      return NextResponse.json({ success: false, error: "Tiêu đề và hình ảnh là bắt buộc" }, { status: 400 });
    }

    // Auto-assign next order
    const maxOrder = await prisma.promotionBanner.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const banner = await prisma.promotionBanner.create({
      data: {
        title,
        image,
        link: link || null,
        order: nextOrder,
        isActive: isActive !== false,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ success: true, data: banner });
  } catch (error: any) {
    console.error("Error creating promotion banner:", error);
    return NextResponse.json({ success: false, error: "Lỗi tạo banner: " + (error.message || "Unknown error") }, { status: 500 });
  }
}

// PUT — bulk update order / reorder
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { banners } = body; // [{ id, order }]

    if (!Array.isArray(banners)) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    await prisma.$transaction(
      banners.map((b: { id: string; order: number }) =>
        prisma.promotionBanner.update({
          where: { id: b.id },
          data: { order: b.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering:", error);
    return NextResponse.json({ success: false, error: "Failed to reorder" }, { status: 500 });
  }
}
