import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/announcements/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(body.content !== undefined && { content: body.content }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.buttonText !== undefined && { buttonText: body.buttonText }),
        ...(body.link !== undefined && { link: body.link }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      },
    });

    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error("Admin PUT announcement error:", error);
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/admin/announcements/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    console.error("Admin DELETE announcement error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
