import HomeHeader from '@/components/shop/HomeHeader';
import Footer from '@/components/shop/Footer';
import ProductCard from '@/components/shop/ProductCard';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCategoryData(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
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
          <Link href="/" className="text-[#a757ff] font-bold">Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <HomeHeader settings={settings} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-8">
          <Link href="/" className="hover:text-[#a757ff]">Trang chủ</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900">{category.name}</span>
        </div>

        {/* Title & Stats */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
            {category.name}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {category.description || `Khám phá bộ sưu tập ${category.name} mới nhất tại PicklePro.`}
          </p>
        </div>

        {/* Products Grid */}
        {category.products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white border border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400 font-bold italic">Chưa có sản phẩm nào trong danh mục này.</p>
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}



