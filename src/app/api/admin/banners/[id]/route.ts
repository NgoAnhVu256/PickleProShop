import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/banners/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, image, link, position, order, isActive, startDate, endDate } = body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        image,
        link,
        position,
        order,
        isActive,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("Admin PUT banner error:", error);
    return NextResponse.json({ success: false, error: "Failed to update banner" }, { status: 500 });
  }
}

// DELETE /api/admin/banners/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    console.error("Admin DELETE banner error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete banner" }, { status: 500 });
  }
}
