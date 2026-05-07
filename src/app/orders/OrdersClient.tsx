"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Package, User, Shield, LogOut, MapPin, Phone, CreditCard, ShoppingBag } from "lucide-react";
import Footer from "@/components/shop/Footer";
import Header from "@/components/shop/Header";

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Chờ xử lý", color: "#eab308", bg: "#fef9c3" },
  PAID: { label: "Đã xác nhận", color: "#3b82f6", bg: "#dbeafe" },
  SHIPPED: { label: "Đang giao hàng", color: "#a855f7", bg: "#f3e8ff" },
  DELIVERED: { label: "Thành công", color: "#22c55e", bg: "#dcfce7" },
  CANCELLED: { label: "Đã hủy", color: "#ef4444", bg: "#fee2e2" },
};

const statusTabs = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xử lý" },
  { key: "PAID", label: "Đã xác nhận" },
  { key: "SHIPPED", label: "Đang giao hàng" },
  { key: "DELIVERED", label: "Thành công" },
  { key: "CANCELLED", label: "Đã hủy" },
];

function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const avatarUrl = user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=7DAACB&color=fff&size=128&bold=true`;

  const navItems = [
    { href: "/account", label: "Thông tin tài khoản", icon: User, active: pathname === "/account" },
    { href: "/orders", label: "Đơn hàng đã mua", icon: Package, active: pathname === "/orders" },
  ];

  return (
    <aside className="w-full lg:w-[260px] shrink-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#7DAACB]/20 bg-white shadow-sm">
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-gray-900 truncate">{user?.name || "Chưa đặt tên"}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>

      <nav className="space-y-1 mb-4">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                item.active
                  ? "bg-[#7DAACB]/10 text-[#5a93b5] border border-[#7DAACB]/20"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} className={item.active ? "text-[#7DAACB]" : "text-gray-400"} />
              {item.label}
            </Link>
          );
        })}
        {user?.role === "ADMIN" && (
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <Shield size={18} className="text-red-400" />
            Quản trị Admin
          </Link>
        )}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        Đăng Xuất
      </button>
    </aside>
  );
}

export default function OrdersClient({ orders, user, settings }: { orders: any[]; user: any; settings: any }) {
  const [activeTab, setActiveTab] = useState("ALL");

  const filteredOrders = activeTab === "ALL" ? orders : orders.filter((o: any) => o.status === activeTab);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Sidebar ─── */}
          <Sidebar user={user} />

          {/* ─── Main Content ─── */}
          <main className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 mb-6">Đơn hàng đã mua</h1>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {statusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                    activeTab === tab.key
                      ? "bg-[#7DAACB] text-white border-[#7DAACB] shadow-md shadow-[#7DAACB]/20"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#7DAACB]/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={32} className="text-[#7DAACB]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng nào phù hợp</h2>
                <p className="text-sm text-gray-500 mb-8">Vẫn còn rất nhiều sản phẩm đang chờ bạn</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link href="/products" className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-[#7DAACB] transition-colors">
                    Sản phẩm
                  </Link>
                  <Link href="/" className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-[#7DAACB] transition-colors">
                    ← Về trang chủ
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: any) => {
                  const status = statusMap[order.status] || statusMap.PENDING;
                  return (
                    <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* Order Header */}
                      <div className="border-b border-gray-100 px-5 py-4 flex flex-col sm:flex-row justify-between gap-3 bg-gray-50/50">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            Mã đơn hàng: <span className="text-[#7DAACB]">#{order.id.slice(-6).toUpperCase()}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{ color: status.color, backgroundColor: status.bg }}
                          >
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="px-5 py-4 border-b border-gray-100">
                        <div className="space-y-3">
                          {order.items.map((item: any) => {
                            const variant = item.productVariant;
                            const product = variant.product;
                            const attrText = variant.attrValues.map((av: any) => av.value).join(" - ");
                            const img = variant.images[0] || product.thumbnail || "";

                            return (
                              <div key={item.id} className="flex gap-4 items-center">
                                <div className="w-14 h-14 rounded-xl border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                                  <img src={img} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/products/${product.slug}`} className="text-sm font-bold text-gray-900 hover:text-[#7DAACB] line-clamp-1">
                                    {product.name}
                                  </Link>
                                  {attrText && <p className="text-xs text-gray-500 mt-0.5">{attrText}</p>}
                                  <div className="flex items-center gap-4 mt-1">
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

                      {/* Order Footer */}
                      <div className="px-5 py-4 bg-gray-50/30 flex flex-col md:flex-row gap-4 justify-between">
                        <div className="space-y-1.5 flex-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400 shrink-0" />
                            <span className="line-clamp-1">{order.address}, {order.ward}, {order.district}, {order.province}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400 shrink-0" />
                            <span>{order.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-gray-400 shrink-0" />
                            <span>{order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : "Chuyển khoản"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center min-w-[180px] border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-6">
                          <p className="text-xs text-gray-500">Tổng tiền</p>
                          <p className="text-xl font-black text-[#7DAACB]">{order.totalPrice.toLocaleString()}₫</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer settings={settings} />
    </div>
  );
}
