"use client";

import { useState, useEffect, use, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Tag, Layers, Loader2, DollarSign, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";
import MultiImageUpload from "@/components/admin/MultiImageUpload";

const RichTextEditor = lazy(() => import("@/components/admin/RichTextEditor"));

interface Category {
  id: string;
  name: string;
  categoryAttrs?: { attribute: { id: string; label: string; name: string } }[];
}

interface Brand {
  id: string;
  name: string;
}

interface VariantForm {
  id?: string;
  sku: string;
  price: string;
  stock: string;
  images: string[];
  attrValues: { attributeId: string; value: string }[];
}

export default function AdminEditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Data
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
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<VariantForm[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes, bRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/admin/categories"),
          fetch("/api/admin/brands")
        ]);

        const [pData, cData, bData] = await Promise.all([
          pRes.json(), cRes.json(), bRes.json()
        ]);

        if (pData.success) {
          const p = pData.data;
          setName(p.name);
          setDescription(p.description || "");
          setBasePrice(String(p.basePrice));
          setSalePrice(p.salePrice ? String(p.salePrice) : "");
          setSaleStartAt(p.saleStartAt ? new Date(p.saleStartAt).toISOString().slice(0, 16) : "");
          setSaleEndAt(p.saleEndAt ? new Date(p.saleEndAt).toISOString().slice(0, 16) : "");
          setCategoryId(p.categoryId);
          setBrandId(p.brandId || "");
          setThumbnail(p.thumbnail || "");
          setIsActive(p.isActive);

          // Gallery: prefer gallery relation, fall back to images array
          if (p.gallery && p.gallery.length > 0) {
            setGalleryImages(p.gallery.map((g: any) => g.url));
          } else if (p.images && p.images.length > 0) {
            setGalleryImages(p.images);
          }

          // If no thumbnail, use first image
          if (!p.thumbnail && p.images && p.images.length > 0) {
            setThumbnail(p.images[0]);
          }

          setVariants(p.variants.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            price: String(v.price),
            stock: String(v.stock),
            images: v.images || [],
            attrValues: v.attrValues.map((av: any) => ({
              attributeId: av.attributeId,
              value: av.value
            }))
          })));
        }

        if (cData.success) setCategories(cData.data);
        if (bData.success) setBrands(bData.data);
      } catch (error) {
        toast.error("Lỗi đồng bộ dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const categoryAttributes = selectedCategory?.categoryAttrs?.map(ca => ca.attribute) || [];

  // Pricing helpers
  const discountPercent = (() => {
    const bp = parseFloat(basePrice);
    const sp = parseFloat(salePrice);
    if (bp > 0 && sp > 0 && sp < bp) {
      return Math.round(((bp - sp) / bp) * 100);
    }
    return 0;
  })();

  const addVariant = () => {
    setVariants([...variants, {
      sku: `${name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      price: basePrice,
      stock: "0",
      images: [],
      attrValues: categoryAttributes.map(a => ({ attributeId: a.id, value: "" }))
    }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const updateVariantAttr = (vIndex: number, attrId: string, value: string) => {
    const updated = [...variants];
    const attrIndex = updated[vIndex].attrValues.findIndex(av => av.attributeId === attrId);
    if (attrIndex > -1) {
      updated[vIndex].attrValues[attrIndex].value = value;
    } else {
      updated[vIndex].attrValues.push({ attributeId: attrId, value });
    }
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) {
      toast.error("Tên và danh mục là bắt buộc");
      return;
    }

    const sp = parseFloat(salePrice);
    const bp = parseFloat(basePrice);
    if (salePrice && sp >= bp) {
      toast.error("Giá khuyến mãi phải nhỏ hơn giá gốc");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          basePrice: bp || 0,
          salePrice: salePrice ? sp : null,
          saleStartAt: saleStartAt || null,
          saleEndAt: saleEndAt || null,
          categoryId,
          brandId: brandId || null,
          thumbnail,
          images: galleryImages,
          isActive,
          gallery: galleryImages.map(url => ({ url })),
          variants: variants.map(v => ({
            ...v,
            price: parseFloat(v.price) || 0,
            stock: parseInt(v.stock) || 0,
            images: v.images
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Cập nhật sản phẩm thành công!");
        router.push("/admin/products");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi cập nhật");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin/products" style={{ color: "#8a98ac" }}><ArrowLeft size={20} /></Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#323b4b" }}>Chỉnh sửa sản phẩm</h1>
          <p style={{ fontSize: 13, color: "#8a98ac" }}>ID: {id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }} className="admin-grid-layout">
          {/* ─── Main Content ──────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Basic Info */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title"><Tag size={18} color="#58d68d" /> Thông tin cơ bản</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="input-label">Tên sản phẩm *</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="input-label">Thương hiệu</label>
                    <select className="input" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                      <option value="">Không có thương hiệu</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Danh mục *</label>
                    <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Rich Text Description */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title"><Tag size={18} color="#3498db" /> Mô tả sản phẩm</h2>
              <Suspense fallback={<div className="skeleton" style={{ height: 300 }} />}>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                />
              </Suspense>
            </div>

            {/* Pricing */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title"><DollarSign size={18} color="#e67e22" /> Giá bán</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="input-label">Giá gốc (VNĐ) *</label>
                  <input className="input" type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} min="0" />
                </div>
                <div>
                  <label className="input-label">Giá khuyến mãi (VNĐ)</label>
                  <input className="input" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Để trống nếu không KM" min="0" />
                  {discountPercent > 0 && (
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        -{discountPercent}%
                      </span>
                      <span style={{ fontSize: 11, color: "#8a98ac" }}>
                        Tiết kiệm {new Intl.NumberFormat("vi-VN").format(parseFloat(basePrice) - parseFloat(salePrice))}đ
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {salePrice && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 16, background: "#fff9f0", borderRadius: 10, border: "1px solid #ffeeba" }}>
                  <div>
                    <label className="input-label" style={{ color: "#856404" }}>KM bắt đầu từ</label>
                    <input className="input" type="datetime-local" value={saleStartAt} onChange={(e) => setSaleStartAt(e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label" style={{ color: "#856404" }}>KM kết thúc lúc</label>
                    <input className="input" type="datetime-local" value={saleEndAt} onChange={(e) => setSaleEndAt(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            {/* Media */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="section-title"><ImageIcon size={18} color="#9b59b6" /> Hình ảnh sản phẩm (Ảnh đại diện & Thư viện)</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
                <div>
                  <ImageUpload
                    label="Thumbnail (ảnh chính)"
                    value={thumbnail}
                    onChange={setThumbnail}
                    onRemove={() => setThumbnail("")}
                    folder="products"
                  />
                </div>
                <div>
                  <MultiImageUpload
                    label="Thêm hình ảnh khác (Gallery)"
                    value={galleryImages}
                    onChange={setGalleryImages}
                    onRemove={(url) => setGalleryImages(galleryImages.filter(i => i !== url))}
                    folder="products"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>
                  <Layers size={18} color="#58d68d" /> Biến thể (Mẫu mã / Màu sắc)
                </h2>
              </div>

              {variants.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", background: "#f8f9fb", borderRadius: 12, border: "2px dashed #eef2f7" }}>
                  <p style={{ color: "#8a98ac", fontSize: 13, marginBottom: 12 }}>Chưa có biến thể nào</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
                  {variants.map((variant, vIndex) => (
                    <div key={vIndex} style={{ padding: 20, borderRadius: 12, border: "1px solid #eef2f7", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <span style={{ fontWeight: 700, color: "#323b4b", fontSize: 14 }}>#{vIndex + 1} - {variant.sku || "Nhập SKU"}</span>
                        <button type="button" onClick={() => removeVariant(vIndex)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16} /></button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                        <div>
                          <label className="input-label" style={{ fontSize: 11 }}>Mã SKU</label>
                          <input className="input" value={variant.sku} onChange={(e) => updateVariant(vIndex, "sku", e.target.value)} placeholder="SKU..." />
                        </div>
                        <div>
                          <label className="input-label" style={{ fontSize: 11 }}>Giá variant</label>
                          <input className="input" type="number" value={variant.price} onChange={(e) => updateVariant(vIndex, "price", e.target.value)} />
                        </div>
                        <div>
                          <label className="input-label" style={{ fontSize: 11 }}>Tồn kho</label>
                          <input className="input" type="number" value={variant.stock} onChange={(e) => updateVariant(vIndex, "stock", e.target.value)} />
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label className="input-label" style={{ fontSize: 11 }}>Hình ảnh biến thể này</label>
                        <MultiImageUpload
                          label=""
                          value={variant.images || []}
                          onChange={(urls) => updateVariant(vIndex, "images", urls)}
                          onRemove={(url) => updateVariant(vIndex, "images", (variant.images || []).filter(img => img !== url))}
                          folder={`products/variants`}
                        />
                      </div>

                      {categoryAttributes.length > 0 && (
                        <div style={{ background: "#f8f9fb", padding: 12, borderRadius: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {categoryAttributes.map(attr => {
                            const val = variant.attrValues.find(av => av.attributeId === attr.id)?.value || "";
                            return (
                              <div key={attr.id}>
                                <label className="input-label" style={{ fontSize: 11, color: "#8a98ac" }}>{attr.label}</label>
                                <input
                                  className="input"
                                  value={val}
                                  onChange={(e) => updateVariantAttr(vIndex, attr.id, e.target.value)}
                                  placeholder={`Nhập ${attr.label.toLowerCase()}...`}
                                  style={{ background: "#fff" }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button type="button" onClick={addVariant} className="btn btn-secondary btn-sm" style={{ width: "100%", padding: "10px", marginTop: "10px", display: "flex", justifyContent: "center", gap: 8 }}>
                <Plus size={16} /> Thêm biến thể mới
              </button>
            </div>
          </div>

          {/* ─── Sidebar ──────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card" style={{ padding: 24, position: "sticky", top: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#323b4b", marginBottom: 20 }}>Trạng thái & Lưu</h2>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#5a6677" }}>Hiển thị công khai</span>
                </label>
              </div>

              {/* Price preview */}
              {basePrice && (
                <div style={{ marginBottom: 20, padding: 16, background: "#f8f9fb", borderRadius: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#8a98ac", marginBottom: 8, textTransform: "uppercase" }}>Xem trước giá</p>
                  {salePrice && parseFloat(salePrice) < parseFloat(basePrice) ? (
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#dc2626" }}>
                        {new Intl.NumberFormat("vi-VN").format(parseFloat(salePrice))}đ
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 14, color: "#8a98ac", textDecoration: "line-through" }}>
                          {new Intl.NumberFormat("vi-VN").format(parseFloat(basePrice))}đ
                        </span>
                        <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                          -{discountPercent}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#323b4b" }}>
                      {new Intl.NumberFormat("vi-VN").format(parseFloat(basePrice))}đ
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", height: 44, fontSize: 15 }}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="spinner" size={18} /> : <Save size={18} />}
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <Link href="/admin/products" className="btn btn-secondary" style={{ width: "100%", marginTop: 12, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                Hủy
              </Link>
            </div>
          </div>
        </div>
      </form>

    </div>
  );
}
