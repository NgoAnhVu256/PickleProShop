import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductClient from "./ProductClient";

export const revalidate = 60;

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        variants: {
          where: { isActive: true },
          include: {
            attrValues: {
              include: { attribute: { select: { name: true, label: true } } },
            },
          },
          orderBy: { price: "asc" },
        },
        gallery: { orderBy: { order: "asc" }, select: { id: true, url: true, alt: true } },
      },
    });
    if (!product || !product.isActive) return null;
    return product;
  } catch {
    return null;
  }
}

async function getProductExtras(product: any) {
  const now = new Date();
  const variantIds = product.variants.map((v: any) => v.id);
  const [categoryPromos, variantPromos, relatedProducts] = await Promise.all([
    prisma.promotionCondition.findMany({
      where: {
        categoryId: product.categoryId,
        promotion: { isActive: true, startDate: { lte: now }, OR: [{ endDate: null }, { endDate: { gte: now } }] },
      },
      select: {
        promotion: {
          select: {
            id: true, name: true,
            rewards: {
              select: {
                id: true, quantity: true, promoPrice: true,
                productVariant: {
                  select: {
                    sku: true, price: true,
                    product: { select: { id: true, name: true, slug: true, thumbnail: true } },
                    attrValues: { include: { attribute: { select: { name: true, label: true } } } },
                  },
                },
              },
            },
          },
        },
      },
      take: 5,
    }),
    variantIds.length > 0
      ? prisma.promotionCondition.findMany({
          where: {
            productVariantId: { in: variantIds },
            promotion: { isActive: true, startDate: { lte: now }, OR: [{ endDate: null }, { endDate: { gte: now } }] },
          },
          select: {
            productVariantId: true,
            promotion: {
              select: {
                id: true, name: true,
                rewards: {
                  select: {
                    id: true, quantity: true, promoPrice: true,
                    productVariant: {
                      select: {
                        sku: true, price: true,
                        product: { select: { id: true, name: true, slug: true, thumbnail: true } },
                        attrValues: { include: { attribute: { select: { name: true, label: true } } } },
                      },
                    },
                  },
                },
              },
            },
          },
          take: 10,
        })
      : [],
    prisma.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
      take: 4,
      select: { id: true, name: true, slug: true, thumbnail: true, basePrice: true, salePrice: true, saleStartAt: true, saleEndAt: true },
    }),
  ]);

  const categoryPromotionConditions = categoryPromos.map((cp: any) => ({ promotion: cp.promotion }));
  const variantPromotionMap: Record<string, any[]> = {};
  variantPromos.forEach((vp: any) => {
    if (vp.productVariantId) {
      if (!variantPromotionMap[vp.productVariantId]) variantPromotionMap[vp.productVariantId] = [];
      variantPromotionMap[vp.productVariantId].push({ promotion: vp.promotion });
    }
  });
  const enrichedVariants = product.variants.map((v: any) => ({
    ...v,
    promotionConditions: variantPromotionMap[v.id] || [],
  }));

  return {
    category: { ...product.category, promotionConditions: categoryPromotionConditions },
    variants: enrichedVariants,
    relatedProducts,
  };
}

// ─── SSR SEO: Dynamic Metadata ───
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Sản phẩm không tồn tại" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://picklepro.vn";
  const price = product.salePrice || product.basePrice;
  const priceFormatted = new Intl.NumberFormat("vi-VN").format(price);
  const brandName = product.brand?.name ? ` ${product.brand.name}` : "";
  const description = product.description
    ? product.description.replace(/<[^>]*>/g, "").slice(0, 155)
    : `Mua ${product.name}${brandName} chính hãng. Giá ${priceFormatted}đ. Giao hàng nhanh toàn quốc tại PicklePro.`;
  const ogImage = product.thumbnail
    ? (product.thumbnail.startsWith("http") ? product.thumbnail : `${siteUrl}${product.thumbnail}`)
    : `${siteUrl}/api/favicon`;

  return {
    title: `${product.name} | PicklePro`,
    description,
    alternates: { canonical: `${siteUrl}/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name}${brandName} — PicklePro`,
      description,
      images: [ogImage],
      url: `${siteUrl}/products/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | PicklePro`,
      description,
      images: [ogImage],
    },
  };
}

// ─── Server Component: SSR content + Schema JSON-LD ───
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const extras = await getProductExtras(product);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://picklepro.vn";

  const fullProduct = {
    ...product,
    category: extras.category,
    variants: extras.variants,
    relatedProducts: extras.relatedProducts,
  };

  const displayPrice = product.salePrice && product.salePrice < product.basePrice ? product.salePrice : product.basePrice;

  // JSON-LD Product Schema
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.thumbnail ? `${siteUrl}${product.thumbnail}` : undefined,
    description: product.description?.replace(/<[^>]*>/g, "").slice(0, 300) || `${product.name} - PicklePro`,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    category: product.category.name,
    sku: product.variants[0]?.sku || product.slug,
    offers: product.variants.length > 0
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "VND",
          lowPrice: Math.min(...product.variants.map((v: any) => v.price)),
          highPrice: Math.max(...product.variants.map((v: any) => v.price)),
          offerCount: product.variants.length,
          availability: product.variants.some((v: any) => v.stock > 0)
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: "PicklePro" },
        }
      : {
          "@type": "Offer",
          priceCurrency: "VND",
          price: displayPrice,
          availability: (product.stock || 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: "PicklePro" },
        },
  };

  // BreadcrumbList Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Sản phẩm", item: `${siteUrl}/products` },
      { "@type": "ListItem", position: 3, name: product.category.name, item: `${siteUrl}/category/${product.category.slug}` },
      { "@type": "ListItem", position: 4, name: product.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProductClient product={JSON.parse(JSON.stringify(fullProduct))} />
    </>
  );
}
