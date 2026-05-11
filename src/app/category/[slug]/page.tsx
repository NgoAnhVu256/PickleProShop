import HomeHeader from '@/components/shop/HomeHeader';
import Footer from '@/components/shop/Footer';
import CategoryProductFilter from '@/components/shop/CategoryProductFilter';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

// ISR: pre-render & revalidate every 60s for near-instant loads
export const revalidate = 60;

// SEO: Dynamic metadata for each category page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug }, select: { name: true, slug: true } });
  if (!category) return { title: "Danh mục không tồn tại" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://picklepro.vn";
  return {
    title: `${category.name} — Mua chính hãng giá tốt | PicklePro`,
    description: `Mua ${category.name} Pickleball chính hãng, giá tốt nhất tại PicklePro. Giao hàng nhanh toàn quốc, đảm bảo chất lượng.`,
    keywords: [`${category.name}`, `${category.name} Pickleball`, `mua ${category.name}`, 'PicklePro', 'Pickleball chính hãng'],
    alternates: { canonical: `${siteUrl}/category/${category.slug}` },
    openGraph: {
      title: `${category.name} — PicklePro`,
      description: `Khám phá bộ sưu tập ${category.name} Pickleball chính hãng tại PicklePro.`,
      url: `${siteUrl}/category/${category.slug}`,
    },
  };
}

async function getCategoryData(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
            basePrice: true,
            salePrice: true,
            stock: true,
            brandId: true,
            brand: { select: { id: true, name: true } },
            variants: { where: { isActive: true }, select: { stock: true } },
          },
        },
      },
    });
  } catch (error) {
    return null;
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const category = await getCategoryData(slug);
  const settings = await getSiteSettings();

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Danh mục không tồn tại</h1>
          <Link href="/" className="text-[#7DAACB] font-bold">Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://picklepro.vn";

  // JSON-LD BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      { "@type": "ListItem", position: 2, name: category.name },
    ],
  };

  // JSON-LD ItemList Schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    numberOfItems: category.products.length,
    itemListElement: category.products.slice(0, 20).map((p: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/products/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <HomeHeader />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-6 md:mb-8">
          <Link href="/" className="hover:text-[#7DAACB]">Trang chủ</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900">{category.name}</span>
        </div>

        {/* Title & Stats */}
        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
            {category.name}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {category.description || `Khám phá bộ sưu tập ${category.name} mới nhất tại PicklePro.`}
          </p>
        </div>

        {/* Client-side filter component */}
        <CategoryProductFilter products={category.products as any} categoryName={category.name} />
      </main>

      <Footer settings={settings} />
    </div>
  );
}
