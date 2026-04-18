import HomeHeader from '@/components/shop/HomeHeader';
import TopBanner from '@/components/shop/TopBanner';
import BannerGrid from '@/components/shop/BannerGrid';
import PromotionCarousel from '@/components/shop/PromotionCarousel';
import ProductCard from "@/components/shop/ProductCard";
import Footer from "@/components/shop/Footer";
import { ChevronRight, Globe, Package } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';

async function getBanners() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    
    return {
      FIXED_TOP: banners.filter(b => b.position === 'FIXED_TOP'),
      HERO: banners.filter(b => b.position === 'HERO'),
      LEFT: banners.filter(b => b.position === 'LEFT'),
      RIGHT_TOP: banners.filter(b => b.position === 'RIGHT_TOP'),
      RIGHT_BOTTOM: banners.filter(b => b.position === 'RIGHT_BOTTOM'),
    };
  } catch (error) {
    return null;
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      take: 6
    });
  } catch (error) {
    return [];
  }
}

async function getProducts() {
  try {
    return await prisma.product.findMany({
      take: 4,
      where: { isActive: true },
    });
  } catch (error) {
    return [];
  }
}

async function getPromotionBanners() {
  try {
    return await prisma.promotionBanner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  } catch (error) {
    return [];
  }
}

async function getPosts() {
  try {
    return await prisma.post.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: { category: true }
    });
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const banners = await getBanners();
  const displayCategories = await getCategories();
  const products = await getProducts();
  const settings = await getSiteSettings();
  const promotionBanners = await getPromotionBanners();
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-white">
      <TopBanner banners={banners?.FIXED_TOP} />
      <HomeHeader settings={settings} />
      
      <main className="pb-20">
        <BannerGrid banners={banners} />
        
        <PromotionCarousel promotions={promotionBanners} />

        {/* CATEGORY GRID */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="text-lg md:text-xl font-bold mb-6 md:mb-8 uppercase tracking-tight text-center md:text-left">Danh mục sản phẩm</h2>
          {displayCategories.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {displayCategories.map((cat: any) => (
                <Link key={cat.id || cat.name} href={`/category/${cat.slug}`} className="flex flex-col items-center gap-4 group">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:shadow-md transition-shadow">
                    <img src={cat.image || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Category'} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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

        {/* PROMOTION SECTION */}
        <section className="bg-gray-50 py-10 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight">Sản phẩm Pickleball Pro</h2>
              <Link href="/products" className="text-sm font-medium flex items-center gap-1 hover:text-[#a757ff] transition-colors">
                Tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <h2 className="text-lg md:text-xl font-bold mb-8 md:mb-10 uppercase tracking-tight">Tin tức mới nhất</h2>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map((post: any) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="flex flex-col gap-4 group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[16/9]">
                    <img 
                      src={post.image || 'https://images.unsplash.com/photo-1551773188-0801da13dfae?q=80&w=600'} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-[#a757ff]">
                      {post.category?.name}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[15px] md:text-base font-bold mb-2 md:mb-2 group-hover:text-[#a757ff] transition-colors line-clamp-2 leading-snug">
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
      </main>

      <Footer settings={settings} />
    </div>
  );
}

