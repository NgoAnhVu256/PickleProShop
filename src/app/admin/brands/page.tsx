"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Check, Award } from "lucide-react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
  _count?: { products: number };
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/admin/brands");
      const data = await res.json();
      if (data.success) setBrands(data.data);
    } catch {
      toast.error("Lỗi tải thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleSubmit = async () => {
    if (!name) { toast.error("Tên là bắt buộc"); return; }
    try {
      const url = editId ? `/api/admin/brands/${editId}` : "/api/admin/brands";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logo }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editId ? "Đã cập nhật" : "Đã tạo thương hiệu");
        resetForm();
        fetchBrands();
      } else {
        toast.error(data.error || "Lỗi");
      }
    } catch {
      toast.error("Lỗi thao tác");
    }
  };

  const handleEdit = (b: Brand) => {
    setEditId(b.id);
    setName(b.name);
    setLogo(b.logo || "");
    setShowForm(true);
  };

  const onConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/brands/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("Đã xóa"); fetchBrands(); }
      else toast.error(data.error || "Lỗi xóa");
    } catch {
      toast.error("Lỗi xóa");
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => { setShowForm(false); setEditId(null); setName(""); setLogo(""); };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#323b4b" }}>Thương hiệu</h1>
          <p style={{ fontSize: 13, color: "#8a98ac", marginTop: 2 }}>Quản lý các thương hiệu sản phẩm (JOOLA, Selkirk, Franklin...)</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
          <Plus size={16} /> Thêm thương hiệu
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#323b4b" }}>
              {editId ? "Sửa thương hiệu" : "Thêm thương hiệu mới"}
            </h2>
            <button onClick={resetForm} style={{ background: "none", border: "none", color: "#8a98ac", cursor: "pointer" }}><X size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#5a6677", display: "block", marginBottom: 8 }}>Tên thương hiệu *</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: JOOLA, Selkirk..." style={{ height: 42 }} />
            </div>
            <div>
              <ImageUpload 
                label="Logo thương hiệu"
                value={logo} 
                onChange={setLogo} 
                onRemove={() => setLogo("")}
                folder="brands"
                type="brand"
              />
            </div>
          </div>
          <button onClick={handleSubmit} className="btn btn-primary">
            <Check size={16} /> {editId ? "Cập nhật" : "Tạo thương hiệu"}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Thương hiệu</th>
              <th>Slug</th>
              <th>Logo</th>
              <th>Sản phẩm</th>
              <th style={{ textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={5}><div className="skeleton" style={{ height: 20 }} /></td></tr>
              ))
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 48 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#8a98ac" }}>
                    <Award size={36} strokeWidth={1.5} />
                    <span style={{ fontSize: 14 }}>Chưa có thương hiệu nào</span>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm" style={{ marginTop: 4 }}>
                      <Plus size={14} /> Thêm ngay
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f5f6fa", border: "1px solid #eef2f7", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                        {brand.logo
                          ? <img src={brand.logo} alt={brand.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          : <Award size={18} color="#b0bac9" />
                        }
                      </div>
                      <span style={{ fontWeight: 700, color: "#323b4b" }}>{brand.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "#8a98ac" }}>{brand.slug}</td>
                  <td>
                    {brand.logo
                      ? <span style={{ fontSize: 12, color: "#46b876" }}>✓ Có logo</span>
                      : <span style={{ fontSize: 12, color: "#b0bac9" }}>Chưa có</span>
                    }
                  </td>
                  <td>
                    <span style={{ background: "#f0f9f4", color: "#46b876", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {brand._count?.products ?? "—"} sản phẩm
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button onClick={() => handleEdit(brand)} className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                      <button onClick={() => setDeleteId(brand.id)} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
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
        title="Xóa thương hiệu"
        message="Bạn có chắc chắn muốn xóa thương hiệu này? Tất cả sản phẩm thuộc thương hiệu này sẽ bị ảnh hưởng."
      />
    </div>
  );
}
