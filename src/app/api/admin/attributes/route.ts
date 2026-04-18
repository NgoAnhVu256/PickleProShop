import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/attributes
export async function GET() {
  try {
    const attributes = await prisma.attribute.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { variantValues: true } } },
    });
    return NextResponse.json({ success: true, data: attributes });
  } catch (e: any) {
    console.error("Admin GET attributes error:", e);
    return NextResponse.json({ success: false, error: e.message || "Lỗi tải thuộc tính" }, { status: 500 });
  }
}

// POST /api/admin/attributes
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, label, type } = body;
    if (!name || !label) {
      return NextResponse.json({ success: false, error: "Tên và nhãn là bắt buộc" }, { status: 400 });
    }
    const attr = await prisma.attribute.create({
      data: { name: name.toLowerCase().trim(), label: label.trim(), type: type ?? "TEXT" },
    });
    return NextResponse.json({ success: true, data: attr }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "Tên thuộc tính đã tồn tại" }, { status: 409 });
    return NextResponse.json({ success: false, error: "Lỗi tạo thuộc tính" }, { status: 500 });
  }
}
