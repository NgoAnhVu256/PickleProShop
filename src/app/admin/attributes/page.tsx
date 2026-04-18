"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Check, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/admin/ConfirmModal";

type AttributeType = "TEXT" | "SELECT" | "NUMBER" | "BOOLEAN";

interface Attribute {
  id: string;
  name: string;
  label: string;
  type: AttributeType;
  _count?: { variantValues: number };
}

const TYPE_LABELS: Record<AttributeType, { label: string; color: string; bg: string }> = {
  TEXT:    { label: "Văn bản",   color: "#3498db", bg: "rgba(52,152,219,0.1)" },
  SELECT:  { label: "Danh sách", color: "#9b59b6", bg: "rgba(155,89,182,0.1)" },
  NUMBER:  { label: "Số",        color: "#e67e22", bg: "rgba(230,126,34,0.1)" },
  BOOLEAN: { label: "Có/Không",  color: "#2ecc71", bg: "rgba(46,204,113,0.1)" },
};

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<AttributeType>("TEXT");

  const fetchAttributes = async () => {
    try {
      const res = await fetch("/api/admin/attributes");
      const data = await res.json();
      if (data.success) setAttributes(data.data);
    } catch {
      toast.error("Lỗi tải thuộc tính");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttributes(); }, []);

  const handleSubmit = async () => {
    if (!name || !label) { toast.error("Tên và nhãn là bắt buộc"); return; }
    try {
      const url = editId ? `/api/admin/attributes/${editId}` : "/api/admin/attributes";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, label, type }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editId ? "Đã cập nhật" : "Đã tạo thuộc tính");
        resetForm();
        fetchAttributes();
      } else {
        toast.error(data.error || "Lỗi");
      }
    } catch {
      toast.error("Lỗi thao tác");
    }
  };

  const handleEdit = (a: Attribute) => {
    setEditId(a.id);
    setName(a.name);
    setLabel(a.label);
    setType(a.type);
    setShowForm(true);
  };

  const onConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/attributes/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("Đã xóa"); fetchAttributes(); }
      else toast.error(data.error || "Lỗi xóa");
    } catch {
      toast.error("Lỗi xóa");
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setName("");
    setLabel("");
    setType("TEXT");
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#323b4b" }}>Thuộc tính sản phẩm</h1>
          <p style={{ fontSize: 13, color: "#8a98ac", marginTop: 2 }}>
            Định nghĩa các thuộc tính động (màu sắc, kích cỡ, độ dày...) — gán vào danh mục trong trang Danh mục
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
          <Plus size={16} /> Thêm thuộc tính
        </button>
      </div>

      {/* Info banner */}
      <div style={{
        background: "rgba(88,214,141,0.08)",
        border: "1px solid rgba(88,214,141,0.25)",
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 20,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}>
        <SlidersHorizontal size={18} color="#46b876" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#3aa866", marginBottom: 2 }}>Cách hoạt động</p>
          <p style={{ fontSize: 12, color: "#5a6677", lineHeight: 1.6 }}>
            Thuộc tính được tạo ở đây là <strong>danh sách chung</strong>. Sau đó vào <strong>Danh mục</strong> để gán thuộc tính phù hợp cho từng danh mục (vợt → độ dày, cỡ cán; giày → màu, size…).
            Khi tạo biến thể sản phẩm, hệ thống sẽ tự động hiển thị đúng thuộc tính của danh mục đó.
          </p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#323b4b" }}>
              {editId ? "Sửa thuộc tính" : "Thêm thuộc tính mới"}
            </h2>
            <button onClick={resetForm} style={{ background: "none", border: "none", color: "#8a98ac", cursor: "pointer" }}><X size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#5a6677", display: "block", marginBottom: 6 }}>
                Tên kỹ thuật * <span style={{ fontSize: 11, fontWeight: 400, color: "#b0bac9" }}>(lowercase, không dấu)</span>
              </label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                placeholder="color, size, thickness..."
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#5a6677", display: "block", marginBottom: 6 }}>Nhãn hiển thị *</label>
              <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Màu sắc, Kích cỡ, Độ dày..." />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#5a6677", display: "block", marginBottom: 6 }}>Kiểu dữ liệu</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value as AttributeType)}>
                <option value="TEXT">Văn bản (TEXT)</option>
                <option value="SELECT">Danh sách (SELECT)</option>
                <option value="NUMBER">Số (NUMBER)</option>
                <option value="BOOLEAN">Có/Không (BOOLEAN)</option>
              </select>
            </div>
          </div>
          <button onClick={handleSubmit} className="btn btn-primary">
            <Check size={16} /> {editId ? "Cập nhật" : "Tạo thuộc tính"}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tên kỹ thuật</th>
              <th>Nhãn hiển thị</th>
              <th>Kiểu dữ liệu</th>
              <th>Đang dùng</th>
              <th style={{ textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5}><div className="skeleton" style={{ height: 20 }} /></td></tr>
              ))
            ) : attributes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 48 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#8a98ac" }}>
                    <SlidersHorizontal size={36} strokeWidth={1.5} />
                    <span style={{ fontSize: 14 }}>Chưa có thuộc tính nào</span>
                    <p style={{ fontSize: 12, maxWidth: 300, textAlign: "center", lineHeight: 1.6 }}>
                      Tạo thuộc tính như "color", "size", "thickness" trước, rồi gán vào từng danh mục.
                    </p>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Thêm ngay
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              attributes.map((attr) => {
                const typeInfo = TYPE_LABELS[attr.type];
                return (
                  <tr key={attr.id}>
                    <td>
                      <code style={{
                        background: "#f5f6fa",
                        border: "1px solid #eef2f7",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 13,
                        fontFamily: "monospace",
                        color: "#323b4b",
                        fontWeight: 600,
                      }}>
                        {attr.name}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600, color: "#323b4b" }}>{attr.label}</td>
                    <td>
                      <span style={{
                        background: typeInfo.bg,
                        color: typeInfo.color,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "#5a6677" }}>
                        {attr._count?.variantValues ?? 0} biến thể
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button onClick={() => handleEdit(attr)} className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                        <button onClick={() => setDeleteId(attr.id)} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
        title="Xóa thuộc tính"
        message="Bạn có chắc chắn muốn xóa thuộc tính này? Các biến thể sản phẩm đang sử dụng thuộc tính này sẽ bị ảnh hưởng."
      />
    </div>
  );
}
