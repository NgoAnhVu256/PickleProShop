import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/:slug — Public product detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Parallel: fetch product + promotions separately to avoid mega-nested query
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { 
          select: { id: true, name: true, slug: true }
        },
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
          select: { id: true, url: true, alt: true },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch promotions separately (lighter query, only for active promotions)
    const now = new Date();
    const variantIds = product.variants.map(v => v.id);

    const [categoryPromos, variantPromos, relatedProducts] = await Promise.all([
      // Category-level promotions
      prisma.promotionCondition.findMany({
        where: {
          categoryId: product.categoryId,
          promotion: { isActive: true, startDate: { lte: now }, OR: [{ endDate: null }, { endDate: { gte: now } }] },
        },
        select: {
          promotion: {
            select: {
              id: true,
              name: true,
              rewards: {
                select: {
                  id: true,
                  quantity: true,
                  promoPrice: true,
                  productVariant: {
                    select: {
                      sku: true,
                      price: true,
                      product: { select: { id: true, name: true, slug: true, thumbnail: true } },
                      attrValues: { include: { attribute: { select: { name: true, label: true } } } },
                    },
                  },
                },
              },
            },
          },
        },
        take: 5,
      }),

      // Variant-level promotions
      variantIds.length > 0
        ? prisma.promotionCondition.findMany({
            where: {
              productVariantId: { in: variantIds },
              promotion: { isActive: true, startDate: { lte: now }, OR: [{ endDate: null }, { endDate: { gte: now } }] },
            },
            select: {
              productVariantId: true,
              promotion: {
                select: {
                  id: true,
                  name: true,
                  rewards: {
                    select: {
                      id: true,
                      quantity: true,
                      promoPrice: true,
                      productVariant: {
                        select: {
                          sku: true,
                          price: true,
                          product: { select: { id: true, name: true, slug: true, thumbnail: true } },
                          attrValues: { include: { attribute: { select: { name: true, label: true } } } },
                        },
                      },
                    },
                  },
                },
              },
            },
            take: 10,
          })
        : [],

      // Related products (lightweight)
      prisma.product.findMany({
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
      }),
    ]);

    // Attach promotions to the response
    const categoryPromotionConditions = categoryPromos.map(cp => ({
      promotion: cp.promotion,
    }));

    const variantPromotionMap: Record<string, any[]> = {};
    variantPromos.forEach(vp => {
      if (vp.productVariantId) {
        if (!variantPromotionMap[vp.productVariantId]) {
          variantPromotionMap[vp.productVariantId] = [];
        }
        variantPromotionMap[vp.productVariantId].push({
          promotion: vp.promotion,
        });
      }
    });

    const enrichedVariants = product.variants.map(v => ({
      ...v,
      promotionConditions: variantPromotionMap[v.id] || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        category: {
          ...product.category,
          promotionConditions: categoryPromotionConditions,
        },
        variants: enrichedVariants,
        relatedProducts,
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
