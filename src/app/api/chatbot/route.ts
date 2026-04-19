import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatWithGemini } from "@/lib/gemini";
import { getChatQueue } from "@/lib/chatQueue";

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

// Build product context from database
async function buildProductContext(message: string) {
  const keywords = message
    .toLowerCase()
    .replace(
      /[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g,
      ""
    )
    .split(/\s+/)
    .filter((w: string) => w.length > 2);

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

  return { productContext, productsFound: products.length };
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
        { status: 200 }
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

    // Build product context from DB
    const { productContext, productsFound } = await buildProductContext(sanitizedMessage);
    const trimmedHistory = (history || []).slice(-6);

    // ─── Try Queue (Redis + BullMQ) ──────────────────────
    const queue = getChatQueue();

    if (queue) {
      try {
        console.log("[Chatbot] Adding job to queue...");
        const job = await queue.add("chat", {
          message: sanitizedMessage,
          productContext,
          history: trimmedHistory,
          productsFound,
        });

        // Poll for job completion (max 30s)
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 500));
          const state = await job.getState();

          if (state === "completed") {
            const finished = await queue.getJob(job.id!);
            const result = finished?.returnvalue;
            if (result) {
              console.log("[Chatbot] Job completed via queue");
              return NextResponse.json({ success: true, data: result });
            }
          }

          if (state === "failed") {
            console.error("[Chatbot] Job failed in queue");
            break;
          }
        }

        // Timeout — fell through
        console.warn("[Chatbot] Queue job timed out, returning fallback");
        return NextResponse.json({
          success: true,
          data: {
            reply: "Hệ thống đang xử lý nhiều yêu cầu. Vui lòng thử lại sau ít phút nhé!",
            productsFound: 0,
          },
        });
      } catch (queueError: any) {
        console.error("[Chatbot] Queue error, falling back to direct:", queueError.message);
        // Fall through to direct call
      }
    }

    // ─── Fallback: Direct Gemini Call (no Redis) ─────────
    console.log("[Chatbot] Using direct Gemini call (no queue)");
    const reply = await chatWithGemini(sanitizedMessage, productContext, trimmedHistory);

    return NextResponse.json({
      success: true,
      data: { reply, productsFound },
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
