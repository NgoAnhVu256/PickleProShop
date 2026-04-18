import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET /api/admin/posts/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!post) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch post" }, { status: 500 });
  }
}

// PUT /api/admin/posts/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { 
      title, content, categoryId, image, excerpt, 
      seoTitle, metaDescription, metaKeywords, ogTitle, ogDescription, ogImage, canonicalUrl, schemaType,
      isActive, isFeatured 
    } = body;

    const data: any = {
      title,
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
      schemaType,
      isActive,
      isFeatured
    };

    if (title) data.slug = slugify(title);

    const post = await prisma.post.update({
      where: { id },
      data,
      include: { category: true }
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE /api/admin/posts/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 500 });
  }
}
