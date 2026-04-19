import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithGemini } from "@/lib/gemini";

// Simple in-memory rate limiter for DoS protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up stale entries periodically
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }, 60_000);
}

// POST /api/chatbot — Chat with AI assistant (Ben Johns)
export async function POST(req: NextRequest) {
  try {
    // --- Rate Limiting (DoS Protection) ---
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: true,
          data: {
            reply:
              "Bạn đang gửi tin nhắn quá nhanh! Vui lòng chờ 1 phút rồi thử lại nhé.",
            productsFound: 0,
          },
        },
        { status: 200 } // Return 200 so the widget doesn't crash
      );
    }

    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Limit message length to prevent abuse
    const sanitizedMessage = message.slice(0, 500);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        data: {
          reply:
            "Xin chào mình là Ben Johns! Hiện tại hệ thống AI đang bảo trì, bạn vui lòng liên hệ hotline để được tư vấn nhé.",
          productsFound: 0,
        },
      });
    }

    // Extract keywords from user message to query relevant products
    const keywords = sanitizedMessage
      .toLowerCase()
      .replace(
        /[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g,
        ""
      )
      .split(/\s+/)
      .filter((w: string) => w.length > 2);

    // Query relevant products from SQL database (max 10 to keep context small and fast)
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR:
          keywords.length > 0
            ? [
                ...keywords.map((kw: string) => ({
                  name: { contains: kw, mode: "insensitive" as const },
                })),
                ...keywords.map((kw: string) => ({
                  description: {
                    contains: kw,
                    mode: "insensitive" as const,
                  },
                })),
                ...keywords.map((kw: string) => ({
                  category: {
                    name: { contains: kw, mode: "insensitive" as const },
                  },
                })),
              ]
            : undefined,
      },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        variants: {
          where: { isActive: true },
          include: {
            attrValues: {
              include: {
                attribute: { select: { name: true, label: true } },
              },
            },
          },
          take: 3,
        },
      },
      take: 10,
    });

    // Build concise product context string from SQL data
    const productContext =
      products.length > 0
        ? products
            .map((p) => {
              const variants = p.variants
                .map((v) => {
                  const attrs = v.attrValues
                    .map((a) => `${a.attribute.label}: ${a.value}`)
                    .join(", ");
                  return `  SKU: ${v.sku}, Giá: ${v.price.toLocaleString()}₫, Tồn kho: ${v.stock}${attrs ? `, ${attrs}` : ""}`;
                })
                .join("\n");
              return `Sản phẩm: ${p.name}\nLink chi tiết: /products/${p.slug}\nThương hiệu: ${p.brand?.name || "N/A"}\nDanh mục: ${p.category.name}\nGiá gốc: ${p.basePrice.toLocaleString()}₫${p.salePrice ? ` | Giá sale: ${p.salePrice.toLocaleString()}₫` : ""}\nMô tả: ${(p.description || "N/A").substring(0, 150)}\nPhân loại:\n${variants || "  Không có phân loại"}`;
            })
            .join("\n---\n")
        : "Không tìm thấy sản phẩm phù hợp trong cơ sở dữ liệu.";

    // Limit history to prevent token overflow
    const trimmedHistory = (history || []).slice(-6);

    const reply = await chatWithGemini(
      sanitizedMessage,
      productContext,
      trimmedHistory
    );

    return NextResponse.json({
      success: true,
      data: { reply, productsFound: products.length },
    });
  } catch (error) {
    console.error("POST /api/chatbot error:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          reply:
            "Mình đang gặp trục trặc nhỏ. Bạn vui lòng thử lại sau ít phút nhé!",
          productsFound: 0,
        },
      },
      { status: 200 }
    );
  }
}
