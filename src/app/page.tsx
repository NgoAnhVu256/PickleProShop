import { Suspense } from 'react';
import HomeHeader from '@/components/shop/HomeHeader';
import TopBanner from '@/components/shop/TopBanner';
import BannerGrid from '@/components/shop/BannerGrid';
import PromotionCarousel from '@/components/shop/PromotionCarousel';
import ProductCard from "@/components/shop/ProductCard";
import Footer from "@/components/shop/Footer";
import { Globe, Package } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import { unstable_cache } from 'next/cache';

// ─── CACHED DATA FETCHERS (revalidate every 60s instead of every request) ───

const getCachedBanners = unstable_cache(
  async () => {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, image: true, link: true, position: true, order: true },
    });
    return {
      FIXED_TOP: banners.filter(b => b.position === 'FIXED_TOP'),
      HERO: banners.filter(b => b.position === 'HERO'),
      LEFT: banners.filter(b => b.position === 'LEFT'),
      RIGHT_TOP: banners.filter(b => b.position === 'RIGHT_TOP'),
      RIGHT_BOTTOM: banners.filter(b => b.position === 'RIGHT_BOTTOM'),
      BOTTOM: banners.filter(b => b.position === 'BOTTOM'),
    };
  },
  ['home-banners'],
  { revalidate: 60 }
);

const getCachedCategories = unstable_cache(
  async () => prisma.category.findMany({
    where: { parentId: null },
    take: 6,
    select: { id: true, name: true, slug: true, image: true },
  }),
  ['home-categories'],
  { revalidate: 120 }
);

const getCachedProducts = unstable_cache(
  async () => prisma.product.findMany({
    take: 10,
    where: { isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: 'desc' },
  }),
  ['home-products'],
  { revalidate: 60 }
);

const getCachedPromotions = unstable_cache(
  async () => prisma.promotionBanner.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, image: true, link: true, order: true },
  }),
  ['home-promotions'],
  { revalidate: 120 }
);

const getCachedPosts = unstable_cache(
  async () => prisma.post.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      id: true, title: true, slug: true, image: true, excerpt: true,
      category: { select: { name: true } },
    },
  }),
  ['home-posts'],
  { revalidate: 120 }
);

// ─── SKELETON LOADERS ───

function CategorySkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="h-9 w-64 bg-gray-100 rounded-lg mx-auto mb-8 animate-pulse" />
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-[130px] md:w-[160px]">
            <div className="w-full aspect-square bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-4 w-20 bg-gray-100 rounded mt-4 mx-auto animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductsSkeleton() {
  return (
    <section className="bg-gray-50 py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-9 w-80 bg-gray-200 rounded-lg mx-auto mb-8 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100">
              <div className="aspect-[4/5] bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded mt-3 animate-pulse" />
              <div className="h-5 w-1/2 bg-gray-100 rounded mt-2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PostsSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="h-9 w-56 bg-gray-100 rounded-lg mx-auto mb-10 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[16/9] bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-5 w-3/4 bg-gray-100 rounded mt-4 animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── ASYNC SERVER SECTIONS (streamed independently) ───

async function CategorySection() {
  const categories = await getCachedCategories();
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 uppercase tracking-tight text-center">Danh mục sản phẩm</h2>
      {categories.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="flex flex-col items-center gap-4 group w-[130px] md:w-[160px]">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:shadow-md transition-shadow">
                <img src={cat.image || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Category'} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
              </div>
              <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="w-full py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
          <Package className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm font-medium">Danh mục đang được cập nhật...</p>
        </div>
      )}
    </section>
  );
}

async function FeaturedProductsSection() {
  const products = await getCachedProducts();
  return (
    <section className="bg-gray-50 py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-center">Sản phẩm Pickleball Nổi bật</h2>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map((prod: any) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="w-full py-20 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <Package className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm font-medium">Sản phẩm đang được cập nhật...</p>
          </div>
        )}
      </div>
    </section>
  );
}

async function LatestPostsSection() {
  const posts = await getCachedPosts();
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <h2 className="text-2xl md:text-3xl font-black mb-8 md:mb-10 uppercase tracking-tight text-center">Tin tức mới nhất</h2>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="flex flex-col gap-4 group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[16/9]">
                <img
                  src={post.image || 'https://images.unsplash.com/photo-1551773188-0801da13dfae?q=80&w=600'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-[#7DAACB]">
                  {post.category?.name}
                </div>
              </div>
              <div>
                <h3 className="text-[15px] md:text-base font-bold mb-2 group-hover:text-[#7DAACB] transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="w-full py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
          <Globe className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm font-medium">Tin tức đang được cập nhật...</p>
        </div>
      )}
    </section>
  );
}

async function BottomBannerSection() {
  const banners = await getCachedBanners();
  if (!banners?.BOTTOM || banners.BOTTOM.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-20">
      {banners.BOTTOM.map((b: any) => (
        <Link key={b.id} href={b.link || "#"} className="block rounded-2xl md:rounded-3xl overflow-hidden group shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4 last:mb-0">
          <img
            src={b.image}
            alt={b.title}
            className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </Link>
      ))}
    </section>
  );
}

// ─── MAIN PAGE (Header/Banner streamed first, rest follows) ───

export default async function HomePage() {
  // Critical above-fold data — fetched immediately (parallel)
  const [banners, settings, promotionBanners] = await Promise.all([
    getCachedBanners(),
    getSiteSettings(),
    getCachedPromotions(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* ABOVE THE FOLD — renders immediately */}
      <TopBanner banners={banners?.FIXED_TOP} />
      <HomeHeader settings={settings} />
      
      <main className="pb-20">
        <BannerGrid banners={banners} />
        <PromotionCarousel promotions={promotionBanners} />

        {/* BELOW THE FOLD — each section streams independently */}
        <Suspense fallback={<CategorySkeleton />}>
          <CategorySection />
        </Suspense>

        <Suspense fallback={<ProductsSkeleton />}>
          <FeaturedProductsSection />
        </Suspense>

        <Suspense fallback={<PostsSkeleton />}>
          <LatestPostsSection />
        </Suspense>

        <Suspense fallback={null}>
          <BottomBannerSection />
        </Suspense>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
