import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/feedbacks — List all feedbacks with pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && ["NEW", "REVIEWED", "RESOLVED"].includes(status)) {
      where.status = status;
    }

    const [feedbacks, total, newCount, reviewedCount, resolvedCount] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.feedback.count({ where }),
      prisma.feedback.count({ where: { status: "NEW" } }),
      prisma.feedback.count({ where: { status: "REVIEWED" } }),
      prisma.feedback.count({ where: { status: "RESOLVED" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: feedbacks,
      stats: { total: newCount + reviewedCount + resolvedCount, new: newCount, reviewed: reviewedCount, resolved: resolvedCount },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET feedbacks error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch feedbacks" }, { status: 500 });
  }
}
