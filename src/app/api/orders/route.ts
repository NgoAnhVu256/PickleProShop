import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendOrderNotification } from "@/lib/telegram";

// Rate limiter for order creation (anti-DoS)
const orderRateMap = new Map<string, { count: number; resetTime: number }>();
function checkOrderRate(userId: string): boolean {
  const now = Date.now();
  const entry = orderRateMap.get(userId);
  if (!entry || now > entry.resetTime) {
    orderRateMap.set(userId, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

// GET /api/orders — Get user's orders
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: { select: { name: true, slug: true, images: true } },
                attrValues: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders — Create new order
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!checkOrderRate(session.user.id)) {
      return NextResponse.json(
        { success: false, error: "Bạn đang đặt hàng quá nhanh. Vui lòng chờ 1 phút." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { items, phone, address, province, district, ward, note, paymentMethod, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Validate stock and get prices
    const variantIds = items.map((i: { variantId: string }) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: { select: { name: true } },
        attrValues: true,
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Verify all variants exist and have stock
    for (const item of items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        return NextResponse.json(
          { success: false, error: `Variant ${item.variantId} not found` },
          { status: 400 }
        );
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${variant.product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate raw subtotal
    let subtotal = items.reduce((sum: number, item: { variantId: string; quantity: number }) => {
      const variant = variantMap.get(item.variantId)!;
      return sum + variant.price * item.quantity;
    }, 0);

    // Apply Coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      });

      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) &&
        (coupon.limit === null || coupon.usedCount < coupon.limit) &&
        subtotal >= coupon.minOrderValue
      ) {
        if (coupon.type === "FIXED") {
          discountAmount = coupon.value;
        } else if (coupon.type === "PERCENT") {
          discountAmount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        }
        if (discountAmount > subtotal) discountAmount = subtotal;
      }
    }

    const totalPrice = subtotal - discountAmount;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalPrice,
          phone: phone || null,
          address: address || null,
          province: province || null,
          district: district || null,
          ward: ward || null,
          note: note || null,
          paymentMethod: paymentMethod || "COD",
          couponCode: couponCode || null,
          discountAmount: discountAmount,
          items: {
            create: items.map((item: { variantId: string; quantity: number }) => ({
              productVariantId: item.variantId,
              quantity: item.quantity,
              price: variantMap.get(item.variantId)!.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: { select: { name: true } },
                  attrValues: true,
                },
              },
            },
          },
        },
      });

      // Decrease stock
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Increment coupon usage
      if (couponCode && discountAmount > 0) {
        await tx.coupon.update({
          where: { code: couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Update User phone auto-fill logic
      if (phone) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { phone }
        });
      }

      return newOrder;
    });

    // Send Telegram notification ONLY for COD. For BANK, wait until payment confirmed.
    if (order.paymentMethod === "COD") {
      sendOrderNotification({
        orderId: order.id,
        customerName: session.user.name || "N/A",
        customerEmail: session.user.email || "N/A",
        phone: phone,
        isPaid: false,
        paymentMethod: "COD",
        items: order.items.map((item) => ({
          productName: item.productVariant.product.name,
          variantSku: item.productVariant.sku,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: order.totalPrice,
        discountAmount: order.discountAmount,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
