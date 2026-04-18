import HomeHeader from '@/components/shop/HomeHeader';
import Footer from '@/components/shop/Footer';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Tin tức Pickleball",
  description: "Cập nhật tin tức, đánh giá sản phẩm và hướng dẫn chơi Pickleball mới nhất từ PicklePro.",
};
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPosts() {
  try {
    return await prisma.post.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
      include: { category: true }
    });
  } catch (error) {
    return [];
  }
}

export default async function BlogListPage() {
  const posts = await getPosts();
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <HomeHeader settings={settings} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="mb-10 md:mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-3">Tin tức Pickleball</h1>
          <p className="text-gray-500 font-medium max-w-2xl text-sm md:text-base">Cập nhật những tin tức, đánh giá sản phẩm và hướng dẫn chơi Pickleball mới nhất từ các chuyên gia.</p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="flex flex-col gap-4 group cursor-pointer bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500">
                <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gray-100 aspect-[16/10]">
                  <img 
                    src={post.image || 'https://images.unsplash.com/photo-1551773188-0801da13dfae?q=80&w=800'} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#a757ff] shadow-sm">
                    {post.category?.name}
                  </div>
                </div>
                <div className="px-1">
                  <div className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                    {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                  </div>
                  <h3 className="text-base md:text-lg font-black mb-2 group-hover:text-[#a757ff] transition-colors line-clamp-2 leading-tight uppercase tracking-tight">
                    {post.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 line-clamp-2 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400 italic font-bold">Hiện tại chưa có bài viết nào.</p>
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
