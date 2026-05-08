import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products — Public product listing with pagination + filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 48);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where: Record<string, unknown> = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (brand) {
      where.brand = { slug: brand };
    }

    // Optimized: removed description search (heavy text scan)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
      ];
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) (where.basePrice as Record<string, number>).gte = parseInt(minPrice);
      if (maxPrice) (where.basePrice as Record<string, number>).lte = parseInt(maxPrice);
    }

    let orderBy: Record<string, string> | Record<string, string>[];
    switch (sort) {
      case "price_asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price_desc":
        orderBy = { basePrice: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      default:
        // Default: popular first, then newest
        orderBy = [{ totalSold: "desc" }, { createdAt: "desc" }];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        // Use select instead of include — fetch only what ProductCard needs
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          basePrice: true,
          salePrice: true,
          saleStartAt: true,
          saleEndAt: true,
          stock: true,
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          // Only fetch stock from variants — no attrValues, no images
          variants: {
            where: { isActive: true },
            select: { stock: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
