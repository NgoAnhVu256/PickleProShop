import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendOrderNotification } from "@/lib/telegram";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id, userId: session.user.id },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Only allow confirming BANK orders
    if (order.paymentMethod !== "BANK") {
      return NextResponse.json({ success: false, error: "Only BANK orders can be confirmed via this endpoint" }, { status: 400 });
    }

    // Send Telegram Notification alerting admins to check statement
    sendOrderNotification({
      orderId: order.id,
      customerName: session.user.name || "N/A",
      customerEmail: session.user.email || "N/A",
      phone: order.phone || undefined,
      isPaid: true,
      paymentMethod: "BANK",
      items: order.items.map((item) => ({
        productName: item.productVariant.product.name,
        variantSku: item.productVariant.sku,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: order.totalPrice,
      discountAmount: order.discountAmount,
    }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/orders/[id]/confirm error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
