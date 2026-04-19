const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface OrderNotification {
  customerName: string;
  customerEmail: string;
  phone?: string;
  items: {
    productName: string;
    variantSku: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  orderId: string;
  paymentMethod?: string;
  isPaid?: boolean;
  discountAmount?: number;
}

export async function sendOrderNotification(order: OrderNotification) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram not configured, skipping notification");
    return;
  }

  const itemLines = order.items
    .map(
      (item) =>
        `  • ${item.productName} (${item.variantSku}) x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    )
    .join("\n");

  const isBank = order.paymentMethod === 'BANK';
  const headerInfo = isBank 
    ? `*KHÁCH BÁO CHUYỂN KHOẢN (QR)*\n🟡 *TRẠNG THÁI: YÊU CẦU CHECK SAO KÊ*` 
    : `*ĐƠN HÀNG COD (GIAO THU TIỀN)*\n🟠 *TRẠNG THÁI: CHỜ XÁC NHẬN*`;

  const discountLine = order.discountAmount ? `\n🏷 *Giảm giá:* -${formatPrice(order.discountAmount)}` : '';

  const message = `${headerInfo}

📋 Mã đơn: \`${order.orderId}\`
👤 Khách hàng: ${order.customerName}
📧 Email: ${order.customerEmail}
📱 SĐT: ${order.phone || "N/A"}

🛒 *Sản phẩm:*
${itemLines}
${discountLine}
💰 *TỔNG THU: ${formatPrice(order.totalPrice)}*`;

  await sendTelegramMessage(message);
}

export async function sendNewUserNotification(user: { name: string; email: string }) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram not configured, skipping notification");
    return;
  }

  const message = `👤 *THÀNH VIÊN MỚI*

🎉 Tên: ${user.name}
📧 Email: ${user.email}
📅 Thời gian: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`;

  await sendTelegramMessage(message);
}

async function sendTelegramMessage(text: string) {
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}
