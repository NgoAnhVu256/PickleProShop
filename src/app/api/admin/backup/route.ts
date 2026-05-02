import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * GET /api/admin/backup
 * Export full database as JSON for backup/restore.
 * Returns a downloadable JSON file with all tables.
 */
export async function GET() {
  try {
    // Fetch all tables in parallel
    const [
      users,
      categories,
      brands,
      products,
      variants,
      attributes,
      attributeValues,
      orders,
      orderItems,
      coupons,
      banners,
      announcements,
      settings,
      posts,
      postCategories,
      feedbacks,
      feedbackBanners,
      promotionBanners,
    ] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, image: true, phone: true, address: true, createdAt: true } }),
      prisma.category.findMany(),
      prisma.brand.findMany(),
      prisma.product.findMany({ include: { variants: { include: { attrValues: true } } } }),
      prisma.variant.findMany({ include: { attrValues: true } }),
      prisma.attribute.findMany(),
      prisma.attributeValue.findMany(),
      prisma.order.findMany({ include: { items: true } }),
      prisma.orderItem.findMany(),
      prisma.coupon.findMany(),
      prisma.banner.findMany(),
      prisma.announcement.findMany(),
      prisma.setting.findMany(),
      safeQuery(() => prisma.post.findMany()),
      safeQuery(() => prisma.postCategory.findMany()),
      safeQuery(() => prisma.feedback.findMany()),
      safeQuery(() => prisma.feedbackBanner.findMany()),
      safeQuery(() => prisma.promotionBanner.findMany()),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      database: "picklepro",
      tables: {
        users,
        categories,
        brands,
        products,
        variants,
        attributes,
        attributeValues,
        orders,
        orderItems,
        coupons,
        banners,
        announcements,
        settings,
        posts,
        postCategories,
        feedbacks,
        feedbackBanners,
        promotionBanners,
      },
      summary: {
        users: users.length,
        categories: categories.length,
        brands: brands.length,
        products: products.length,
        variants: variants.length,
        orders: orders.length,
        banners: banners.length,
        announcements: announcements.length,
        settings: settings.length,
      },
    };

    const json = JSON.stringify(backup, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="picklepro-backup-${timestamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Backup error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Backup failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}

/** Safe query helper — returns empty array if table doesn't exist */
async function safeQuery<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch {
    return [];
  }
}
