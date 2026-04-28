import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
];

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

export async function chatWithGroq(
  userMessage: string,
  productContext: string,
  conversationHistory: { role: "user" | "model"; text: string }[] = [],
  isLastQuestion = false
) {
  if (!process.env.GROQ_API_KEY) {
    return "Hiện tại hệ thống AI đang bảo trì. Bạn vui lòng liên hệ hotline để được tư vấn nhé!";
  }

  // Instruction appended to the last user message when this is question #3
  const lastQuestionNote = isLastQuestion
    ? `\n\nĐÂY LÀ CÂU HỎI CUỐI TRONG CUỘC TRUNG CHUYỆN NÀY. Sau khi trả lời đầy đủ, BẮT BUỘC kết thúc bằng đoạn sau (nguyên văn, không thay đổi):\n"Để được tư vấn chi tiết và hỗ trợ đặt hàng, bạn vui lòng liên hệ Zalo: **${ZALO_NUMBER}** — mình sẽ tư vấn và chốt đơn ngay cho bạn!"`
    : "";

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "assistant",
      content:
        "Xin chào mình là Ben Johns rất vui được tư vấn bạn! Mình sẽ tư vấn dựa trên sản phẩm thực tế trong kho PicklePro. Bạn cần hỗ trợ gì nào?",
    },
    // Previous turns
    ...conversationHistory.map((msg) => ({
      role: (msg.role === "model" ? "assistant" : "user") as "user" | "assistant",
      content: msg.text,
    })),
    // Current question with DB context
    {
      role: "user",
      content: `[DỮ LIỆU SẢN PHẨM TỪ DATABASE]\n${productContext}\n\n[CÂU HỎI KHÁCH HÀNG]\n${userMessage}${lastQuestionNote}`,
    },
  ];

  for (const model of GROQ_MODELS) {
    try {
      console.log(`[Groq] Trying model: ${model} | isLastQuestion: ${isLastQuestion}`);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Groq timeout after 20s")), 20_000)
      );

      const completionPromise = groq.chat.completions.create({
        model,
        messages,
        temperature: 0.45,
        max_tokens: 1024,
      });

      const completion = await Promise.race([completionPromise, timeoutPromise]);
      const reply = completion.choices[0]?.message?.content?.trim() || "";

      console.log(`[Groq] ✓ ${model} | length: ${reply.length}`);
      return reply;
    } catch (error: any) {
      console.error(`[Groq] ✗ ${model}:`, error?.message || error);

      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("rate_limit");

      if (model !== GROQ_MODELS[GROQ_MODELS.length - 1]) {
        console.log("[Groq] Falling back to next model...");
        continue;
      }

      if (isRateLimit) {
        return `Xin lỗi, hệ thống AI đang quá tải. Bạn vui lòng liên hệ Zalo: **${ZALO_NUMBER}** để được tư vấn trực tiếp!`;
      }

      return "Đã có lỗi đường truyền. Bạn vui lòng thử lại sau nhé!";
    }
  }

  return "Hiện tại hệ thống AI đang bảo trì. Bạn vui lòng liên hệ hotline để được tư vấn nhé!";
}
