/**
 * Unified AI Chat — Groq (primary) → Gemini (fallback)
 * Ensures chatbot ALWAYS works regardless of which API key is available.
 */
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ZALO_NUMBER = "0846915120";

const SYSTEM_PROMPT = `Bạn là Ben Johns — nhà tư vấn thiết bị Pickleball chuyên nghiệp của cửa hàng PicklePro.

Quy tắc BẮT BUỘC:
1. Chỉ tư vấn sản phẩm DỰA TRÊN dữ liệu sản phẩm được cung cấp từ hệ thống (SQL database). KHÔNG được bịa đặt thông tin sản phẩm.
2. Nếu sản phẩm không có trong dữ liệu, nói rõ "Hiện tại mình không tìm thấy sản phẩm này trong kho".
3. Các câu hỏi về luật chơi, kỹ thuật, lịch sử pickleball — CÓ THỂ trả lời dựa trên kiến thức chung.
4. Luôn thân thiện, nhiệt tình, chuyên nghiệp.
5. Trả lời bằng tiếng Việt (trừ khi khách hỏi tiếng Anh).
6. CHỈ được gửi link sản phẩm nội bộ (định dạng [Tên sản phẩm](/products/slug)). TUYỆT ĐỐI KHÔNG chèn link ngoài.
7. Câu trả lời ngắn gọn, súc tích, có trọng tâm.`;

const GREETING = "Xin chào mình là Ben Johns rất vui được tư vấn bạn! Mình sẽ tư vấn dựa trên sản phẩm thực tế trong kho PicklePro. Bạn cần hỗ trợ gì nào?";

// ━━━━━━━━━━━━━━━ GROQ ━━━━━━━━━━━━━━━
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
];

async function tryGroq(
  userPrompt: string,
  history: { role: "user" | "model"; text: string }[],
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") return null;

  const groq = new Groq({ apiKey });

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "assistant", content: GREETING },
    ...history.map((m) => ({
      role: (m.role === "model" ? "assistant" : "user") as "user" | "assistant",
      content: m.text,
    })),
    { role: "user", content: userPrompt },
  ];

  for (const model of GROQ_MODELS) {
    try {
      console.log(`[AI] Groq → ${model}`);
      const completion = await Promise.race([
        groq.chat.completions.create({ model, messages, temperature: 0.45, max_tokens: 1024 }),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 20_000)),
      ]);
      const reply = completion.choices[0]?.message?.content?.trim();
      if (reply) {
        console.log(`[AI] ✓ Groq ${model} | ${reply.length} chars`);
        return reply;
      }
    } catch (err: any) {
      console.error(`[AI] ✗ Groq ${model}:`, err?.message);
      if (model !== GROQ_MODELS[GROQ_MODELS.length - 1]) continue;
    }
  }
  return null; // All Groq models failed → will fall through to Gemini
}

// ━━━━━━━━━━━━━━━ GEMINI ━━━━━━━━━━━━━━━
const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

async function tryGemini(
  userPrompt: string,
  history: { role: "user" | "model"; text: string }[],
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);

  const chatHistory = [
    { role: "user" as const, parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model" as const, parts: [{ text: GREETING }] },
    ...history.map((m) => ({
      role: m.role as "user" | "model",
      parts: [{ text: m.text }],
    })),
  ];

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[AI] Gemini → ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({ history: chatHistory });

      const result = await Promise.race([
        chat.sendMessage(userPrompt),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 15_000)),
      ]);

      const text = result.response.text()?.trim();
      if (text) {
        console.log(`[AI] ✓ Gemini ${modelName} | ${text.length} chars`);
        return text;
      }
    } catch (err: any) {
      console.error(`[AI] ✗ Gemini ${modelName}:`, err?.message);
      if (modelName !== GEMINI_MODELS[GEMINI_MODELS.length - 1]) continue;
    }
  }
  return null;
}

// ━━━━━━━━━━━━━━━ PUBLIC API ━━━━━━━━━━━━━━━
export async function chatWithAI(
  userMessage: string,
  productContext: string,
  conversationHistory: { role: "user" | "model"; text: string }[] = [],
  isLastQuestion = false,
): Promise<string> {
  // No keys at all
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    return `Hiện tại hệ thống AI đang bảo trì. Bạn vui lòng liên hệ Zalo: **${ZALO_NUMBER}** để được tư vấn nhé!`;
  }

  const lastQuestionNote = isLastQuestion
    ? `\n\nĐÂY LÀ CÂU HỎI CUỐI CÙNG. Sau khi trả lời đầy đủ, BẮT BUỘC kết thúc bằng:\n"Để được tư vấn chi tiết hơn, bạn vui lòng liên hệ Zalo: **${ZALO_NUMBER}** — mình sẽ hỗ trợ bạn ngay!"`
    : "";

  const userPrompt = `[DỮ LIỆU SẢN PHẨM TỪ DATABASE]\n${productContext}\n\n[CÂU HỎI KHÁCH HÀNG]\n${userMessage}${lastQuestionNote}`;

  // 1) Try Groq first (faster, free)
  const groqReply = await tryGroq(userPrompt, conversationHistory);
  if (groqReply) return groqReply;

  // 2) Fallback to Gemini
  console.log("[AI] Groq failed → falling back to Gemini...");
  const geminiReply = await tryGemini(userPrompt, conversationHistory);
  if (geminiReply) return geminiReply;

  // 3) All AI providers failed
  return `Xin lỗi, hệ thống AI tạm thời gián đoạn. Bạn vui lòng liên hệ Zalo: **${ZALO_NUMBER}** để được tư vấn trực tiếp!`;
}
