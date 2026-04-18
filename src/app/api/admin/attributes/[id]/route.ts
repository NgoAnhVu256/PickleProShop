import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/attributes/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, label, type } = body;
    
    const attr = await prisma.attribute.update({
      where: { id },
      data: { 
        name: name.toLowerCase().trim(), 
        label: label.trim(), 
        type 
      },
    });
    return NextResponse.json({ success: true, data: attr });
  } catch (e: any) {
    console.error("PUT Attribute Error:", e);
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "Tên technical này đã tồn tại" }, { status: 409 });
    return NextResponse.json({ success: false, error: "Lỗi cập nhật thuộc tính" }, { status: 500 });
  }
}

// DELETE /api/admin/attributes/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Check if attribute is in use
    const count = await prisma.variantAttributeValue.count({
      where: { attributeId: id },
    });
    
    if (count > 0) {
      return NextResponse.json(
        { success: false, error: `Không thể xóa — còn ${count} biến thể đang dùng thuộc tính này` },
        { status: 409 }
      );
    }
    
    await prisma.attribute.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Attribute Error:", error);
    return NextResponse.json({ success: false, error: "Lỗi xóa thuộc tính" }, { status: 500 });
  }
}
