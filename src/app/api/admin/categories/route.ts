import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, image, attributeIds } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const slug = slugify(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        categoryAttrs: attributeIds ? {
          create: attributeIds.map((id: string) => ({
            attributeId: id
          }))
        } : undefined
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}

// GET /api/admin/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
        categoryAttrs: {
          include: { attribute: true }
        }
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}
