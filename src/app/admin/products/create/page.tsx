"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Tag, Layers, Loader2, DollarSign, Image as ImageIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";
import MultiImageUpload from "@/components/admin/MultiImageUpload";

const RichTextEditor = lazy(() => import("@/components/admin/RichTextEditor"));

interface Category { id: string; name: string; categoryAttrs?: { attribute: { id: string; label: string; name: string } }[]; }
interface Brand { id: string; name: string; }

// Option-Matrix: mỗi nhóm màu sắc chứa nhiều size
interface ColorGroup {
  color: string;
  images: string[];
  sizes: { size: string; sku: string; price: string; stock: string }[];
}

export default function AdminCreateProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleStartAt, setSaleStartAt] = useState("");
  const [saleEndAt, setSaleEndAt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [stock, setStock] = useState("0");

  // Option-Matrix state
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then(r => r.json()),
      fetch("/api/admin/brands").then(r => r.json())
    ]).then(([cData, bData]) => {
      if (cData.success) setCategories(cData.data);
      if (bData.success) setBrands(bData.data);
      setLoading(false);
    });
  }, []);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const categoryAttributes = selectedCategory?.categoryAttrs?.map(ca => ca.attribute) || [];
  let primaryAttr = categoryAttributes.find(a => a.name.toLowerCase().includes("color") || a.name.toLowerCase().includes("mau"));
  let secondaryAttr = categoryAttributes.find(a => a.name.toLowerCase().includes("size") || a.name.toLowerCase().includes("kich") || a.name.toLowerCase() === "thickness");
  
  if (!primaryAttr && categoryAttributes.length > 0) {
    primaryAttr = categoryAttributes[0];
    if (!secondaryAttr && categoryAttributes.length > 1) secondaryAttr = categoryAttributes[1];
  } else if (primaryAttr && !secondaryAttr && categoryAttributes.length > 1) {
    secondaryAttr = categoryAttributes.find(a => a.id !== primaryAttr?.id);
  } else if (!primaryAttr && secondaryAttr && categoryAttributes.length > 1) {
     primaryAttr = categoryAttributes.find(a => a.id !== secondaryAttr?.id);
  }

  const hasVariants = categoryAttributes.length > 0;

  const discountPercent = (() => {
    const bp = parseFloat(basePrice); const sp = parseFloat(salePrice);
    if (bp > 0 && sp > 0 && sp < bp) return Math.round(((bp - sp) / bp) * 100);
    return 0;
  })();

  // ─── Color Group helpers ───
  const addColorGroup = () => {
    setColorGroups([...colorGroups, { color: "", images: [], sizes: [{ size: "", sku: "", price: basePrice || "0", stock: "0" }] }]);
  };
  const removeColorGroup = (idx: number) => setColorGroups(colorGroups.filter((_, i) => i !== idx));
  const updateColorGroup = (idx: number, field: string, val: any) => {
    const u = [...colorGroups]; (u[idx] as any)[field] = val; setColorGroups(u);
  };
  const addSizeToColor = (cIdx: number) => {
    const u = [...colorGroups];
    u[cIdx].sizes.push({ size: "", sku: "", price: basePrice || "0", stock: "0" });
    setColorGroups(u);
  };
  const removeSizeFromColor = (cIdx: number, sIdx: number) => {
    const u = [...colorGroups];
    u[cIdx].sizes = u[cIdx].sizes.filter((_, i) => i !== sIdx);
    setColorGroups(u);
  };
  const updateSize = (cIdx: number, sIdx: number, field: string, val: string) => {
    const u = [...colorGroups];
    (u[cIdx].sizes[sIdx] as any)[field] = val;
    setColorGroups(u);
  };

  // Convert matrix to flat variants for API
  const buildVariants = () => {
    if (!hasVariants) return [];
    const variants: any[] = [];
    colorGroups.forEach(cg => {
      cg.sizes.forEach(s => {
        if (!s.sku) return;
        variants.push({
          sku: s.sku,
          price: parseFloat(s.price) || 0,
          stock: parseInt(s.stock) || 0,
          images: cg.images,
          attrValues: [
            primaryAttr && cg.color ? { attributeId: primaryAttr.id, value: cg.color } : null,
            secondaryAttr && s.size ? { attributeId: secondaryAttr.id, value: s.size } : null,
          ].filter(Boolean),
        });
      });
    });
    return variants;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) { toast.error("Tên và danh mục là bắt buộc"); return; }
    const sp = parseFloat(salePrice); const bp = parseFloat(basePrice);
    if (salePrice && sp >= bp) { toast.error("Giá khuyến mãi phải nhỏ hơn giá gốc"); return; }

    setSubmitting(true);
    try {
      const variants = buildVariants();
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description, basePrice: bp || 0,
          salePrice: salePrice ? sp : null,
          saleStartAt: saleStartAt || null, saleEndAt: saleEndAt || null,
          categoryId, brandId: brandId || null, thumbnail,
          images: galleryImages,
          gallery: galleryImages.map(url => ({ url })),
          variants,
          stock: colorGroups.length === 0 ? (parseInt(stock) || 0) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Tạo sản phẩm thành công!"); router.push("/admin/products"); }
      else toast.error(data.error);
    } catch { toast.error("Lỗi tạo sản phẩm"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin/products" style={{ color: "#8a98ac" }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#323b4b" }}>Thêm sản phẩm mới</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }} className="admin-grid-layout">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Basic Info */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title"><Tag size={18} color="#58d68d" /> Thông tin cơ bản</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="input-label">Tên sản phẩm *</label>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Tên sản phẩm..." required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="input-label">Thương hiệu</label>
                    <select className="input" value={brandId} onChange={e => setBrandId(e.target.value)}>
                      <option value="">Chọn thương hiệu</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Danh mục *</label>
                    <select className="input" value={categoryId} onChange={e => { setCategoryId(e.target.value); setColorGroups([]); }} required>
                      <option value="">Chọn danh mục</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title"><Tag size={18} color="#3498db" /> Mô tả sản phẩm</h2>
              <Suspense fallback={<div className="skeleton" style={{ height: 300 }} />}>
                <RichTextEditor value={description} onChange={setDescription} />
              </Suspense>
            </div>

            {/* Pricing */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title"><DollarSign size={18} color="#e67e22" /> Giá bán</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="input-label">Giá gốc (VNĐ) *</label>
                  <input className="input" type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="0" min="0" />
                </div>
                <div>
                  <label className="input-label">Giá khuyến mãi (VNĐ)</label>
                  <input className="input" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="Để trống nếu không KM" min="0" />
                  {discountPercent > 0 && (
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>-{discountPercent}%</span>
                      <span style={{ fontSize: 11, color: "#8a98ac" }}>Tiết kiệm {new Intl.NumberFormat("vi-VN").format(parseFloat(basePrice) - parseFloat(salePrice))}đ</span>
                    </div>
                  )}
                </div>
              </div>
              {salePrice && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 16, background: "#fff9f0", borderRadius: 10, border: "1px solid #ffeeba" }}>
                  <div><label className="input-label" style={{ color: "#856404" }}>KM bắt đầu từ</label><input className="input" type="datetime-local" value={saleStartAt} onChange={e => setSaleStartAt(e.target.value)} /></div>
                  <div><label className="input-label" style={{ color: "#856404" }}>KM kết thúc lúc</label><input className="input" type="datetime-local" value={saleEndAt} onChange={e => setSaleEndAt(e.target.value)} /></div>
                </div>
              )}
            </div>

            {/* Media */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title"><ImageIcon size={18} color="#9b59b6" /> Hình ảnh sản phẩm</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
                <ImageUpload label="Thumbnail (ảnh chính)" value={thumbnail} onChange={setThumbnail} onRemove={() => setThumbnail("")} folder="products" />
                <MultiImageUpload label="Thêm hình ảnh khác (Gallery)" value={galleryImages} onChange={setGalleryImages} onRemove={url => setGalleryImages(galleryImages.filter(i => i !== url))} folder="products" />
              </div>
            </div>

            {/* ─── OPTION-MATRIX: Color → Sizes ─── */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}><Layers size={18} color="#58d68d" /> Biến thể</h2>
              </div>

              {!categoryId && (
                <div style={{ padding: 20, textAlign: "center", background: "#fff9f0", border: "1px solid #ffeeba", borderRadius: 8, color: "#856404", fontSize: 13 }}>
                  Vui lòng chọn danh mục trước khi thêm biến thể.
                </div>
              )}

              {categoryId && colorGroups.length === 0 && (
                <div style={{ padding: 20, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, marginBottom: hasVariants ? 16 : 0 }}>
                  <p style={{ color: "#0369a1", fontSize: 13, marginBottom: 16 }}>
                    Sản phẩm chưa có biến thể. Nhập số lượng tồn kho trực tiếp.
                  </p>
                  <div>
                    <label className="input-label">Số lượng tồn kho *</label>
                    <input className="input" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" min="0" />
                  </div>
                </div>
              )}

              {categoryId && hasVariants && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
                    {colorGroups.map((cg, cIdx) => (
                      <div key={cIdx} style={{ padding: 20, border: "2px solid #e2e8f0", borderRadius: 16, background: "#fafbfc" }}>
                        {/* Primary Attribute Header */}
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                          <div style={{ flex: 1 }}>
                            <label className="input-label" style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>{primaryAttr?.label || "Nhóm biến thể"}</label>
                            <input className="input" value={cg.color} onChange={e => updateColorGroup(cIdx, "color", e.target.value)} placeholder={`Nhập ${primaryAttr?.label?.toLowerCase() || "giá trị"}...`} style={{ fontWeight: 700, fontSize: 15 }} />
                          </div>
                          <button type="button" onClick={() => removeColorGroup(cIdx)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", marginTop: 24 }}><Trash2 size={18} /></button>
                        </div>

                        {/* Primary Images */}
                        <div style={{ marginBottom: 16 }}>
                          <MultiImageUpload
                            label={`Ảnh cho ${primaryAttr?.label?.toLowerCase() || "nhóm"} này`}
                            value={cg.images}
                            onChange={urls => updateColorGroup(cIdx, "images", urls)}
                            onRemove={url => updateColorGroup(cIdx, "images", cg.images.filter(i => i !== url))}
                            folder="products/variants"
                          />
                        </div>

                        {/* Secondary Attributes Table */}
                        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                          <div style={{ display: "grid", gridTemplateColumns: secondaryAttr ? "1fr 2fr 1.2fr 1fr auto" : "2fr 1.2fr 1fr auto", gap: 0, padding: "8px 12px", background: "#f1f5f9", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                            {secondaryAttr && <span>{secondaryAttr.label}</span>}<span>Mã SKU</span><span>Giá (VNĐ)</span><span>Tồn kho</span><span></span>
                          </div>
                          {cg.sizes.map((s, sIdx) => (
                            <div key={sIdx} style={{ display: "grid", gridTemplateColumns: secondaryAttr ? "1fr 2fr 1.2fr 1fr auto" : "2fr 1.2fr 1fr auto", gap: 8, padding: "8px 12px", borderTop: "1px solid #f1f5f9", alignItems: "center" }}>
                              {secondaryAttr && <input className="input" value={s.size} onChange={e => updateSize(cIdx, sIdx, "size", e.target.value)} placeholder={secondaryAttr.name === "thickness" ? "16mm" : `Nhập ${secondaryAttr.label?.toLowerCase()}`} style={{ fontSize: 13 }} />}
                              <input className="input" value={s.sku} onChange={e => updateSize(cIdx, sIdx, "sku", e.target.value)} placeholder="Mã SKU" style={{ fontSize: 13 }} />
                              <input className="input" type="number" value={s.price} onChange={e => updateSize(cIdx, sIdx, "price", e.target.value)} style={{ fontSize: 13 }} />
                              <input className="input" type="number" value={s.stock} onChange={e => updateSize(cIdx, sIdx, "stock", e.target.value)} style={{ fontSize: 13 }} />
                              <button type="button" onClick={() => removeSizeFromColor(cIdx, sIdx)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}><X size={16} /></button>
                            </div>
                          ))}
                          {secondaryAttr && (
                            <div style={{ padding: "8px 12px" }}>
                              <button type="button" onClick={() => addSizeToColor(cIdx)} style={{ width: "100%", padding: 8, border: "1px dashed #cbd5e1", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 12, color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                <Plus size={14} /> Thêm {secondaryAttr.label?.toLowerCase() || "thuộc tính"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={addColorGroup} className="btn btn-secondary btn-sm" style={{ width: "100%", padding: 12, display: "flex", justifyContent: "center", gap: 8, fontSize: 13 }}>
                    <Plus size={16} /> Thêm {primaryAttr?.label?.toLowerCase() || "nhóm"} mới
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ padding: 24, position: "sticky", top: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#323b4b", marginBottom: 16 }}>Hành động</h2>
              {basePrice && (
                <div style={{ marginBottom: 20, padding: 16, background: "#f8f9fb", borderRadius: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#8a98ac", marginBottom: 8, textTransform: "uppercase" }}>Xem trước giá</p>
                  {salePrice && parseFloat(salePrice) < parseFloat(basePrice) ? (
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#dc2626" }}>{new Intl.NumberFormat("vi-VN").format(parseFloat(salePrice))}đ</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 14, color: "#8a98ac", textDecoration: "line-through" }}>{new Intl.NumberFormat("vi-VN").format(parseFloat(basePrice))}đ</span>
                        <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>-{discountPercent}%</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#323b4b" }}>{new Intl.NumberFormat("vi-VN").format(parseFloat(basePrice))}đ</div>
                  )}
                </div>
              )}

              {/* Summary */}
              {colorGroups.length > 0 && (
                <div style={{ marginBottom: 20, padding: 12, background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", marginBottom: 6 }}>Tóm tắt biến thể</p>
                  <p style={{ fontSize: 13, color: "#15803d" }}>{colorGroups.length} {primaryAttr?.label?.toLowerCase() || "nhóm"} • {colorGroups.reduce((sum, cg) => sum + cg.sizes.length, 0)} biến thể</p>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 44 }} disabled={submitting}>
                {submitting ? <Loader2 className="spinner" size={18} /> : null}
                {submitting ? "Đang tạo..." : "Tạo sản phẩm"}
              </button>
              <Link href="/admin/products" className="btn btn-secondary" style={{ width: "100%", marginTop: 12, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>Hủy</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
