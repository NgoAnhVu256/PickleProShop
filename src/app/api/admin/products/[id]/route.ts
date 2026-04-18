import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET /api/admin/products/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            categoryAttrs: {
              include: { attribute: true },
              orderBy: { displayOrder: "asc" }
            }
          }
        },
        brand: true,
        gallery: { orderBy: { order: "asc" } },
        variants: {
          include: {
            attrValues: {
              include: { attribute: true }
            }
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Admin GET product error:", error);
    return NextResponse.json({ success: false, error: "Lỗi tải dữ liệu sản phẩm" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name, description, basePrice, salePrice, saleStartAt, saleEndAt,
      categoryId, brandId, thumbnail, images, isActive, gallery, variants
    } = body;

    // Pricing validation
    const parsedBasePrice = basePrice !== undefined ? (typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice) : undefined;
    const parsedSalePrice = salePrice !== undefined ? (salePrice === "" || salePrice === null ? null : parseFloat(salePrice)) : undefined;

    if (parsedBasePrice !== undefined && parsedSalePrice !== undefined && parsedSalePrice !== null) {
      if (parsedSalePrice >= parsedBasePrice) {
        return NextResponse.json({ success: false, error: "Giá khuyến mãi phải nhỏ hơn giá gốc" }, { status: 400 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update product fields
      const updateData: any = {};
      if (name !== undefined) { updateData.name = name; updateData.slug = slugify(name); }
      if (description !== undefined) updateData.description = description;
      if (parsedBasePrice !== undefined) updateData.basePrice = parsedBasePrice;
      if (parsedSalePrice !== undefined) updateData.salePrice = parsedSalePrice;
      if (saleStartAt !== undefined) updateData.saleStartAt = saleStartAt ? new Date(saleStartAt) : null;
      if (saleEndAt !== undefined) updateData.saleEndAt = saleEndAt ? new Date(saleEndAt) : null;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (brandId !== undefined) updateData.brandId = brandId || null;
      if (thumbnail !== undefined) updateData.thumbnail = thumbnail || null;
      if (images !== undefined) updateData.images = images;
      if (isActive !== undefined) updateData.isActive = isActive;

      const product = await tx.product.update({
        where: { id },
        data: updateData,
      });

      // 2. Sync gallery images if provided
      if (gallery !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (gallery.length > 0) {
          await tx.productImage.createMany({
            data: gallery.map((g: { url: string; alt?: string }, i: number) => ({
              productId: id,
              url: g.url,
              alt: g.alt || null,
              order: i,
            })),
          });
        }
      }

      // 3. Sync variants if provided
      if (variants) {
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
          select: { id: true, sku: true }
        });

        const newSkus = variants.map((v: any) => v.sku);
        const variantsToDelete = existingVariants.filter(v => !newSkus.includes(v.sku));

        if (variantsToDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: variantsToDelete.map(v => v.id) } }
          });
        }

        for (const v of variants) {
          const variantData = {
            sku: v.sku,
            price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
            stock: typeof v.stock === 'string' ? parseInt(v.stock) : v.stock,
            images: v.images || [],
            isActive: v.isActive !== undefined ? v.isActive : true,
          };

          await tx.productVariant.upsert({
            where: { sku: v.sku },
            create: {
              ...variantData,
              productId: id,
              attrValues: v.attrValues ? {
                create: v.attrValues.map((av: any) => ({
                  attributeId: av.attributeId,
                  value: av.value
                }))
              } : undefined
            },
            update: {
              ...variantData,
              attrValues: v.attrValues ? {
                deleteMany: {},
                create: v.attrValues.map((av: any) => ({
                  attributeId: av.attributeId,
                  value: av.value
                }))
              } : undefined
            }
          });
        }
      }

      return product;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Admin PUT product error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "SKU hoặc Slug này đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || "Lỗi cập nhật sản phẩm" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm" });
  } catch (error: any) {
    console.error("Admin DELETE product error:", error);
    if (error.code === "P2003") {
      return NextResponse.json({ success: false, error: "Không thể xóa sản phẩm này vì đã có khách hàng đặt mua (liên kết với hệ thống Đơn hàng). Hãy chuyển sang chế độ Ẩn thay vì xóa!" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Lỗi xóa sản phẩm" }, { status: 500 });
  }
}
