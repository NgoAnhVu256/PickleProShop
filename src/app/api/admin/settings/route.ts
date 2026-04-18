import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/settings
export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return NextResponse.json({ success: true, data: map });
  } catch (error) {
    console.error("Admin GET settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST /api/admin/settings — Upsert settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings } = body; // { key: value, key2: value2 }

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ success: false, error: "Settings object required" }, { status: 400 });
    }

    const upserts = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(upserts);
    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (error) {
    console.error("Admin POST settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
