"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Check, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/admin/ImageUpload";

interface Attribute {
  id: string;
  name: string;
  label: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: { products: number };
  categoryAttrs?: { attribute: Attribute }[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedAttrIds, setSelectedAttrIds] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const [catsRes, attrsRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/attributes")
      ]);
      const catsData = await catsRes.json();
      const attrsData = await attrsRes.json();
      
      if (catsData.success) setCategories(catsData.data);
      if (attrsData.success) setAllAttributes(attrsData.data);
    } catch {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleAttribute = (id: string) => {
    setSelectedAttrIds(prev => 
      prev.includes(id) ? prev.filter(attrId => attrId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name) { toast.error("Tên là bắt buộc"); return; }

    try {
      const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          description, 
          image, 
          attributeIds: selectedAttrIds 
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editId ? "Cập nhật thành công" : "Tạo thành công");
        resetForm();
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi thao tác");
    }
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setSelectedAttrIds(cat.categoryAttrs?.map(a => a.attribute.id) || []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa");
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi xóa");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setName("");
    setDescription("");
    setImage("");
    setSelectedAttrIds([]);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Quản lý danh mục</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>{editId ? "Sửa danh mục" : "Thêm danh mục"}</h2>
            <button onClick={resetForm} style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32, marginBottom: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="input-label">Tên danh mục *</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Vợt Pickleball" />
              </div>
              <div>
                <label className="input-label">Mô tả</label>
                <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả danh mục..." style={{ height: 100, resize: "none" }} />
              </div>
              
              {/* Attribute Selection */}
              <div style={{ marginTop: 10 }}>
                <label className="input-label" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <Settings2 size={16} /> Các biến thể sẽ hiển thị
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                  {allAttributes.map(attr => (
                    <label key={attr.id} style={{ 
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", 
                      borderRadius: 8, border: "1px solid #eef2f7", background: selectedAttrIds.includes(attr.id) ? "rgba(88,214,141,0.06)" : "#fff",
                      cursor: "pointer", transition: "all 0.15s"
                    }}>
                      <input 
                        type="checkbox" 
                        checked={selectedAttrIds.includes(attr.id)} 
                        onChange={() => toggleAttribute(attr.id)}
                        style={{ accentColor: "var(--color-primary)" }}
                      />
                      <span style={{ fontSize: 13, color: selectedAttrIds.includes(attr.id) ? "var(--color-primary)" : "#5a6677", fontWeight: selectedAttrIds.includes(attr.id) ? 600 : 400 }}>
                        {attr.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <ImageUpload 
                label="Hình ảnh đại diện"
                value={image} 
                onChange={setImage} 
                onRemove={() => setImage("")}
                folder="categories"
              />
            </div>
          </div>
          
          <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: "10px 24px" }}>
            <Check size={16} /> {editId ? "Cập nhật danh mục" : "Tạo danh mục"}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="table-container shadow-sm">
        <table>
          <thead>
            <tr>
              <th>Danh mục</th>
              <th>Thuộc tính / Biến thể</th>
              <th>Sản phẩm</th>
              <th style={{ textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={4}><div className="skeleton" style={{ height: 20 }} /></td></tr>
              ))
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>Chưa có danh mục nào</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f8f9fb", overflow: "hidden" }}>
                        {cat.image && <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 700, color: "#323b4b" }}>{cat.name}</span>
                        <span style={{ fontSize: 11, color: "#8a98ac" }}>{cat.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {cat.categoryAttrs && cat.categoryAttrs.length > 0 ? (
                        cat.categoryAttrs.map(ca => (
                          <span key={ca.attribute.id} style={{ 
                            fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#f1f3f9", color: "#5a6677", border: "1px solid #eef2f7" 
                          }}>
                            {ca.attribute.label}
                          </span>
                        ))
                      ) : <span style={{ fontSize: 11, color: "#b0bac9" }}>—</span>}
                    </div>
                  </td>
                  <td><span className="badge badge-secondary">{cat._count.products}</span></td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button onClick={() => handleEdit(cat)} className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .input-label { display: block; font-size: 13px; font-weight: 600; color: #5a6677; margin-bottom: 6px; }
      `}</style>
    </div>
  );
}
