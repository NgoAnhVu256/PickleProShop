import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Safely query a Prisma model — returns empty array if the query fails.
 */
async function safeQuery<T>(name: string, fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (err: any) {
    console.error(`[Backup] Failed to query "${name}":`, err?.message);
    return [];
  }
}

/**
 * GET /api/admin/backup
 * Export full database as JSON for backup/restore.
 */
export async function GET() {
  try {
    const users = await safeQuery("users", () =>
      prisma.user.findMany({
        select: {
          id: true, name: true, email: true, role: true,
          image: true, phone: true, createdAt: true,
        },
      })
    );
    const categories = await safeQuery("categories", () => prisma.category.findMany());
    const brands = await safeQuery("brands", () => prisma.brand.findMany());
    const products = await safeQuery("products", () => prisma.product.findMany());
    const productVariants = await safeQuery("productVariants", () => prisma.productVariant.findMany());
    const attributes = await safeQuery("attributes", () => prisma.attribute.findMany());
    const attributeValues = await safeQuery("attributeValues", () => prisma.attributeValue.findMany());
    const variantAttributeValues = await safeQuery("variantAttributeValues", () => prisma.variantAttributeValue.findMany());
    const categoryAttributes = await safeQuery("categoryAttributes", () => prisma.categoryAttribute.findMany());
    const productImages = await safeQuery("productImages", () => prisma.productImage.findMany());
    const orders = await safeQuery("orders", () => prisma.order.findMany({ include: { items: true } }));
    const orderItems = await safeQuery("orderItems", () => prisma.orderItem.findMany());
    const coupons = await safeQuery("coupons", () => prisma.coupon.findMany());
    const banners = await safeQuery("banners", () => prisma.banner.findMany());
    const announcements = await safeQuery("announcements", () => prisma.announcement.findMany());
    const settings = await safeQuery("settings", () => prisma.setting.findMany());
    const posts = await safeQuery("posts", () => prisma.post.findMany());
    const postCategories = await safeQuery("postCategories", () => prisma.postCategory.findMany());
    const feedbacks = await safeQuery("feedbacks", () => prisma.feedback.findMany());
    const feedbackBanners = await safeQuery("feedbackBanners", () => prisma.feedbackBanner.findMany());
    const promotionBanners = await safeQuery("promotionBanners", () => prisma.promotionBanner.findMany());

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
        posts: posts.length,
        feedbacks: feedbacks.length,
        settings: settings.length,
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
      { success: false, error: "Backup failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
