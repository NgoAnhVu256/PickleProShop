import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

export async function chatWithGemini(
  userMessage: string,
  productContext: string,
  conversationHistory: { role: "user" | "model"; text: string }[] = []
) {
  // Try multiple model names for resilience
  const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
  
  const contextMessage = `Dưới đây là dữ liệu sản phẩm hiện có trong cửa hàng (từ database SQL):\n${productContext}\n\nCâu hỏi của khách hàng: ${userMessage}`;

  const history = conversationHistory.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  for (const modelName of modelNames) {
    try {
      console.log(`[Gemini] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: SYSTEM_PROMPT }],
          },
          {
            role: "model",
            parts: [
              {
                text: "Xin chào mình là Ben Johns rất vui được tư vấn bạn! Mình sẽ chỉ tư vấn dựa trên sản phẩm thực tế trong kho hàng PicklePro. Bạn cần mình hỗ trợ gì nào?",
              },
            ],
          },
          ...history,
        ],
      });

      // Add timeout (15 seconds)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini timeout after 15s")), 15000)
      );

      const result = await Promise.race([
        chat.sendMessage(contextMessage),
        timeoutPromise,
      ]);

      const text = result.response.text();
      console.log(`[Gemini] Success with model: ${modelName}, reply length: ${text.length}`);
      return text;
    } catch (error: any) {
      console.error(`[Gemini] Error with model ${modelName}:`, error?.message || error);
      
      if (error?.status === 429 || error?.message?.includes("429")) {
        return "Xin lỗi bạn, lượng người hâm mộ Pickleball truy cập tư vấn đang quá đông! Xin bạn vui lòng từ từ gõ lại câu hỏi sau ít phút nữa để mình sắp xếp trả lời nhé!(Error: Quá tải hệ thống)";
      }

      // If this isn't the last model, try next one
      if (modelName !== modelNames[modelNames.length - 1]) {
        console.log(`[Gemini] Falling back to next model...`);
        continue;
      }

      return "Đã có lỗi đường truyền dẫn đến cửa hàng. Mình xin lỗi bạn, bạn vui lòng thử lại sau nhé!";
    }
  }

  return "Hiện tại hệ thống AI đang bảo trì. Bạn vui lòng liên hệ hotline để được tư vấn nhé!";
}

