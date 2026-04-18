import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// Allow large body for posts with embedded images
export const maxDuration = 30;

// GET /api/admin/posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const posts = await prisma.post.findMany({
      where: categoryId ? { categoryId } : {},
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/admin/posts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      title, content, categoryId, image, excerpt, 
      seoTitle, metaDescription, metaKeywords, ogTitle, ogDescription, ogImage, canonicalUrl, schemaType,
      isActive, isFeatured 
    } = body;

    const slug = slugify(title);

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        categoryId,
        image,
        excerpt,
        seoTitle,
        metaDescription,
        metaKeywords,
        ogTitle,
        ogDescription,
        ogImage,
        canonicalUrl,
        schemaType: schemaType || "Article",
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false,
      },
      include: { category: true }
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create post" }, { status: 500 });
  }
}
