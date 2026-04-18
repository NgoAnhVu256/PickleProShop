import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Clock, ArrowUpRight } from "lucide-react";
import { StatCard } from "./StatCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, totalUsers, revenue, pendingOrders, paidOrders, shippedOrders, deliveredOrders, cancelledOrders, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        _sum: { totalPrice: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

  const totalRevenue = revenue._sum.totalPrice || 0;

  const stats = [
    {
      label: "Tổng doanh thu",
      value: formatPrice(totalRevenue),
      sub: "Từ đơn thành công",
      iconName: "DollarSign" as const,
      iconBg: "linear-gradient(135deg, #58d68d, #3cc06e)",
      bg: "rgba(88,214,141,0.1)",
    },
    {
      label: "Tổng đơn hàng",
      value: totalOrders.toString(),
      sub: `${pendingOrders} đang chờ xử lý`,
      iconName: "ShoppingCart" as const,
      iconBg: "linear-gradient(135deg, #5dade2, #3498db)",
      bg: "rgba(93,173,226,0.1)",
    },
    {
      label: "Sản phẩm",
      value: totalProducts.toString(),
      sub: "Đang kinh doanh",
      iconName: "Package" as const,
      iconBg: "linear-gradient(135deg, #f39c12, #e67e22)",
      bg: "rgba(243,156,18,0.1)",
    },
    {
      label: "Khách hàng",
      value: totalUsers.toString(),
      sub: "Tài khoản đăng ký",
      iconName: "Users" as const,
      iconBg: "linear-gradient(135deg, #9b59b6, #8e44ad)",
      bg: "rgba(142,68,173,0.1)",
    },
  ];

  const orderStatusList = [
    { label: "Chờ xử lý",     count: pendingOrders,   color: "#f39c12", bg: "rgba(243,156,18,0.12)"   },
    { label: "Đã thanh toán", count: paidOrders,       color: "#5dade2", bg: "rgba(93,173,226,0.12)"   },
    { label: "Đang giao",     count: shippedOrders,    color: "#9b59b6", bg: "rgba(155,89,182,0.12)"   },
    { label: "Hoàn thành",    count: deliveredOrders,  color: "#58d68d", bg: "rgba(88,214,141,0.12)"   },
    { label: "Đã hủy",        count: cancelledOrders,  color: "#e74c3c", bg: "rgba(231,76,60,0.12)"    },
  ];

  return (
    <div>
      {/* ─── Page Header ─────────────────────────── */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#323b4b", marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: "#8a98ac" }}>Chào mừng trở lại! Đây là tổng quan hệ thống.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 14px", border: "1px solid #eef2f7", fontSize: 13, color: "#8a98ac", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
          <Clock size={14} />
          <span>{new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {/* ─── Stats Cards ─────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 28 }}>
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* ─── Bottom section ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>

        {/* Order Status Summary */}
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #eef2f7", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef2f7" }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase", letterSpacing: 1 }}>Trạng thái đơn hàng</h2>
          </div>
          <div style={{ padding: "8px 20px" }}>
            {orderStatusList.map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dotted #f5f6fa" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#8a98ac" }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: item.color, background: item.bg, padding: "2px 10px", borderRadius: 20, minWidth: 32, textAlign: "center" }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          {/* Revenue highlight card */}
          <div style={{ margin: "12px 16px 16px", padding: "16px", background: "linear-gradient(135deg, #58d68d, #2ecc71)", borderRadius: 12, color: "#fff" }}>
            <p style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Doanh thu tổng</p>
            <p style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{formatPrice(totalRevenue)}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 12, opacity: 0.9 }}>
              <ArrowUpRight size={13} />
              <span>Từ đơn thanh toán thành công</span>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div style={{ background: "#ffffff", borderRadius: 14, border: "1px solid #eef2f7", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase", letterSpacing: 1 }}>Đơn hàng gần đây</h2>
            <a href="/admin/orders" style={{ fontSize: 12, color: "#58d68d", fontWeight: 600, textDecoration: "none" }}>Xem tất cả →</a>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafbfc" }}>
                  {["Mã đơn", "Khách hàng", "Sản phẩm", "Tổng tiền", "Trạng thái", "Ngày"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "2px solid #eef2f7", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#b0bac9" }}>#{order.id.slice(0, 8)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `hsl(${(i * 67 + 120) % 360}, 55%, 62%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                          {(order.user.name || order.user.email || "?")[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, color: "#323b4b", fontWeight: 500 }}>{order.user.name || order.user.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#8a98ac" }}>{order._count.items} sp</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#323b4b", whiteSpace: "nowrap" }}>{formatPrice(order.totalPrice)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#b0bac9", whiteSpace: "nowrap" }}>
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "60px 20px", color: "#b0bac9", fontSize: 14 }}>
                      <ShoppingCart size={38} style={{ margin: "0 auto 12px", opacity: 0.25, display: "block" }} />
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    PENDING:   { label: "Chờ xử lý",      color: "#e67e22", bg: "rgba(243,156,18,0.12)"  },
    PAID:      { label: "Đã thanh toán",  color: "#3498db", bg: "rgba(52,152,219,0.12)"  },
    SHIPPED:   { label: "Đang giao",      color: "#9b59b6", bg: "rgba(155,89,182,0.12)"  },
    DELIVERED: { label: "Hoàn thành",     color: "#27ae60", bg: "rgba(39,174,96,0.12)"   },
    CANCELLED: { label: "Đã hủy",         color: "#e74c3c", bg: "rgba(231,76,60,0.12)"   },
  };
  const s = map[status] || { label: status, color: "#8a98ac", bg: "#f5f6fa" };
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}
