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
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const contextMessage = `Dưới đây là dữ liệu sản phẩm hiện có trong cửa hàng (từ database SQL):\n${productContext}\n\nCâu hỏi của khách hàng: ${userMessage}`;

  const history = conversationHistory.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  try {
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
              text: "Xin chào mình là Ben Johns rất vui được tư vấn bạn! Mình sẽ chỉ tư vấn dựa trên sản phẩm thực tế trong kho hàng PicklePro. Bạn cần mình hỗ trợ gì nào? 🏓",
            },
          ],
        },
        ...history,
      ],
    });

    const result = await chat.sendMessage(contextMessage);
    return result.response.text();
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429")) {
      return "Xin lỗi bạn, lượng người hâm mộ Pickleball truy cập tư vấn đang quá đông! Xin bạn vui lòng từ từ gõ lại câu hỏi sau ít phút nữa để mình sắp xếp trả lời nhé! 🏓 (Error: Quá tải hệ thống)";
    }
    console.error("Gemini Error:", error);
    return "Đã có lỗi đường truyền dẫn đến cửa hàng. Mình xin lỗi bạn, bạn vui lòng thử lại sau nhé!";
  }
}
