import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductListingClient from "./ProductListingClient";

// Disable static rendering for this page since it relies heavily on query parameters
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    brand?: string;
    category?: string;
    price?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search;
  const categorySlug = resolvedParams.category;
  const brandSlug = resolvedParams.brand;

  let title = "Tất cả sản phẩm | PicklePro";
  let description = "Khám phá bộ sưu tập vợt Pickleball và phụ kiện thi đấu chuyên nghiệp, chính hãng tại PicklePro Shop.";

  if (search) {
    title = `Tìm kiếm: "${search}" | PicklePro`;
  } else if (categorySlug) {
    const cat = await prisma.category.findFirst({
      where: { slug: categorySlug },
      select: { name: true },
    });
    if (cat) {
      title = `${cat.name} | PicklePro`;
      description = `Danh sách sản phẩm thuộc danh mục ${cat.name} tại PicklePro. Khám phá các mẫu vợt và phụ kiện chất lượng cao.`;
    }
  } else if (brandSlug) {
    const brand = await prisma.brand.findFirst({
      where: { slug: brandSlug, isActive: true },
      select: { name: true },
    });
    if (brand) {
      title = `Sản phẩm thương hiệu ${brand.name} | PicklePro`;
      description = `Mua sắm sản phẩm chính hãng thương hiệu ${brand.name} tại PicklePro. Cam kết chất lượng, bảo hành uy tín.`;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // Extract params
  const page = parseInt(resolvedParams.page || "1");
  const limit = 12;
  const categorySlug = resolvedParams.category;
  const brandSlug = resolvedParams.brand;
  const search = resolvedParams.search;
  const sort = resolvedParams.sort || "newest";
  const priceRange = resolvedParams.price;

  // Build prisma query
  const where: Record<string, any> = { isActive: true };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (brandSlug) {
    where.brand = { slug: brandSlug };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
    ];
  }

  if (priceRange) {
    const [min, max] = priceRange.split("-");
    where.basePrice = {};
    if (min) where.basePrice.gte = parseInt(min);
    if (max) where.basePrice.lte = parseInt(max);
  }

  // Sort
  let orderBy: any;
  switch (sort) {
    case "price_asc":
      orderBy = { basePrice: "asc" };
      break;
    case "price_desc":
      orderBy = { basePrice: "desc" };
      break;
    case "name_asc":
      orderBy = { name: "asc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = [{ totalSold: "desc" }, { createdAt: "desc" }];
  }

  // Execute database queries in parallel
  const [productsData, total, brands, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
        basePrice: true,
        salePrice: true,
        saleStartAt: true,
        saleEndAt: true,
        stock: true,
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        variants: {
          where: { isActive: true },
          select: { stock: true },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.brand.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // SEO: Structured data for products list
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://picklepro.vn";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tất cả sản phẩm | PicklePro",
    numberOfItems: productsData.length,
    itemListElement: productsData.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/products/${p.slug}`,
      name: p.name,
      image: p.thumbnail ? (p.thumbnail.startsWith("http") ? p.thumbnail : `${siteUrl}${p.thumbnail}`) : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ProductListingClient
        initialProducts={productsData as any}
        initialTotal={total}
        initialTotalPages={totalPages}
        brands={brands as any}
        categories={categories as any}
        searchParams={resolvedParams}
      />
    </>
  );
}
