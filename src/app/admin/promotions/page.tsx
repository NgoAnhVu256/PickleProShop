"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Tag, Calendar, Gift, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    try {
      const res = await fetch("/api/admin/promotions");
      const data = await res.json();
      if (data.success) {
        setPromotions(data.data);
      }
    } catch (error) {
      toast.error("Lỗi tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Không giới hạn";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="fade-in pb-20">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#323b4b" }}>Quản lý Khuyến Mãi</h1>
          <p style={{ color: "#8a98ac", fontSize: 14, marginTop: 4 }}>Quản lý các chương trình Mua X Tặng Y</p>
        </div>
        <Link href="/admin/promotions/create" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px" }}>
          <Plus size={18} /> Thêm chương trình mới
        </Link>
      </div>

      <div className="card" style={{ padding: "0" }}>
        {/* Search & Filter */}
        <div style={{ padding: 20, borderBottom: "1px solid #eef2f7", display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8a98ac" }} />
            <input className="input" placeholder="Tìm kiếm chương trình khuyến mãi..." style={{ paddingLeft: 40 }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Chương trình</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Thời gian</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Điều kiện (Mua)</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Quà tặng (Tặng)</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Trạng thái</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#8a98ac" }}>Đang tải dữ liệu...</td></tr>
              ) : promotions.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#8a98ac" }}>Chưa có chương trình khuyến mãi nào.</td></tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo.id} style={{ borderBottom: "1px solid #f1f5f9" }} className="hover:bg-slate-50">
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fef2f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Gift size={20} />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>{promo.name}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Calendar size={14} /> Bắt đầu: <strong style={{ color: "#334155" }}>{formatDate(promo.startDate)}</strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={14} /> Kết thúc: <strong style={{ color: "#334155" }}>{formatDate(promo.endDate)}</strong>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: "#3b82f6" }}>{promo.conditions.length} điều kiện</span>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: "#ec4899" }}>{promo.rewards.length} quà tặng</span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {promo.isActive ? (
                        <span style={{ padding: "4px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700 }}>Đang chạy</span>
                      ) : (
                        <span style={{ padding: "4px 10px", borderRadius: 999, background: "#f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 700 }}>Tạm dừng</span>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <button style={{ padding: 8, background: "none", border: "none", color: "#94a3b8", cursor: "pointer", borderRadius: 6 }} className="hover:bg-slate-200">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
