import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const promotions = await prisma.promotion.findMany({
      include: {
        conditions: { include: { productVariant: { include: { product: true } }, category: true } },
        rewards: { include: { productVariant: { include: { product: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: promotions });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi lấy danh sách promotion" });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, isActive, startDate, endDate, conditions, rewards, priority, description, stackable } = body;

    if (!name || conditions.length === 0 || rewards.length === 0) {
      return NextResponse.json({ success: false, error: "Thiếu dữ liệu bắt buộc" });
    }

    const promotion = await prisma.promotion.create({
      data: {
        name,
        description: description || null,
        isActive,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        priority: parseInt(priority) || 0,
        stackable: !!stackable,
        conditions: {
          create: conditions.map((c: any) => ({
            productVariantId: c.productVariantId || null,
            categoryId: c.categoryId || null,
          }))
        },
        rewards: {
          create: rewards.map((r: any) => ({
            productVariantId: r.productVariantId,
            quantity: parseInt(r.quantity) || 1,
            promoPrice: parseFloat(r.promoPrice) || 0,
            discountType: r.discountType || "FREE",
            discountValue: parseFloat(r.discountValue) || 0,
          }))
        }
      }
    });

    return NextResponse.json({ success: true, data: promotion });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi tạo chương trình khuyến mãi" });
  }
}
