import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    if (!q || q.length < 2) return NextResponse.json({ success: true, data: [] });

    // 1. Search existing product variants
    const variants = await prisma.productVariant.findMany({
      where: {
        OR: [
          { sku: { contains: q, mode: "insensitive" } },
          { product: { name: { contains: q, mode: "insensitive" } } }
        ]
      },
      include: {
        product: true,
        attrValues: { include: { attribute: true } }
      },
      take: 15
    });

    const variantResults = variants.map(v => {
      const attrs = v.attrValues.map(av => av.value).join(" - ");
      return {
        id: v.id,
        sku: v.sku,
        name: `${v.product.name} ${attrs ? `(${attrs})` : ""}`,
        image: v.images[0] || v.product.thumbnail || "",
        price: v.price,
        stock: v.stock
      };
    });

    // 2. Find products WITHOUT variants matching the search
    //    For each, find-or-create a default variant so it can be used in promotions
    const productIdsAlreadyFound = new Set(variants.map(v => v.productId));

    const productsWithoutVariants = await prisma.product.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
        variants: { none: {} },
        id: { notIn: Array.from(productIdsAlreadyFound) }, // Avoid duplicates
      },
      take: 10,
    });

    const productResults: typeof variantResults = [];
    for (const p of productsWithoutVariants) {
      // Create a default variant for this standalone product
      const defaultSku = `DEFAULT-${p.slug}`.toUpperCase().slice(0, 50);

      // Check if default variant already exists (from previous search)
      let defaultVariant = await prisma.productVariant.findFirst({
        where: { productId: p.id, sku: defaultSku },
      });

      if (!defaultVariant) {
        defaultVariant = await prisma.productVariant.create({
          data: {
            productId: p.id,
            sku: defaultSku,
            price: p.salePrice || p.basePrice,
            stock: p.stock,
            images: p.thumbnail ? [p.thumbnail] : [],
          },
        });
      }

      productResults.push({
        id: defaultVariant.id,
        sku: defaultVariant.sku,
        name: p.name,
        image: p.thumbnail || "",
        price: defaultVariant.price,
        stock: defaultVariant.stock,
      });
    }

    const results = [...variantResults, ...productResults];

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Search variants error:", error);
    return NextResponse.json({ success: false, error: "Lỗi tìm kiếm biến thể" });
  }
}
