import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET /api/admin/brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ success: true, data: brands });
  } catch (e: any) {
    console.error("Admin GET brands error:", e);
    return NextResponse.json({ success: false, error: e.message || "Lỗi tải thương hiệu" }, { status: 500 });
  }
}

// POST /api/admin/brands
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, logo } = body;
    if (!name) return NextResponse.json({ success: false, error: "Tên là bắt buộc" }, { status: 400 });

    const slug = toSlug(name);
    const brand = await prisma.brand.create({
      data: { name: name.trim(), slug, logo: logo || null },
    });
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "Tên thương hiệu đã tồn tại" }, { status: 409 });
    return NextResponse.json({ success: false, error: "Lỗi tạo thương hiệu" }, { status: 500 });
  }
}
