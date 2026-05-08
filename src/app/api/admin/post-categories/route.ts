import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.postCategory.findMany({
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const existing = await prisma.postCategory.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Slug đã tồn tại" }, { status: 400 });
    }

    const category = await prisma.postCategory.create({
      data: { name, slug, description },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}
