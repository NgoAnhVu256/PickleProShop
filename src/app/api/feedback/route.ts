import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/feedback — Public submit feedback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !subject || !message) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: { name, email: email || null, phone: phone || null, subject, message },
    });

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gửi góp ý thất bại" }, { status: 500 });
  }
}

// GET /api/feedback — Get active feedback banner for homepage
export async function GET() {
  try {
    const banner = await prisma.feedbackBanner.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    return NextResponse.json({ success: true, data: null });
  }
}
