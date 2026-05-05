"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string | null;
  position: string;
  order: number;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
}

const positions = [
  { value: "FIXED_TOP", label: "Fixed Top (Announcement Bar)" },
  { value: "HERO",      label: "Hero Slider" },
  { value: "LEFT",      label: "Trái" },
  { value: "RIGHT_TOP", label: "Phải trên" },
  { value: "RIGHT_BOTTOM", label: "Phải dưới" },
  { value: "BOTTOM", label: "Dưới cùng" },
  { value: "POPUP", label: "Popup (Khi vào trang)" },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", image: "", link: "", position: "HERO", order: 0, isActive: true,
  });

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (data.success) setBanners(data.data);
    } catch {
      toast.error("Lỗi tải banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.image) { toast.error("Tiêu đề và ảnh là bắt buộc"); return; }

    try {
      const url = editId ? `/api/admin/banners/${editId}` : "/api/admin/banners";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editId ? "Cập nhật thành công" : "Tạo thành công");
        resetForm();
        fetchBanners();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi thao tác");
    }
  };

  const handleEdit = (b: Banner) => {
    setEditId(b.id);
    setForm({
      title: b.title, image: b.image, link: b.link || "", position: b.position,
      order: b.order, isActive: b.isActive,
    });
    setShowForm(true);
  };

  const onConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/banners/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("Đã xóa"); fetchBanners(); }
      else toast.error(data.error);
    } catch {
      toast.error("Lỗi xóa");
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Cập nhật thành công"); fetchBanners(); }
    } catch {
      toast.error("Lỗi");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ title: "", image: "", link: "", position: "HERO", order: 0, isActive: true });
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Quản lý Banner</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
          <Plus size={16} /> Thêm banner
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>{editId ? "Sửa banner" : "Thêm banner"}</h2>
            <button onClick={resetForm} style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}><X size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Tiêu đề *</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Vị trí</label>
                  <select className="input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                    {positions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Thứ tự</label>
                  <input className="input" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Link liên kết</label>
                <input className="input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/danh-muc/vot-pickleball" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <input type="checkbox" id="banner-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="banner-active" style={{ fontSize: 14, cursor: "pointer" }}>Kích hoạt banner</label>
              </div>
            </div>
            <div>
              <ImageUpload 
                label="Hình ảnh banner *"
                value={form.image} 
                onChange={(url) => setForm({ ...form, image: url })} 
                onRemove={() => setForm({ ...form, image: "" })}
                folder="banners"
                type="banner"
              />
            </div>
          </div>
          <button onClick={handleSubmit} className="btn btn-primary">
            <Check size={16} /> {editId ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tiêu đề</th>
              <th>Vị trí</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 20 }} /></td></tr>
              ))
            ) : banners.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>Chưa có banner</td></tr>
            ) : (
              banners.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ width: 80, height: 45, borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--color-bg-elevated)" }}>
                      <img src={b.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--color-text)" }}>{b.title}</td>
                  <td>
                    <span className="badge badge-info">
                      {positions.find((p) => p.value === b.position)?.label || b.position}
                    </span>
                  </td>
                  <td>{b.order}</td>
                  <td>
                    <button onClick={() => toggleActive(b.id, b.isActive)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <span className={`badge ${b.isActive ? "badge-success" : "badge-danger"}`}>
                        {b.isActive ? "Hiện" : "Ẩn"}
                      </span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button onClick={() => handleEdit(b)} className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                      <button onClick={() => setDeleteId(b.id)} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
        title="Xóa banner"
        message="Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
