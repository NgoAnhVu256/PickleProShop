"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  phone: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null };
  _count: { items: number };
}

const statusOptions = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "DELIVERED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PAID: "Đã thanh toán",
  SHIPPED: "Đang giao",
  DELIVERED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const statusBadges: Record<string, string> = {
  PENDING: "badge-warning",
  PAID: "badge-info",
  SHIPPED: "badge-info",
  DELIVERED: "badge-success",
  CANCELLED: "badge-danger",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      toast.error("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cập nhật trạng thái thành công");
        fetchOrders();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi cập nhật");
    }
  };

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Quản lý đơn hàng</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {statusOptions.map((opt) => {
          const isActive = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1); }}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: isActive ? "none" : "1.5px solid #eef2f7",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#ffffff" : "#5a6677",
                background: isActive ? "linear-gradient(135deg, #58d68d, #3cc06e)" : "#f5f6fa",
                boxShadow: isActive ? "0 4px 12px rgba(88,214,141,0.3)" : "none",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>SĐT</th>
              <th>Sản phẩm</th>
              <th>Tổng</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th>Chuyển trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={8}><div className="skeleton" style={{ height: 20 }} /></td></tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>Không có đơn hàng</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{order.id.slice(0, 8)}...</td>
                  <td style={{ color: "var(--color-text)" }}>{order.user.name || order.user.email}</td>
                  <td>{order.phone || "—"}</td>
                  <td>{order._count.items}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(order.totalPrice)}</td>
                  <td>
                    <span className={`badge ${statusBadges[order.status] || "badge-warning"}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <select
                      className="input"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{ padding: "4px 8px", fontSize: 12, minWidth: 120 }}
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="PAID">Đã thanh toán</option>
                      <option value="SHIPPED">Đang giao</option>
                      <option value="DELIVERED">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={p === page ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
