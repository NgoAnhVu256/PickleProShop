import HomeHeader from '@/components/shop/HomeHeader';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import Link from 'next/link';
import Footer from '@/components/shop/Footer';
import { ChevronRight, Calendar, User, Share2, Facebook, Twitter, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

async function getPostData(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });
    return post;
  } catch (error) {
    return null;
  }
}

async function getRelatedPosts(categoryId: string, currentPostId: string) {
  try {
    return await prisma.post.findMany({
      where: {
        categoryId,
        id: { not: currentPostId },
        isActive: true,
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    });
  } catch (error) {
    return [];
  }
}

async function getSideBanners() {
  try {
    return await prisma.banner.findMany({
      where: {
        isActive: true,
        position: { in: ['RIGHT_TOP', 'RIGHT_BOTTOM'] }
      },
      orderBy: { order: 'asc' },
      take: 2
    });
  } catch (error) {
    return [];
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const post = await getPostData(slug);
  const settings = await getSiteSettings();

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.categoryId, post.id);
  const sideBanners = await getSideBanners();

  return (
    <div className="min-h-screen bg-white">
      <HomeHeader settings={settings} />

      <main className="pb-20">
        {/* --- HERO HEADER --- */}
        <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
          <img 
            src={post.image || 'https://images.unsplash.com/photo-1551773188-0801da13dfae?q=80&w=1200'} 
            className="w-full h-full object-cover"
            alt={post.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          
          <div className="absolute inset-x-0 bottom-0 max-w-4xl mx-auto px-6 pb-12">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Quay lại
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#a757ff] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                {post.category.name}
              </span>
              <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                <Calendar size={12} />
                {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
              {post.title}
            </h1>
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Article Page */}
          <article className="lg:col-span-8">
            <p className="text-xl text-gray-500 font-medium italic border-l-4 border-[#a757ff] pl-6 mb-10 leading-relaxed">
              {post.excerpt}
            </p>

            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed
                prose-headings:text-gray-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                prose-p:mb-6 prose-strong:text-gray-900
                prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-10"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags/Share Section */}
            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Chia sẻ:</span>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Facebook size={18} /></button>
                  <button className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><Twitter size={18} /></button>
                  <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all"><LinkIcon size={18} /></button>
                </div>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold text-[#a757ff] hover:underline underline-offset-4">
                <Share2 size={16} /> Sao chép liên kết
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            
            {/* Related Posts */}
            <div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 pb-2 border-b-2 border-gray-900 inline-block">
                Bài viết liên quan
              </h4>
              <div className="space-y-6">
                {relatedPosts.map((rp) => (
                  <Link key={rp.id} href={`/blog/${rp.slug}`} className="group flex gap-4">
                    <img 
                      src={rp.image || 'https://images.unsplash.com/photo-1551773188-0801da13dfae?q=80&w=200'}
                      alt={rp.title}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0"
                    />
                    <div className="flex flex-col justify-center">
                      <h5 className="text-[14px] font-bold text-gray-900 group-hover:text-[#a757ff] transition-colors line-clamp-2 leading-snug">
                        {rp.title}
                      </h5>
                      <p className="text-[11px] text-gray-400 mt-2 font-medium">
                        {new Date(rp.publishedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Banners */}
            {sideBanners.map((banner) => (
              <Link key={banner.id} href={banner.link || '#'} className="block rounded-[32px] overflow-hidden group shadow-xl hover:shadow-[#a757ff]/20 transition-all duration-500">
                <img 
                  src={banner.image} 
                  alt={banner.title} 
                  className="w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </Link>
            ))}

          </aside>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}


