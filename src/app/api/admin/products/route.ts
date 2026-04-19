import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET /api/admin/products — List all products for admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { category: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          brand:    { select: { id: true, name: true } },
          _count:   { select: { variants: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin GET products error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/admin/products — Create product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, description, basePrice, salePrice, saleStartAt, saleEndAt,
      categoryId, brandId, thumbnail, images, gallery, variants
    } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ success: false, error: "Name and category are required" }, { status: 400 });
    }

    // Validation: salePrice < basePrice
    const parsedBasePrice = parseFloat(basePrice) || 0;
    const parsedSalePrice = salePrice ? parseFloat(salePrice) : null;

    if (parsedSalePrice !== null && parsedSalePrice >= parsedBasePrice) {
      return NextResponse.json({ success: false, error: "Giá khuyến mãi phải nhỏ hơn giá gốc" }, { status: 400 });
    }
    if (parsedBasePrice <= 0) {
      return NextResponse.json({ success: false, error: "Giá gốc phải lớn hơn 0" }, { status: 400 });
    }

    const slug = slugify(name);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Tên sản phẩm đã tồn tại" }, { status: 400 });
    }

    // Check for duplicate SKUs
    if (variants && variants.length > 0) {
      const skus = variants.map((v: any) => v.sku).filter(Boolean);
      if (skus.length > 0) {
        const existingVariants = await prisma.productVariant.findMany({
          where: { sku: { in: skus } },
          select: { sku: true },
        });
        if (existingVariants.length > 0) {
          const dupSkus = existingVariants.map((v) => v.sku).join(", ");
          return NextResponse.json(
            { success: false, error: `Mã SKU đã tồn tại: ${dupSkus}. Vui lòng đổi mã SKU khác.` },
            { status: 400 }
          );
        }
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        basePrice: parsedBasePrice,
        salePrice: parsedSalePrice,
        saleStartAt: saleStartAt ? new Date(saleStartAt) : null,
        saleEndAt: saleEndAt ? new Date(saleEndAt) : null,
        categoryId,
        brandId: brandId || null,
        thumbnail: thumbnail || null,
        images: images || [],
        gallery: gallery && gallery.length > 0
          ? {
              create: gallery.map((g: { url: string; alt?: string }, i: number) => ({
                url: g.url,
                alt: g.alt || null,
                order: i,
              })),
            }
          : undefined,
        variants: variants
          ? {
              create: variants.map((v: {
                sku: string; price: number; stock: number;
                images?: string[];
                attrValues?: { attributeId: string; value: string }[];
              }) => ({
                sku:    v.sku,
                price:  v.price,
                stock:  v.stock || 0,
                images: v.images || [],
                attrValues: v.attrValues
                  ? { create: v.attrValues.map((a) => ({ attributeId: a.attributeId, value: a.value })) }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        brand:    true,
        gallery:  { orderBy: { order: "asc" } },
        variants: { include: { attrValues: { include: { attribute: true } } } },
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.error("Admin POST product error:", error);
    const message = error?.message || "Failed to create product";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
