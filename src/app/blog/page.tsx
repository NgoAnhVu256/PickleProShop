import HomeHeader from '@/components/shop/HomeHeader';
import Footer from '@/components/shop/Footer';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import type { Metadata } from 'next';
import BlogContent from './BlogContent';

export const metadata: Metadata = {
  title: "Tin tức Pickleball | PicklePro",
  description: "Cập nhật tin tức, đánh giá sản phẩm và hướng dẫn chơi Pickleball mới nhất từ PicklePro.",
  alternates: { canonical: "/blog" },
};

// ISR: revalidate every 120s
export const revalidate = 120;

async function getData() {
  try {
    const [allPosts, categories] = await Promise.all([
      prisma.post.findMany({
        where: { isActive: true },
        orderBy: { publishedAt: 'desc' },
        include: { category: true }
      }),
      prisma.postCategory.findMany({
        orderBy: { name: 'asc' }
      })
    ]);

    return { posts: allPosts, categories };
  } catch (error) {
    return { posts: [], categories: [] };
  }
}

export default async function BlogListPage() {
  const { posts, categories } = await getData();
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <HomeHeader />
      <BlogContent posts={JSON.parse(JSON.stringify(posts))} categories={JSON.parse(JSON.stringify(categories))} />
      <Footer settings={settings} />
    </div>
  );
}
