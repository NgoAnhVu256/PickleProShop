import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const promotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        conditions: {
          include: {
            productVariant: {
              include: {
                product: { select: { id: true, name: true, thumbnail: true } },
                attrValues: { include: { attribute: { select: { name: true, label: true } } } },
              },
            },
            category: { select: { id: true, name: true } },
          },
        },
        rewards: {
          include: {
            productVariant: {
              include: {
                product: { select: { id: true, name: true, thumbnail: true } },
                attrValues: { include: { attribute: { select: { name: true, label: true } } } },
              },
            },
          },
        },
      },
    });

    if (!promotion) return NextResponse.json({ success: false, error: "Không tìm thấy" }, { status: 404 });
    return NextResponse.json({ success: true, data: promotion });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Support partial updates (like toggling isActive)
    if (Object.keys(body).length === 1 && body.isActive !== undefined) {
      await prisma.promotion.update({
        where: { id },
        data: { isActive: body.isActive },
      });
      return NextResponse.json({ success: true });
    }

    // Full update requires deleting existing conditions/rewards and recreating them
    const { name, isActive, startDate, endDate, conditions, rewards } = body;
    
    await prisma.$transaction(async (tx) => {
      await tx.promotionCondition.deleteMany({ where: { promotionId: id } });
      await tx.promotionReward.deleteMany({ where: { promotionId: id } });
      
      await tx.promotion.update({
        where: { id },
        data: {
          name, isActive, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null,
          conditions: {
            create: conditions.map((c: any) => ({
              productVariantId: c.productVariantId || null,
              categoryId: c.categoryId || null,
            })),
          },
          rewards: {
            create: rewards.map((r: any) => ({
              productVariantId: r.productVariantId,
              quantity: r.quantity || 1,
              promoPrice: r.promoPrice || 0,
            })),
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Lỗi lưu dữ liệu" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi xóa dữ liệu" }, { status: 500 });
  }
}
