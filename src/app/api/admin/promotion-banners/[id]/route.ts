import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT — update a single promotion banner
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, image, link, isActive, startDate, endDate } = body;

    const banner = await prisma.promotionBanner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(image !== undefined && { image }),
        ...(link !== undefined && { link: link || null }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("Error updating promotion banner:", error);
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}

// DELETE — remove a promotion banner
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.promotionBanner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promotion banner:", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
