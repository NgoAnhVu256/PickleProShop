import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, orderValue } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập mã ưu đãi" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return NextResponse.json({ success: false, error: "Mã ưu đãi không tồn tại" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ success: false, error: "Mã ưu đãi đã bị vô hiệu hóa" }, { status: 400 });
    }

    if (coupon.limit !== null && coupon.usedCount >= coupon.limit) {
      return NextResponse.json({ success: false, error: "Mã ưu đãi đã hết lượt sử dụng" }, { status: 400 });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ success: false, error: "Mã ưu đãi đã quá hạn sử dụng" }, { status: 400 });
    }

    if (orderValue < coupon.minOrderValue) {
      return NextResponse.json({ 
        success: false, 
        error: `Đơn hàng tối thiểu để áp dụng mã này là ${coupon.minOrderValue.toLocaleString()}₫` 
      }, { status: 400 });
    }

    // Calculate exact discount amount for preview
    let discountAmount = 0;
    if (coupon.type === "FIXED") {
      discountAmount = coupon.value;
    } else if (coupon.type === "PERCENT") {
      discountAmount = (orderValue * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }

    // Don't discount more than the order value itself
    if (discountAmount > orderValue) {
      discountAmount = orderValue;
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        code: coupon.code,
        discountAmount: discountAmount
      }
    });
  } catch (error) {
    console.error("POST /api/coupons/check error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống khi kiểm tra mã" },
      { status: 500 }
    );
  }
}
