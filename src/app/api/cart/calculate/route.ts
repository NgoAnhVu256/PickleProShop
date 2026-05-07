import { NextRequest, NextResponse } from "next/server";
import { calculateCart, type CartInputItem } from "@/lib/promotionEngine";

/**
 * POST /api/cart/calculate
 * 
 * Nhận danh sách items trong giỏ hàng, trả về kết quả đã tính toán
 * bao gồm quà tặng, giảm giá, và tổng cộng.
 * 
 * Body: { items: [{ variantId: string, quantity: number }] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: CartInputItem[] = body.items || [];

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          subTotal: 0,
          discountTotal: 0,
          giftTotal: 0,
          finalTotal: 0,
          appliedPromotions: [],
        },
      });
    }

    const result = await calculateCart(items);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[cart/calculate] Error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tính toán giỏ hàng" },
      { status: 500 }
    );
  }
}
