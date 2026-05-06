import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    if (!q || q.length < 2) return NextResponse.json({ success: true, data: [] });

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
      take: 20
    });

    const results = variants.map(v => {
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

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi tìm kiếm biến thể" });
  }
}
