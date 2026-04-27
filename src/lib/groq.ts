import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

// Models ordered by preference (fastest / most capable first)
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
];

const SYSTEM_PROMPT = `Bạn là Ben Johns — nhà tư vấn thiết bị Pickleball chuyên nghiệp của cửa hàng PicklePro.

Quy tắc của bạn:
1. Luôn mở đầu cuộc trò chuyện bằng: "Xin chào mình là Ben Johns rất vui được tư vấn bạn"
2. Chỉ tư vấn sản phẩm DỰA TRÊN dữ liệu sản phẩm được cung cấp từ hệ thống (SQL database). KHÔNG được bịa đặt thông tin sản phẩm.
3. Nếu sản phẩm không có trong dữ liệu, hãy nói rõ "Hiện tại mình không tìm thấy sản phẩm này trong kho"
4. Các thông tin KHÔNG liên quan đến sản phẩm (ví dụ: luật chơi pickleball, kỹ thuật, lịch sử) — bạn CÓ THỂ trả lời dựa trên kiến thức chung
5. Luôn thân thiện, nhiệt tình, chuyên nghiệp
6. Trả lời bằng tiếng Việt, trừ khi khách nói tiếng Anh
7. Bạn CÓ THỂ tham khảo kiến thức để tư vấn khách, NHƯNG BẮT BUỘC chỉ được gửi link sản phẩm nội bộ của website (định dạng [Tên sản phẩm](/products/slug-san-pham)).
8. TUYỆT ĐỐI KHÔNG ĐƯỢC chèn bất kỳ link nào từ trang web bên ngoài. Dữ liệu sản phẩm bắt buộc phải lấy từ SQL website.
9. Giữ câu trả lời ngắn gọn, dễ hiểu, trình bày link đẹp mắt.`;

export async function chatWithGroq(
  userMessage: string,
  productContext: string,
  conversationHistory: { role: "user" | "model"; text: string }[] = []
) {
  if (!process.env.GROQ_API_KEY) {
    return "Hiện tại hệ thống AI đang bảo trì. Bạn vui lòng liên hệ hotline để được tư vấn nhé!";
  }

  // Build messages array for Groq (OpenAI-compatible format)
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    // Inject greeting as first assistant turn
    {
      role: "assistant",
      content:
        "Xin chào mình là Ben Johns rất vui được tư vấn bạn! Mình sẽ chỉ tư vấn dựa trên sản phẩm thực tế trong kho hàng PicklePro. Bạn cần mình hỗ trợ gì nào?",
    },
    // Previous conversation
    ...conversationHistory.map((msg) => ({
      role: (msg.role === "model" ? "assistant" : "user") as "user" | "assistant",
      content: msg.text,
    })),
    // Current user message enriched with product context
    {
      role: "user",
      content: `Dưới đây là dữ liệu sản phẩm hiện có trong cửa hàng (từ database SQL):\n${productContext}\n\nCâu hỏi của khách hàng: ${userMessage}`,
    },
  ];

  for (const model of GROQ_MODELS) {
    try {
      console.log(`[Groq] Trying model: ${model}`);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Groq timeout after 20s")), 20_000)
      );

      const completionPromise = groq.chat.completions.create({
        model,
        messages,
        temperature: 0.5,
        max_tokens: 1024,
      });

      const completion = await Promise.race([completionPromise, timeoutPromise]);
      const reply = completion.choices[0]?.message?.content || "";

      console.log(`[Groq] Success with model: ${model}, reply length: ${reply.length}`);
      return reply;
    } catch (error: any) {
      console.error(`[Groq] Error with model ${model}:`, error?.message || error);

      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("rate_limit");

      // Try next model on rate limit or failure
      if (model !== GROQ_MODELS[GROQ_MODELS.length - 1]) {
        console.log(`[Groq] Falling back to next model...`);
        continue;
      }

      if (isRateLimit) {
        return "Xin lỗi bạn, hệ thống AI đang quá tải. Xin bạn vui lòng liên hệ Zalo: 0846915120 để được tư vấn trực tiếp!";
      }

      return "Đã có lỗi đường truyền. Bạn vui lòng thử lại sau nhé!";
    }
  }

  return "Hiện tại hệ thống AI đang bảo trì. Bạn vui lòng liên hệ hotline để được tư vấn nhé!";
}
