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
    // Fetch all tables in parallel — using exact Prisma model names
    const [
      users,
      categories,
      brands,
      products,
      productVariants,
      attributes,
      attributeValues,
      variantAttributeValues,
      categoryAttributes,
      productImages,
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
      prisma.user.findMany({
        select: {
          id: true, name: true, email: true, role: true,
          image: true, phone: true, createdAt: true,
        },
      }),
      prisma.category.findMany(),
      prisma.brand.findMany(),
      prisma.product.findMany(),
      prisma.productVariant.findMany(),
      prisma.attribute.findMany(),
      prisma.attributeValue.findMany(),
      prisma.variantAttributeValue.findMany(),
      prisma.categoryAttribute.findMany(),
      prisma.productImage.findMany(),
      prisma.order.findMany({ include: { items: true } }),
      prisma.orderItem.findMany(),
      prisma.coupon.findMany(),
      prisma.banner.findMany(),
      prisma.announcement.findMany(),
      prisma.setting.findMany(),
      prisma.post.findMany(),
      prisma.postCategory.findMany(),
      prisma.feedback.findMany(),
      prisma.feedbackBanner.findMany(),
      prisma.promotionBanner.findMany(),
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
        productVariants,
        attributes,
        attributeValues,
        variantAttributeValues,
        categoryAttributes,
        productImages,
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
        productVariants: productVariants.length,
        orders: orders.length,
        coupons: coupons.length,
        banners: banners.length,
        announcements: announcements.length,
        settings: settings.length,
        posts: posts.length,
        feedbacks: feedbacks.length,
        promotionBanners: promotionBanners.length,
      },
    };

    const json = JSON.stringify(backup, null, 2);
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);

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
      {
        success: false,
        error: "Backup failed: " + (error?.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}
