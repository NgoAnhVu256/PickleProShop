"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2, ExternalLink, Eye, EyeOff, Pencil, X, Save, Image as ImageIcon, Tag, Calendar, Gift, Search, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { useConfirm } from "@/hooks/useConfirm";

interface PromoBanner {
  id: string; title: string; image: string; link: string | null;
  order: number; isActive: boolean; startDate: string; endDate: string | null;
}

export default function AdminPromotionsPage() {
  const [activeTab, setActiveTab] = useState<"banners" | "campaigns">("banners");

  // ─── Banner State ───
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  // ─── Campaign State ───
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // ─── Fetch ───
  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promotion-banners");
      const data = await res.json();
      if (data.success) setBanners(data.data);
    } catch { toast.error("Lỗi tải danh sách banner"); }
    finally { setLoadingBanners(false); }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promotions");
      const data = await res.json();
      if (data.success) setCampaigns(data.data);
    } catch { toast.error("Lỗi tải danh sách chiến dịch"); }
    finally { setLoadingCampaigns(false); }
  }, []);

  useEffect(() => { fetchBanners(); fetchCampaigns(); }, [fetchBanners, fetchCampaigns]);

  // ─── Banner Actions ───
  const resetForm = () => { setFormTitle(""); setFormImage(""); setFormLink(""); setFormActive(true); setEditingId(null); setShowForm(false); };
  const openEdit = (b: PromoBanner) => { setFormTitle(b.title); setFormImage(b.image); setFormLink(b.link || ""); setFormActive(b.isActive); setEditingId(b.id); setShowForm(true); };

  const handleBannerSubmit = async () => {
    if (!formTitle || !formImage) { toast.error("Vui lòng nhập tiêu đề và tải ảnh lên"); return; }
    setSubmitting(true);
    try {
      const payload = { title: formTitle, image: formImage, link: formLink, isActive: formActive };
      if (editingId) {
        const res = await fetch(`/api/admin/promotion-banners/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.success) { toast.success("Đã cập nhật banner!"); resetForm(); fetchBanners(); } else toast.error(data.error);
      } else {
        const res = await fetch("/api/admin/promotion-banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.success) { toast.success("Đã thêm banner khuyến mãi!"); resetForm(); fetchBanners(); } else toast.error(data.error);
      }
    } catch { toast.error("Lỗi hệ thống"); } finally { setSubmitting(false); }
  };

  const handleDeleteBanner = async (id: string) => {
    const ok = await confirm({ title: "Xóa banner", message: "Bạn có chắc muốn xóa banner này?", confirmText: "Xóa", variant: "danger" });
    if (!ok) return;
    try { const res = await fetch(`/api/admin/promotion-banners/${id}`, { method: "DELETE" }); const data = await res.json(); if (data.success) { toast.success("Đã xóa!"); fetchBanners(); } }
    catch { toast.error("Lỗi xóa banner"); }
  };

  const toggleActive = async (b: PromoBanner) => {
    try {
      const res = await fetch(`/api/admin/promotion-banners/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !b.isActive }) });
      const data = await res.json();
      if (data.success) { toast.success(b.isActive ? "Đã ẩn banner" : "Đã hiện banner"); fetchBanners(); }
    } catch { toast.error("Lỗi cập nhật"); }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const newBanners = [...banners];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBanners.length) return;
    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];
    const reordered = newBanners.map((b, i) => ({ id: b.id, order: i }));
    try { await fetch("/api/admin/promotion-banners", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ banners: reordered }) }); fetchBanners(); }
    catch { toast.error("Lỗi sắp xếp"); }
  };

  const formatDate = (d: string | null) => !d ? "Không giới hạn" : new Date(d).toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const tabStyle = (t: string) => ({
    padding: "12px 24px", fontWeight: 700 as const, fontSize: 14, cursor: "pointer" as const, border: "none",
    borderBottom: activeTab === t ? "3px solid #2C2877" : "3px solid transparent",
    color: activeTab === t ? "#323b4b" : "#8a98ac", background: "none",
    transition: "all 0.2s",
  });

  const toggleCampaignActive = async (c: any) => {
    try {
      const res = await fetch(`/api/admin/promotions/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !c.isActive }) });
      const data = await res.json();
      if (data.success) { toast.success(c.isActive ? "Đã tạm dừng" : "Đã kích hoạt"); fetchCampaigns(); }
    } catch { toast.error("Lỗi cập nhật"); }
  };

  const handleDeleteCampaign = async (id: string) => {
    const ok = await confirm({ title: "Xóa chiến dịch", message: "Bạn có chắc muốn xóa chiến dịch này không?", confirmText: "Xóa", variant: "danger" });
    if (!ok) return;
    try { const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" }); const data = await res.json(); if (data.success) { toast.success("Đã xóa!"); fetchCampaigns(); } }
    catch { toast.error("Lỗi xóa chiến dịch"); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#323b4b" }}>Khuyến mãi</h1>
          <p style={{ fontSize: 13, color: "#8a98ac", marginTop: 2 }}>Quản lý banner khuyến mãi và Combo khuyến mãi</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #eef2f7", marginBottom: 24 }}>
        <button style={tabStyle("banners")} onClick={() => setActiveTab("banners")}>
          <ImageIcon size={16} style={{ display: "inline", marginBottom: -3, marginRight: 6 }} /> Banner Khuyến Mãi
        </button>
        <button style={tabStyle("campaigns")} onClick={() => setActiveTab("campaigns")}>
          <Gift size={16} style={{ display: "inline", marginBottom: -3, marginRight: 6 }} /> Combo khuyến mãi
        </button>
      </div>

      {/* ═══ TAB 1: BANNERS ═══ */}
      {activeTab === "banners" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Plus size={18} /> Thêm banner
            </button>
          </div>

          {/* Carousel Preview */}
          {banners.filter(b => b.isActive).length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#5a6677", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Eye size={16} color="#2C2877" /> Xem trước Carousel (Trang chủ)
              </h3>
              <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, scrollSnapType: "x mandatory" }}>
                {banners.filter(b => b.isActive).map(b => (
                  <div key={b.id} style={{ flex: "0 0 180px", height: 280, borderRadius: 16, overflow: "hidden", position: "relative", scrollSnapAlign: "start", cursor: b.link ? "pointer" : "default", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", transition: "transform 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                    <img src={b.image} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {b.link && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 12px 12px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{b.title}</span>
                        <ExternalLink size={13} color="#fff" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banner List Table */}
          {loadingBanners ? <div className="skeleton" style={{ height: 200 }} /> : banners.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, background: "rgba(44,40,119,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <ImageIcon size={28} color="#2C2877" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#323b4b", marginBottom: 8 }}>Chưa có banner khuyến mãi</h2>
              <p style={{ fontSize: 14, color: "#8a98ac", maxWidth: 380, margin: "0 auto 16px", lineHeight: 1.7 }}>Thêm các banner dọc với link sản phẩm để tạo carousel khuyến mãi hấp dẫn trên trang chủ.</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: "inline-flex", gap: 8 }}><Plus size={16} /> Thêm banner đầu tiên</button>
            </div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #eef2f7" }}>
                    <th style={{ ...thS, width: 50 }}>STT</th>
                    <th style={{ ...thS, width: 100 }}>Ảnh</th>
                    <th style={thS}>Tiêu đề</th>
                    <th style={{ ...thS, width: 200 }}>Link</th>
                    <th style={{ ...thS, width: 90, textAlign: "center" }}>Trạng thái</th>
                    <th style={{ ...thS, width: 180, textAlign: "center" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((b, idx) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f5f6fa", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fafbfd")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td style={tdS}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <button onClick={() => moveOrder(idx, "up")} disabled={idx === 0} style={{ ...arrBtn, opacity: idx === 0 ? 0.3 : 1 }} title="Lên">▲</button>
                            <button onClick={() => moveOrder(idx, "down")} disabled={idx === banners.length - 1} style={{ ...arrBtn, opacity: idx === banners.length - 1 ? 0.3 : 1 }} title="Xuống">▼</button>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#8a98ac" }}>{idx + 1}</span>
                        </div>
                      </td>
                      <td style={tdS}><div style={{ width: 60, height: 90, borderRadius: 10, overflow: "hidden", border: "2px solid #eef2f7", background: "#f5f6fa" }}><img src={b.image} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div></td>
                      <td style={tdS}><span style={{ fontSize: 14, fontWeight: 600, color: "#323b4b" }}>{b.title}</span></td>
                      <td style={tdS}>{b.link ? <a href={b.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2C2877", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><ExternalLink size={12} />{b.link}</a> : <span style={{ fontSize: 12, color: "#b0bac9" }}>– Chưa có –</span>}</td>
                      <td style={{ ...tdS, textAlign: "center" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: b.isActive ? "rgba(44,40,119,0.12)" : "rgba(239,68,68,0.08)", color: b.isActive ? "#2C2877" : "#ef4444" }}>{b.isActive ? "HIỆN" : "ẨN"}</span></td>
                      <td style={{ ...tdS, textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                          <button onClick={() => toggleActive(b)} style={actBtn} title={b.isActive ? "Ẩn" : "Hiện"}>{b.isActive ? <EyeOff size={15} color="#8a98ac" /> : <Eye size={15} color="#2C2877" />}</button>
                          <button onClick={() => openEdit(b)} style={actBtn} title="Sửa"><Pencil size={15} color="#3498db" /></button>
                          <button onClick={() => handleDeleteBanner(b.id)} style={{ ...actBtn, background: "rgba(239,68,68,0.08)" }} title="Xóa"><Trash2 size={15} color="#ef4444" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Banner Form Modal */}
          {showForm && (
            <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeInUp 0.2s ease" }} onClick={e => { if (e.target === e.currentTarget) resetForm(); }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 500, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#323b4b" }}>{editingId ? "Sửa banner" : "Thêm banner khuyến mãi"}</h2>
                  <button onClick={resetForm} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a98ac" }}><X size={20} /></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div><label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#5a6677", marginBottom: 6 }}>Tiêu đề banner *</label><input className="input" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="VD: Flash Sale Vợt Joola -30%" /></div>
                  <div><label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#5a6677", marginBottom: 6 }}>Hình ảnh banner (dọc) *</label><p style={{ fontSize: 11, color: "#b0bac9", marginBottom: 8 }}>Kích thước khuyến nghị: 400×600px (tỉ lệ 2:3, hình dọc)</p><ImageUpload value={formImage} onChange={setFormImage} onRemove={() => setFormImage("")} folder="promotions" /></div>
                  <div><label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#5a6677", marginBottom: 6 }}>Link sản phẩm / URL</label><input className="input" value={formLink} onChange={e => setFormLink(e.target.value)} placeholder="VD: /products/joola-vision-pro hoặc https://..." /></div>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}><input type="checkbox" checked={formActive} onChange={e => setFormActive(e.target.checked)} /><span style={{ fontSize: 14, fontWeight: 600, color: "#5a6677" }}>Hiển thị công khai</span></label>
                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <button className="btn btn-primary" onClick={handleBannerSubmit} disabled={submitting} style={{ flex: 1, height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Save size={16} />{submitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm banner"}</button>
                    <button className="btn btn-secondary" onClick={resetForm} style={{ height: 44, padding: "0 24px" }}>Hủy</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 2: CAMPAIGNS (Combo khuyến mãi) ═══ */}
      {activeTab === "campaigns" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Link href="/admin/promotions/create" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", textDecoration: "none" }}>
              <Plus size={18} /> Thêm chiến dịch mới
            </Link>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Chương trình</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Thời gian</th>
                    <th style={{ padding: "14px 20px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Điều kiện</th>
                    <th style={{ padding: "14px 20px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Quà tặng</th>
                    <th style={{ padding: "14px 20px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Trạng thái</th>
                    <th style={{ padding: "14px 20px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCampaigns ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#8a98ac" }}>Đang tải...</td></tr>
                  ) : campaigns.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#8a98ac" }}>Chưa có Combo khuyến mãi nào.</td></tr>
                  ) : campaigns.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fef2f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}><Gift size={20} /></div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>{p.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748b" }}>
                        <div>{formatDate(p.startDate)}</div>
                        <div>→ {formatDate(p.endDate)}</div>
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}><span style={{ fontWeight: 600, color: "#3b82f6" }}>{p.conditions?.length || 0}</span></td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}><span style={{ fontWeight: 600, color: "#ec4899" }}>{p.rewards?.length || 0}</span></td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>{p.isActive ? <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(44,40,119,0.12)", color: "#2C2877", fontSize: 11, fontWeight: 700 }}>Đang chạy</span> : <span style={{ padding: "4px 10px", borderRadius: 999, background: "#f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 700 }}>Tạm dừng</span>}</td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                          <button onClick={() => toggleCampaignActive(p)} style={actBtn} title={p.isActive ? "Tạm dừng" : "Kích hoạt"}>{p.isActive ? <EyeOff size={15} color="#8a98ac" /> : <Eye size={15} color="#2C2877" />}</button>
                          <Link href={`/admin/promotions/${p.id}`} style={{ ...actBtn, textDecoration: 'none' }} title="Sửa/Chi tiết"><Pencil size={15} color="#3498db" /></Link>
                          <button onClick={() => handleDeleteCampaign(p.id)} style={{ ...actBtn, background: "rgba(239,68,68,0.08)" }} title="Xóa"><Trash2 size={15} color="#ef4444" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}

const thS: React.CSSProperties = { padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#8a98ac", textTransform: "uppercase", letterSpacing: 0.8, textAlign: "left" };
const tdS: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle" };
const actBtn: React.CSSProperties = { width: 34, height: 34, borderRadius: 8, border: "1px solid #eef2f7", background: "#f5f6fa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const arrBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", fontSize: 9, color: "#8a98ac", padding: "1px 4px", lineHeight: 1 };
