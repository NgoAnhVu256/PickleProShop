"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MessageSquare, Trash2, Loader2, ChevronLeft, ChevronRight, Eye, Check, Clock, Plus, X, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface FeedbackItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string;
  message: string;
  status: "NEW" | "REVIEWED" | "RESOLVED";
  isRead: boolean;
  createdAt: string;
}

interface FeedbackBannerItem {
  id: string;
  title: string;
  image: string;
  link: string | null;
  isActive: boolean;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, new: 0, reviewed: 0, resolved: 0 });
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  // Banner state
  const [banners, setBanners] = useState<FeedbackBannerItem[]>([]);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: "", image: "", link: "", isActive: true });
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [tab, setTab] = useState<"feedbacks" | "banners">("feedbacks");

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/feedbacks?${params}`);
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data);
        setTotalPages(data.pagination.totalPages);
        setStats(data.stats);
      }
    } catch { toast.error("Lỗi tải dữ liệu"); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/feedback-banners");
      const data = await res.json();
      if (data.success) setBanners(data.data);
    } catch {}
  }, []);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);
  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/feedbacks/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Đã cập nhật trạng thái"); fetchFeedbacks(); }
    } catch { toast.error("Lỗi cập nhật"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa góp ý này?")) return;
    try {
      const res = await fetch(`/api/admin/feedbacks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("Đã xóa"); fetchFeedbacks(); setSelectedFeedback(null); }
    } catch { toast.error("Lỗi xóa"); }
  };

  const handleUploadBannerImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "feedback-banners");
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) setBannerForm(prev => ({ ...prev, image: data.url }));
    else toast.error("Upload thất bại");
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.title || !bannerForm.image) { toast.error("Nhập tiêu đề và ảnh"); return; }
    try {
      const url = editingBannerId ? `/api/admin/feedback-banners/${editingBannerId}` : "/api/admin/feedback-banners";
      const method = editingBannerId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(bannerForm) });
      const data = await res.json();
      if (data.success) {
        toast.success(editingBannerId ? "Đã cập nhật" : "Đã tạo banner");
        fetchBanners();
        setShowBannerForm(false);
        setBannerForm({ title: "", image: "", link: "", isActive: true });
        setEditingBannerId(null);
      } else {
        toast.error(data.error || "Lỗi tạo banner");
      }
    } catch (err: any) { toast.error("Lỗi lưu banner: " + (err?.message || "Kết nối thất bại")); }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Xóa banner này?")) return;
    try {
      const res = await fetch(`/api/admin/feedback-banners/${id}`, { method: "DELETE" });
      if ((await res.json()).success) { toast.success("Đã xóa"); fetchBanners(); }
    } catch { toast.error("Lỗi xóa"); }
  };

  const statusColor = (s: string) => s === "NEW" ? "#3498db" : s === "REVIEWED" ? "#f39c12" : "#27ae60";
  const statusLabel = (s: string) => s === "NEW" ? "Mới" : s === "REVIEWED" ? "Đã xem" : "Đã xử lý";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#323b4b", marginBottom: 4 }}>Góp ý & Phản hồi</h1>
          <p style={{ fontSize: 13, color: "#8a98ac" }}>Quản lý góp ý từ khách hàng và banner góp ý</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Tổng", value: stats.total, color: "#8a98ac" },
          { label: "Mới", value: stats.new, color: "#3498db" },
          { label: "Đã xem", value: stats.reviewed, color: "#f39c12" },
          { label: "Đã xử lý", value: stats.resolved, color: "#27ae60" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #eef2f7", padding: "16px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#b0bac9", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#f0f2f5", borderRadius: 10, padding: 3, width: "fit-content" }}>
        {[
          { key: "feedbacks" as const, label: "Góp ý", icon: MessageSquare },
          { key: "banners" as const, label: "Banner", icon: ImageIcon },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              background: tab === t.key ? "#fff" : "transparent",
              color: tab === t.key ? "#323b4b" : "#8a98ac",
              fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6,
              boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "feedbacks" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#b0bac9" }} />
              <input type="text" placeholder="Tìm theo tên, email, chủ đề..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: "100%", background: "#fff", border: "1px solid #eef2f7", borderRadius: 10, padding: "10px 12px 10px 38px", fontSize: 13, color: "#323b4b", outline: "none" }} />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ background: "#fff", border: "1px solid #eef2f7", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#323b4b", outline: "none", cursor: "pointer" }}>
              <option value="">Tất cả trạng thái</option>
              <option value="NEW">Mới</option>
              <option value="REVIEWED">Đã xem</option>
              <option value="RESOLVED">Đã xử lý</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eef2f7", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#b0bac9" }}>
                <Loader2 size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} /> Đang tải...
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafbfc" }}>
                      {["Người gửi", "Chủ đề", "Trạng thái", "Ngày gửi", "Thao tác"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "2px solid #eef2f7", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map(fb => (
                      <tr key={fb.id} style={{ borderBottom: "1px solid #f5f6fa", cursor: "pointer", background: !fb.isRead ? "rgba(52,152,219,0.03)" : "transparent" }} onClick={() => setSelectedFeedback(fb)}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#323b4b" }}>{fb.name}</div>
                          <div style={{ fontSize: 11, color: "#b0bac9" }}>{fb.email || fb.phone || "—"}</div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#323b4b", fontWeight: !fb.isRead ? 700 : 400 }}>{fb.subject}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <select value={fb.status} onClick={e => e.stopPropagation()} onChange={(e) => handleStatusChange(fb.id, e.target.value)}
                            style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid #eef2f7", fontSize: 12, fontWeight: 700, color: statusColor(fb.status), background: `${statusColor(fb.status)}12`, cursor: "pointer", outline: "none" }}>
                            <option value="NEW">Mới</option>
                            <option value="REVIEWED">Đã xem</option>
                            <option value="RESOLVED">Đã xử lý</option>
                          </select>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#b0bac9", whiteSpace: "nowrap" }}>{new Date(fb.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(fb.id); }}
                            style={{ background: "rgba(231,76,60,0.08)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#e74c3c", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                            <Trash2 size={13} /> Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                    {feedbacks.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: "center", padding: 60, color: "#b0bac9", fontSize: 14 }}>
                        <MessageSquare size={38} style={{ margin: "0 auto 12px", opacity: 0.25, display: "block" }} />Chưa có góp ý nào
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: 16, borderTop: "1px solid #eef2f7" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ background: "none", border: "1px solid #eef2f7", borderRadius: 8, padding: "6px 12px", cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 13, color: "#8a98ac", fontWeight: 600 }}>Trang {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ background: "none", border: "1px solid #eef2f7", borderRadius: 8, padding: "6px 12px", cursor: page === totalPages ? "default" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Detail Modal */}
          {selectedFeedback && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setSelectedFeedback(null)}>
              <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 560, width: "100%", maxHeight: "80vh", overflow: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#323b4b" }}>Chi tiết góp ý</h3>
                  <button onClick={() => setSelectedFeedback(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  <div><span style={{ fontSize: 11, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase" }}>Người gửi</span><p style={{ fontSize: 14, fontWeight: 600, color: "#323b4b", margin: "4px 0 0" }}>{selectedFeedback.name}</p></div>
                  {selectedFeedback.email && <div><span style={{ fontSize: 11, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase" }}>Email</span><p style={{ fontSize: 14, color: "#323b4b", margin: "4px 0 0" }}>{selectedFeedback.email}</p></div>}
                  {selectedFeedback.phone && <div><span style={{ fontSize: 11, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase" }}>Số điện thoại</span><p style={{ fontSize: 14, color: "#323b4b", margin: "4px 0 0" }}>{selectedFeedback.phone}</p></div>}
                  <div><span style={{ fontSize: 11, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase" }}>Chủ đề</span><p style={{ fontSize: 14, fontWeight: 600, color: "#323b4b", margin: "4px 0 0" }}>{selectedFeedback.subject}</p></div>
                  <div><span style={{ fontSize: 11, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase" }}>Nội dung</span><p style={{ fontSize: 14, color: "#323b4b", margin: "4px 0 0", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selectedFeedback.message}</p></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "banners" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button onClick={() => { setShowBannerForm(true); setEditingBannerId(null); setBannerForm({ title: "", image: "", link: "", isActive: true }); }}
              style={{ background: "#27ae60", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={16} /> Thêm banner
            </button>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {banners.map(b => (
              <div key={b.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #eef2f7", padding: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <img src={b.image} alt={b.title} style={{ width: 200, height: 57, objectFit: "cover", borderRadius: 10, background: "#f0f2f5" }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "#323b4b", marginBottom: 4 }}>{b.title}</h4>
                  <p style={{ fontSize: 12, color: "#b0bac9" }}>{b.link || "Không có link"}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, color: b.isActive ? "#27ae60" : "#e74c3c" }}>{b.isActive ? "Đang hiển thị" : "Ẩn"}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setEditingBannerId(b.id); setBannerForm({ title: b.title, image: b.image, link: b.link || "", isActive: b.isActive }); setShowBannerForm(true); }}
                    style={{ background: "#f0f2f5", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#323b4b" }}>Sửa</button>
                  <button onClick={() => handleDeleteBanner(b.id)}
                    style={{ background: "rgba(231,76,60,0.08)", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#e74c3c" }}>Xóa</button>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div style={{ background: "#fff", borderRadius: 14, border: "1px dashed #eef2f7", padding: 60, textAlign: "center", color: "#b0bac9" }}>
                <ImageIcon size={38} style={{ margin: "0 auto 12px", opacity: 0.25, display: "block" }} />Chưa có banner góp ý nào
              </div>
            )}
          </div>

          {/* Banner Form Modal */}
          {showBannerForm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowBannerForm(false)}>
              <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 500, width: "100%" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#323b4b", marginBottom: 20 }}>{editingBannerId ? "Sửa banner" : "Thêm banner mới"}</h3>
                <div style={{ display: "grid", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#8a98ac", display: "block", marginBottom: 6 }}>Tiêu đề *</label>
                    <input value={bannerForm.title} onChange={e => setBannerForm(p => ({ ...p, title: e.target.value }))}
                      style={{ width: "100%", border: "1px solid #eef2f7", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#8a98ac", display: "block", marginBottom: 6 }}>Ảnh banner (1142x323px) *</label>
                    {bannerForm.image ? (
                      <div style={{ position: "relative" }}>
                        <img src={bannerForm.image} alt="" style={{ width: "100%", borderRadius: 10, maxHeight: 160, objectFit: "cover" }} />
                        <button onClick={() => setBannerForm(p => ({ ...p, image: "" }))}
                          style={{ position: "absolute", top: 8, right: 8, background: "#e74c3c", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ display: "block", border: "2px dashed #eef2f7", borderRadius: 10, padding: 30, textAlign: "center", cursor: "pointer", color: "#b0bac9", fontSize: 13 }}>
                        <ImageIcon size={24} style={{ margin: "0 auto 8px", display: "block" }} />Bấm để chọn ảnh
                        <input type="file" accept="image/*" hidden onChange={e => { if (e.target.files?.[0]) handleUploadBannerImage(e.target.files[0]); }} />
                      </label>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#8a98ac", display: "block", marginBottom: 6 }}>Link liên kết</label>
                    <input value={bannerForm.link} onChange={e => setBannerForm(p => ({ ...p, link: e.target.value }))} placeholder="/feedback"
                      style={{ width: "100%", border: "1px solid #eef2f7", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={bannerForm.isActive} onChange={e => setBannerForm(p => ({ ...p, isActive: e.target.checked }))} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Kích hoạt hiển thị</span>
                  </label>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <button onClick={() => setShowBannerForm(false)}
                    style={{ flex: 1, padding: "10px", border: "1px solid #eef2f7", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Hủy</button>
                  <button onClick={handleSaveBanner}
                    style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: "#27ae60", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                    {editingBannerId ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select:focus { border-color: #3498db !important; }
        input:focus { border-color: #3498db !important; box-shadow: 0 0 0 3px rgba(52,152,219,0.12); }
      `}</style>
    </div>
  );
}
