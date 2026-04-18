import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// PUT /api/admin/brands/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, logo } = body;
    const slug = toSlug(name);
    const brand = await prisma.brand.update({
      where: { id },
      data: { name: name.trim(), slug, logo: logo || null },
    });
    return NextResponse.json({ success: true, data: brand });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "Slug đã tồn tại" }, { status: 409 });
    if (e.code === "P2003") return NextResponse.json({ success: false, error: "Không thể cập nhật vì đang có sản phẩm liên kết" }, { status: 400 });
    return NextResponse.json({ success: false, error: "Lỗi cập nhật" }, { status: 500 });
  }
}

// DELETE /api/admin/brands/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Check if brand has products
    const count = await prisma.product.count({ where: { brandId: id } });
    if (count > 0) {
      return NextResponse.json(
        { success: false, error: `Không thể xóa — còn ${count} sản phẩm đang dùng thương hiệu này` },
        { status: 409 }
      );
    }
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Lỗi xóa" }, { status: 500 });
  }
}
