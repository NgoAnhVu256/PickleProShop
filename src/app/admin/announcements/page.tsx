"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Check, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { useConfirm } from "@/hooks/useConfirm";

interface Announcement {
  id: string;
  content: string;
  image: string | null;
  buttonText: string | null;
  link: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
}

const defaultForm = {
  content: "",
  image: "",
  buttonText: "",
  link: "",
  isActive: true,
  endDate: "",
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const { confirm, ConfirmDialog } = useConfirm();

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (data.success) setAnnouncements(data.data);
    } catch {
      toast.error("Lỗi tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async () => {
    if (!form.content) { toast.error("Nội dung là bắt buộc"); return; }
    try {
      const url = editId ? `/api/admin/announcements/${editId}` : "/api/admin/announcements";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: form.content,
          image: form.image || null,
          buttonText: form.buttonText || null,
          link: form.link || null,
          isActive: form.isActive,
          endDate: form.endDate || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editId ? "Cập nhật thành công" : "Tạo thành công");
        resetForm();
        fetchAnnouncements();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi");
    }
  };

  const handleEdit = (a: Announcement) => {
    setEditId(a.id);
    setForm({
      content: a.content,
      image: a.image || "",
      buttonText: a.buttonText || "",
      link: a.link || "",
      isActive: a.isActive,
      endDate: a.endDate ? a.endDate.slice(0, 10) : "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: "Xóa thông báo", message: "Bạn có chắc muốn xóa thông báo này?", confirmText: "Xóa", variant: "danger" });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("Đã xóa"); fetchAnnouncements(); }
    } catch { toast.error("Lỗi xóa"); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Cập nhật thành công"); fetchAnnouncements(); }
    } catch { toast.error("Lỗi"); }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(defaultForm);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Announcement Bar (Header Top)</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>
            Thanh thông báo cố định trên cùng trang chủ. Hỗ trợ văn bản và hình ảnh banner.
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
          <Plus size={16} /> Thêm thông báo
        </button>
      </div>

      {/* ─── FORM ─────────────────────────────── */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>
              {editId ? "Sửa thông báo" : "Thêm thông báo"}
            </h2>
            <button onClick={resetForm} style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Left: Text fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
                  Nội dung hiển thị *
                </label>
                <input
                  className="input"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="🔥 Freeship cho đơn hàng từ 500k – Mua ngay!"
                />
                <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>
                  Hỗ trợ emoji. Đây là văn bản hiển thị trên thanh thông báo.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
                    Nút CTA (tùy chọn)
                  </label>
                  <input
                    className="input"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    placeholder="MUA NGAY"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
                    Link liên kết
                  </label>
                  <input
                    className="input"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="https://... hoặc /danh-muc/..."
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
                    Ngày kết thúc (tùy chọn)
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", paddingBottom: 12 }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span style={{ fontSize: 14 }}>Kích hoạt</span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              {form.content && (
                <div style={{
                  background: "linear-gradient(to right, #d1fae5, #ecfdf5, #ccfbf1)",
                  padding: "8px 16px",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                }}>
                  <span>🏸</span>
                  <span style={{ flex: 1 }}>{form.content}</span>
                  {form.buttonText && (
                    <span style={{
                      background: "#059669",
                      color: "white",
                      padding: "2px 12px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                    }}>{form.buttonText}</span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Image upload */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
                Hình ảnh banner (tùy chọn)
              </label>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 10 }}>
                Nếu có ảnh, sẽ hiển thị làm nền hoặc hình minh họa bên cạnh văn bản trong announcement bar.
              </p>
              <ImageUpload
                label=""
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                onRemove={() => setForm({ ...form, image: "" })}
                folder="announcements"
              />
            </div>
          </div>

          <div style={{ marginTop: 20, borderTop: "1px solid var(--color-border)", paddingTop: 16, display: "flex", gap: 10 }}>
            <button onClick={handleSubmit} className="btn btn-primary">
              <Check size={16} /> {editId ? "Cập nhật" : "Tạo mới"}
            </button>
            <button onClick={resetForm} className="btn btn-secondary">
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* ─── TABLE ─────────────────────────────── */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Ảnh</th>
              <th>Nội dung</th>
              <th>Nút CTA</th>
              <th>Link</th>
              <th>Trạng thái</th>
              <th>Ngày kết thúc</th>
              <th style={{ textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 20 }} /></td></tr>
              ))
            ) : announcements.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>
                  Chưa có thông báo. Nhấn "+ Thêm thông báo" để bắt đầu.
                </td>
              </tr>
            ) : (
              announcements.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.image ? (
                      <div style={{ width: 70, height: 35, borderRadius: 6, overflow: "hidden", background: "var(--color-bg-elevated)" }}>
                        <img src={a.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ) : (
                      <div style={{ width: 70, height: 35, borderRadius: 6, background: "var(--color-bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ImageIcon size={16} style={{ color: "var(--color-text-muted)" }} />
                      </div>
                    )}
                  </td>
                  <td style={{ color: "var(--color-text)", maxWidth: 250, fontSize: 13 }}>
                    {a.content}
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {a.buttonText ? (
                      <span style={{ background: "var(--color-primary)", color: "white", padding: "2px 8px", borderRadius: 999, fontSize: 11 }}>
                        {a.buttonText}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {a.link ? (
                      <a href={a.link} target="_blank" rel="noopener" style={{ color: "var(--color-primary)" }}>
                        {a.link.length > 30 ? a.link.slice(0, 30) + "…" : a.link}
                      </a>
                    ) : "—"}
                  </td>
                  <td>
                    <button onClick={() => toggleActive(a.id, a.isActive)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <span className={`badge ${a.isActive ? "badge-success" : "badge-danger"}`}>
                        {a.isActive ? "Hiện" : "Ẩn"}
                      </span>
                    </button>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    {a.endDate ? new Date(a.endDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button onClick={() => handleEdit(a)} className="btn btn-secondary btn-sm">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="btn btn-danger btn-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog />
    </div>
  );
}
