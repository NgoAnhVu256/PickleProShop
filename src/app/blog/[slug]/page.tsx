import HomeHeader from '@/components/shop/HomeHeader';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import Link from 'next/link';
import Footer from '@/components/shop/Footer';
import { Calendar, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import ClientShare from '@/components/shop/ClientShare';
import type { Metadata } from 'next';

// ISR: revalidate every 120s
export const revalidate = 120;

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

// ─── SEO: Dynamic Metadata per blog post ───
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostData(slug);
  if (!post) return { title: "Bài viết không tồn tại" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://picklepro.vn";
  const title = post.seoTitle || post.title;
  const description = post.metaDescription || post.excerpt || `Đọc bài viết "${post.title}" trên PicklePro`;
  const ogImage = post.ogImage || post.image || `${siteUrl}/api/favicon`;

  return {
    title,
    description,
    keywords: post.metaKeywords || undefined,
    alternates: {
      canonical: post.canonicalUrl || `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.ogTitle || title,
      description: post.ogDescription || description,
      images: [ogImage],
      publishedTime: post.publishedAt.toISOString(),
      authors: ["PicklePro"],
      section: post.category.name,
    },
    twitter: {
      card: "summary_large_image",
      title: post.ogTitle || title,
      description: post.ogDescription || description,
      images: [ogImage],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const post = await getPostData(slug);
  const settings = await getSiteSettings();

  if (!post) {
    notFound();
  }

  const [relatedPosts, sideBanners] = await Promise.all([
    getRelatedPosts(post.categoryId, post.id),
    getSideBanners(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://picklepro.vn";

  // JSON-LD Article Schema for Google Rich Snippets
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": post.schemaType || "Article",
    headline: post.title,
    image: post.image ? (post.image.startsWith("http") ? post.image : `${siteUrl}${post.image}`) : undefined,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "PicklePro" },
    publisher: {
      "@type": "Organization",
      name: "PicklePro",
      logo: { "@type": "ImageObject", url: `${siteUrl}/api/favicon` },
    },
    description: post.excerpt || post.title,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
    articleSection: post.category.name,
  };

  // BreadcrumbList Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Tin tức", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.category.name, item: `${siteUrl}/blog?category=${post.category.slug}` },
      { "@type": "ListItem", position: 4, name: post.title },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <HomeHeader />

      <main className="pb-20">
        {/* --- HERO HEADER --- */}
        <div className="relative w-full h-[400px] md:h-[550px] overflow-hidden bg-gray-900">
          <img 
            src={post.image || 'https://images.unsplash.com/photo-1551773188-0801da13dfae?q=80&w=1200'} 
            className="w-full h-full object-cover object-top opacity-80"
            alt={post.title}
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          
          <div className="absolute inset-x-0 bottom-0 max-w-4xl mx-auto px-6 pb-12">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-white/30 mb-6 transition-all"
            >
              <ArrowLeft size={16} /> Quay lại
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#7DAACB] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
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
          
          {/* Article */}
          <article className="lg:col-span-8">
            {post.excerpt && (
              <p className="text-xl text-gray-500 font-medium italic border-l-4 border-[#7DAACB] pl-6 mb-10 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div 
              className="blog-content prose prose-lg max-w-none text-gray-700 leading-relaxed
                prose-headings:text-gray-900 prose-headings:font-black prose-headings:tracking-tight
                prose-p:mb-6 prose-strong:text-gray-900
                prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-10"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share Section */}
            <ClientShare url={`${siteUrl}/blog/${post.slug}`} title={post.title} />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
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
                        loading="lazy"
                      />
                      <div className="flex flex-col justify-center">
                        <h5 className="text-[14px] font-bold text-gray-900 group-hover:text-[#7DAACB] transition-colors line-clamp-2 leading-snug">
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
            )}

            {/* Right Banners */}
            {sideBanners.map((banner) => (
              <Link key={banner.id} href={banner.link || '#'} className="block rounded-[32px] overflow-hidden group shadow-xl hover:shadow-[#7DAACB]/20 transition-all duration-500">
                <img 
                  src={banner.image} 
                  alt={banner.title} 
                  className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
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
