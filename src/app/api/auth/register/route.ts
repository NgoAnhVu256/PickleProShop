import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendNewUserNotification } from "@/lib/telegram";

// POST /api/auth/register — Register a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: "Vui lòng điền đầy đủ thông tin." },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu cần ít nhất 8 ký tự, gồm 1 chữ hoa, 1 chữ thường và 1 chữ số." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email này đã được đăng ký." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Send Telegram notification (fire and forget)
    sendNewUserNotification({
      name: user.name || "N/A",
      email: user.email || "N/A",
    }).catch(console.error);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi khi đăng ký." },
      { status: 500 }
    );
  }
}
