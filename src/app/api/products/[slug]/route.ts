import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/:slug — Public product detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        variants: {
          where: { isActive: true },
          include: {
            attrValues: {
              include: {
                attribute: { select: { name: true, label: true } },
              },
            },
          },
          orderBy: { price: "asc" },
        },
        gallery: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Get related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: product.id },
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
        basePrice: true,
        salePrice: true,
        saleStartAt: true,
        saleEndAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { ...product, relatedProducts },
    });
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
