import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/dashboard — Stats for admin dashboard
export async function GET() {
  try {
    const [totalProducts, totalOrders, totalUsers, recentOrders, revenue] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        _sum: { totalPrice: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: revenue._sum.totalPrice || 0,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
