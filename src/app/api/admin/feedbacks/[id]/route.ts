import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/feedbacks/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const feedback = await prisma.feedback.findUnique({ where: { id } });
    if (!feedback) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    // Mark as read
    if (!feedback.isRead) {
      await prisma.feedback.update({ where: { id }, data: { isRead: true } });
    }
    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

// PUT /api/admin/feedbacks/:id — Update status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["NEW", "REVIEWED", "RESOLVED"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: { status, isRead: true },
    });

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/admin/feedbacks/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.feedback.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
