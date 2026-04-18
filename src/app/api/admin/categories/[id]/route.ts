import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// PUT /api/admin/categories/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, image, attributeIds } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update basic category info
      const category = await tx.category.update({
        where: { id },
        data: {
          name,
          slug: name ? slugify(name) : undefined,
          description,
          image,
        },
      });

      // 2. Sync attributes if provided
      if (attributeIds !== undefined) {
        // Clear existing attributes and recreate new ones
        await tx.categoryAttribute.deleteMany({ where: { categoryId: id } });
        
        if (attributeIds.length > 0) {
          await tx.categoryAttribute.createMany({
            data: attributeIds.map((attrId: string) => ({
              categoryId: id,
              attributeId: attrId
            }))
          });
        }
      }

      return category;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Admin PUT category error:", error);
    return NextResponse.json({ success: false, error: "Lỗi cập nhật danh mục" }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category has products
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        { success: false, error: `Không thể xóa danh mục đang có ${count} sản phẩm` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    console.error("Admin DELETE category error:", error);
    if (error.code === "P2003") {
      return NextResponse.json({ success: false, error: "Không thể xóa dữ liệu này vì đang có sản phẩm hoặc dữ liệu khác liên kết." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 });
  }
}
