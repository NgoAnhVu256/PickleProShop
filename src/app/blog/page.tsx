import HomeHeader from '@/components/shop/HomeHeader';
import Footer from '@/components/shop/Footer';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: "Tin tức Pickleball | PicklePro",
  description: "Cập nhật tin tức, đánh giá sản phẩm và hướng dẫn chơi Pickleball mới nhất từ PicklePro.",
};

// ISR: revalidate every 120s
export const revalidate = 120;

async function getData(categorySlug?: string) {
  try {
    const [allPosts, categories] = await Promise.all([
      prisma.post.findMany({
        where: { isActive: true },
        orderBy: { publishedAt: 'desc' },
        include: { category: true }
      }),
      prisma.postCategory.findMany({
        include: { _count: { select: { posts: true } } }
      })
    ]);

    // Lọc theo danh mục nếu có
    const filteredPosts = categorySlug && categorySlug !== 'all' 
      ? allPosts.filter(p => p.category.slug === categorySlug) 
      : allPosts;

    const latestPosts = allPosts.slice(0, 5);

    return { posts: filteredPosts, latestPosts, categories };
  } catch (error) {
    return { posts: [], latestPosts: [], categories: [] };
  }
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const selectedCategory = searchParams.category || 'all';
  const { posts, latestPosts, categories } = await getData(selectedCategory);
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <HomeHeader />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb & Tiêu đề */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-4 flex-wrap">
            <Link href="/" className="hover:text-[#7DAACB]">Trang chủ</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900">Tin tức Pickleball</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-3">
            Tin tức & Sự kiện
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl text-sm md:text-base">
            Cập nhật tin tức, đánh giá vợt và hướng dẫn kỹ thuật chơi Pickleball mới nhất.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cột trái: Danh sách bài viết & Bộ lọc */}
          <div className="flex-1 min-w-0">
            {/* Các nút danh mục */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link 
                href="/blog" 
                className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${
                  selectedCategory === 'all' 
                    ? "bg-[#7DAACB] text-white border-[#7DAACB] shadow-md shadow-[#7DAACB]/20" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#7DAACB] hover:text-[#7DAACB]"
                }`}
              >
                Tất cả tin tức
              </Link>
              {categories.map(cat => (
                <Link 
                  key={cat.id} 
                  href={`/blog?category=${cat.slug}`}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${
                    selectedCategory === cat.slug
                      ? "bg-[#7DAACB] text-white border-[#7DAACB] shadow-md shadow-[#7DAACB]/20" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#7DAACB] hover:text-[#7DAACB]"
                  }`}
                >
                  {cat.name} <span className="text-[10px] ml-1 opacity-70">({cat._count.posts})</span>
                </Link>
              ))}
            </div>

            {/* Danh sách bài viết */}
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post: any) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="flex flex-col gap-4 group cursor-pointer bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500">
                    <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gray-100 aspect-[16/10]">
                      <img 
                        src={post.image || 'https://images.unsplash.com/photo-1551773188-0801da13dfae?q=80&w=800'} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#7DAACB] shadow-sm">
                        {post.category?.name}
                      </div>
                    </div>
                    <div className="px-1 flex flex-col flex-1">
                      <div className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                        {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                      </div>
                      <h3 className="text-base md:text-lg font-black mb-2 group-hover:text-[#7DAACB] transition-colors line-clamp-2 leading-tight uppercase tracking-tight">
                        {post.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 line-clamp-2 leading-relaxed font-medium mb-4">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#7DAACB] group-hover:text-[#5a93b5]">
                        Đọc tiếp <ChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-3xl">
                <p className="text-gray-400 italic font-bold">Không tìm thấy bài viết nào trong danh mục này.</p>
              </div>
            )}
          </div>

          {/* Cột phải: Sidebar (Latest News & Popular Tags) */}
          <aside className="w-full lg:w-[320px] shrink-0 space-y-8">
            
            {/* Tin tức mới nhất */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-5 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#7DAACB] rounded-full"></span>
                Tin tức mới nhất
              </h3>
              <div className="space-y-5">
                {latestPosts.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-4 group items-center">
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={post.image || 'https://images.unsplash.com/photo-1551773188-0801da13dfae?q=80&w=200'} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#7DAACB] transition-colors mb-1">
                        {post.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-5 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#7DAACB] rounded-full"></span>
                Chủ đề phổ biến (Tags)
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Link 
                    key={cat.id} 
                    href={`/blog?category=${cat.slug}`}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-100 hover:border-[#7DAACB] text-gray-600 hover:text-[#7DAACB] hover:bg-[#7DAACB]/5 rounded-lg text-xs font-bold transition-all"
                  >
                    #{cat.slug.replace(/-/g, '')}
                  </Link>
                ))}
                {/* Một số tag tĩnh mặc định về SEO */}
                <Link href="/blog" className="px-3 py-1.5 bg-gray-50 border border-gray-100 hover:border-[#7DAACB] text-gray-600 hover:text-[#7DAACB] hover:bg-[#7DAACB]/5 rounded-lg text-xs font-bold transition-all">#PickleballVietnam</Link>
                <Link href="/blog" className="px-3 py-1.5 bg-gray-50 border border-gray-100 hover:border-[#7DAACB] text-gray-600 hover:text-[#7DAACB] hover:bg-[#7DAACB]/5 rounded-lg text-xs font-bold transition-all">#VợtPickleball</Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
