import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, Phone, CreditCard, ChevronRight } from "lucide-react";

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Chờ xác nhận", color: "#eab308", bg: "#fef08a" },
  PAID: { label: "Đã thanh toán", color: "#3b82f6", bg: "#bfdbfe" },
  SHIPPED: { label: "Đang giao hàng", color: "#a855f7", bg: "#e9d5ff" },
  DELIVERED: { label: "Đã giao hàng", color: "#22c55e", bg: "#bbf7d0" },
  CANCELLED: { label: "Đã hủy", color: "#ef4444", bg: "#fecaca" },
};

export const metadata = { title: "Đơn hàng của tôi - PicklePro" };

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: true,
              attrValues: { include: { attribute: true } }
            }
          }
        }
      }
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Package className="text-[#7DAACB]" /> Đơn hàng của tôi
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-500 mb-8">Bạn chưa thực hiện giao dịch nào trên PicklePro.</p>
            <Link href="/products" className="inline-flex bg-[#7DAACB] hover:bg-[#5a93b5] text-white px-8 py-3 rounded-full font-bold transition-colors">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = statusMap[order.status] || statusMap.PENDING;
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="border-b border-gray-100 p-4 md:p-6 bg-gray-50/50 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Mã đơn hàng: <span className="text-[#7DAACB]">#{order.id.slice(-6).toUpperCase()}</span></p>
                      <p className="text-xs text-gray-500 mt-1">Đặt lúc: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                    <div className="flex items-center sm:justify-end">
                      <span className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ color: status.color, backgroundColor: status.bg }}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 md:p-6 border-b border-gray-100">
                    <div className="space-y-4">
                      {order.items.map((item) => {
                        const variant = item.productVariant;
                        const product = variant.product;
                        const attrText = variant.attrValues.map(av => av.value).join(" - ");
                        const img = variant.images[0] || product.thumbnail || "/placeholder.jpg";

                        return (
                          <div key={item.id} className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                              <img src={img} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/products/${product.slug}`} className="text-sm font-bold text-gray-900 hover:text-[#7DAACB] line-clamp-1">
                                {product.name}
                              </Link>
                              {attrText && <p className="text-xs text-gray-500 mt-1">{attrText}</p>}
                              <div className="flex items-center gap-4 mt-2">
                                <p className="text-sm font-semibold text-[#7DAACB]">{item.price.toLocaleString()}₫</p>
                                <p className="text-xs text-gray-500">x{item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-sm font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()}₫</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 md:p-6 bg-gray-50/30 flex flex-col md:flex-row gap-6 justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{order.address}, {order.ward}, {order.district}, {order.province}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        <span>{order.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard size={16} className="text-gray-400" />
                        <span>{order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : "Chuyển khoản"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                      <p className="text-2xl font-black text-[#7DAACB]">{order.totalPrice.toLocaleString()}₫</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
