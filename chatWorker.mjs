/**
 * Gemini Chat Worker — BullMQ
 * Xử lý lần lượt các yêu cầu chat, tránh quá tải Gemini API.
 *
 * Chạy: node chatWorker.mjs
 * Docker: command: node chatWorker.mjs
 */

import { Worker } from "bullmq";
import IORedis from "ioredis";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Config ──────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const MODEL_NAMES = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

const SYSTEM_PROMPT = `Bạn là Ben Johns — nhà tư vấn thiết bị Pickleball chuyên nghiệp của cửa hàng PicklePro.

Quy tắc của bạn:
1. Luôn mở đầu cuộc trò chuyện bằng: "Xin chào mình là Ben Johns rất vui được tư vấn bạn"
2. Chỉ tư vấn sản phẩm DỰA TRÊN dữ liệu sản phẩm được cung cấp từ hệ thống (SQL database). KHÔNG được bịa đặt thông tin sản phẩm.
3. Nếu sản phẩm không có trong dữ liệu, hãy nói rõ "Hiện tại mình không tìm thấy sản phẩm này trong kho"
4. Các thông tin KHÔNG liên quan đến sản phẩm (ví dụ: luật chơi pickleball, kỹ thuật, lịch sử) — bạn CÓ THỂ trả lời dựa trên kiến thức chung
5. Luôn thân thiện, nhiệt tình, chuyên nghiệp
6. Trả lời bằng tiếng Việt, trừ khi khách nói tiếng Anh
7. Bạn CÓ THỂ tìm và tham khảo kiến thức trên mạng để tư vấn khách, NHƯNG BẮT BUỘC chỉ được gửi link sản phẩm nội bộ của website (định dạng [Tên sản phẩm](/products/slug-san-pham)).
8. TUYỆT ĐỐI KHÔNG ĐƯỢC chèn bất kỳ link nào từ trang web bên ngoài. Dữ liệu sản phẩm bắt buộc phải lấy từ SQL website.
9. Giữ câu trả lời ngắn gọn, dễ hiểu, trình bày link đẹp mắt.`;

// ─── Redis Connection ────────────────────────────────────
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("connect", () => console.log("[Worker] Connected to Redis"));
connection.on("error", (err) => console.error("[Worker] Redis error:", err.message));

// ─── Gemini API Call ─────────────────────────────────────
async function callGemini(message, productContext, history) {
  if (!GEMINI_KEY) {
    return "Hiện tại hệ thống AI đang bảo trì. Bạn vui lòng liên hệ hotline để được tư vấn nhé!";
  }

  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const contextMessage = `Dưới đây là dữ liệu sản phẩm hiện có trong cửa hàng (từ database SQL):\n${productContext}\n\nCâu hỏi của khách hàng: ${message}`;

  const chatHistory = (history || []).map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  for (const modelName of MODEL_NAMES) {
    try {
      console.log(`[Worker] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
          {
            role: "model",
            parts: [
              {
                text: "Xin chào mình là Ben Johns rất vui được tư vấn bạn! Mình sẽ chỉ tư vấn dựa trên sản phẩm thực tế trong kho hàng PicklePro. Bạn cần mình hỗ trợ gì nào?",
              },
            ],
          },
          ...chatHistory,
        ],
      });

      // Timeout 20s
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini timeout")), 20000)
      );

      const result = await Promise.race([
        chat.sendMessage(contextMessage),
        timeoutPromise,
      ]);

      const text = result.response.text();
      console.log(`[Worker] Success with ${modelName}, reply: ${text.length} chars`);
      return text;
    } catch (error) {
      console.error(`[Worker] Error with ${modelName}:`, error?.message || error);

      if (error?.status === 429 || error?.message?.includes("429")) {
        return "Xin lỗi bạn, lượng truy cập tư vấn đang quá đông! Vui lòng thử lại sau ít phút nhé!";
      }

      // Try next model
      if (modelName !== MODEL_NAMES[MODEL_NAMES.length - 1]) continue;
      return "Đã có lỗi đường truyền. Bạn vui lòng thử lại sau nhé!";
    }
  }

  return "Hệ thống AI đang bảo trì. Vui lòng liên hệ hotline!";
}

// ─── BullMQ Worker ───────────────────────────────────────
const worker = new Worker(
  "gemini-chat",
  async (job) => {
    const { message, productContext, history, productsFound } = job.data;
    console.log(`[Worker] Processing job ${job.id}: "${message.substring(0, 50)}..."`);

    const reply = await callGemini(message, productContext, history);

    return { reply, productsFound: productsFound || 0 };
  },
  {
    connection,
    concurrency: 1, // Xử lý 1 job tại 1 thời điểm
    limiter: {
      max: 14,          // Max 14 jobs
      duration: 60000,  // per 60 seconds (dưới Gemini free limit 15/min)
    },
  }
);

worker.on("completed", (job, result) => {
  console.log(`[Worker] Job ${job.id} completed. Reply: ${result.reply?.substring(0, 60)}...`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[Worker] Worker error:", err.message);
});

console.log("[Worker] Gemini Chat Worker started. Waiting for jobs...");
console.log(`[Worker] Redis: ${REDIS_URL}`);
console.log(`[Worker] Gemini Key: ${GEMINI_KEY ? "✓ Set" : "✗ Missing!"}`);
console.log(`[Worker] Rate limit: 14 req/min, concurrency: 1`);
