"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, Calendar, Gift, Search, X, PackageOpen, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CreatePromotionPage() {
  const router = useRouter();
  
  // General
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState("");
  const [noEndDate, setNoEndDate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [priority, setPriority] = useState(0);
  const [description, setDescription] = useState("");
  const [stackable, setStackable] = useState(false);

  // Conditions (Buy X)
  const [searchX, setSearchX] = useState("");
  const [resultsX, setResultsX] = useState<any[]>([]);
  const [isSearchingX, setIsSearchingX] = useState(false);
  const [conditions, setConditions] = useState<any[]>([]);

  // Rewards (Get Y)
  const [searchY, setSearchY] = useState("");
  const [resultsY, setResultsY] = useState<any[]>([]);
  const [isSearchingY, setIsSearchingY] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);

  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(d => {
      if (d.success) setCategories(d.data);
    });
  }, []);

  // Search debouncing
  useEffect(() => {
    if (searchX.length > 2) {
      setIsSearchingX(true);
      const to = setTimeout(() => {
        fetch(`/api/admin/search-variants?q=${encodeURIComponent(searchX)}`)
          .then(r => r.json()).then(d => setResultsX(d.data || []))
          .finally(() => setIsSearchingX(false));
      }, 500);
      return () => clearTimeout(to);
    } else {
      setResultsX([]);
    }
  }, [searchX]);

  useEffect(() => {
    if (searchY.length > 2) {
      setIsSearchingY(true);
      const to = setTimeout(() => {
        fetch(`/api/admin/search-variants?q=${encodeURIComponent(searchY)}`)
          .then(r => r.json()).then(d => setResultsY(d.data || []))
          .finally(() => setIsSearchingY(false));
      }, 500);
      return () => clearTimeout(to);
    } else {
      setResultsY([]);
    }
  }, [searchY]);

  const addConditionVariant = (v: any) => {
    if (conditions.find(c => c.productVariantId === v.id)) return;
    setConditions([...conditions, { type: "variant", productVariantId: v.id, name: v.name, sku: v.sku, image: v.image }]);
    setSearchX(""); setResultsX([]);
  };

  const addConditionCategory = () => {
    if (!selectedCategory) return;
    if (conditions.find(c => c.categoryId === selectedCategory)) return;
    const cat = categories.find(c => c.id === selectedCategory);
    setConditions([...conditions, { type: "category", categoryId: cat.id, name: `Danh mục: ${cat.name}` }]);
    setSelectedCategory("");
  };

  const removeCondition = (idx: number) => setConditions(conditions.filter((_, i) => i !== idx));

  const addReward = (v: any) => {
    if (rewards.find(r => r.productVariantId === v.id)) return;
    setRewards([...rewards, { productVariantId: v.id, name: v.name, sku: v.sku, image: v.image, quantity: 1, promoPrice: 0, discountType: "FREE", discountValue: 0 }]);
    setSearchY(""); setResultsY([]);
  };

  const removeReward = (idx: number) => setRewards(rewards.filter((_, i) => i !== idx));

  const updateReward = (idx: number, field: string, val: string) => {
    const u = [...rewards];
    (u[idx] as any)[field] = val;
    setRewards(u);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error("Vui lòng nhập tên chương trình");
    if (!noEndDate && !endDate) return toast.error("Vui lòng chọn ngày kết thúc");
    if (!noEndDate && new Date(endDate) <= new Date(startDate)) return toast.error("Ngày kết thúc phải lớn hơn ngày bắt đầu");
    if (conditions.length === 0) return toast.error("Vui lòng chọn ít nhất 1 điều kiện");
    if (rewards.length === 0) return toast.error("Vui lòng chọn ít nhất 1 quà tặng");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, isActive, startDate, endDate: noEndDate ? null : endDate,
          priority, description, stackable,
          conditions: conditions.map(c => ({ productVariantId: c.productVariantId, categoryId: c.categoryId })),
          rewards: rewards.map(r => ({ productVariantId: r.productVariantId, quantity: r.quantity, promoPrice: r.promoPrice, discountType: r.discountType || "FREE", discountValue: r.discountValue || 0 }))
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Tạo chương trình thành công!");
        router.push("/admin/promotions");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in pb-20">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin" style={{ color: "#8a98ac" }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#323b4b" }}>Tạo Combo Khuyến Mãi</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          
          {/* Block 1: General Info */}
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title"><Tag size={18} color="#3b82f6" /> 1. Thông tin chung</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="input-label">Tên chương trình *</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="VD: Mua vợt Kaiwin tặng ngay 1 hộp bóng Pickleball" required />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: 18, height: 18 }} />
                <label htmlFor="isActive" style={{ fontWeight: 600, color: "#334155" }}>Kích hoạt chương trình (Đang hoạt động)</label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="checkbox" id="stackable" checked={stackable} onChange={e => setStackable(e.target.checked)} style={{ width: 18, height: 18 }} />
                <label htmlFor="stackable" style={{ fontWeight: 600, color: "#334155" }}>Cho phép cộng dồn với KM khác</label>
              </div>
              <div>
                <label className="input-label">Mô tả (tuỳ chọn)</label>
                <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả chi tiết chương trình..." rows={2} style={{ resize: "vertical" }} />
              </div>
              <div>
                <label className="input-label">Độ ưu tiên (số lớn = ưu tiên cao)</label>
                <input className="input" type="number" min="0" value={priority} onChange={e => setPriority(parseInt(e.target.value) || 0)} style={{ maxWidth: 200 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div>
                  <label className="input-label"><Calendar size={14} style={{ display: "inline", marginBottom: -2 }} /> Ngày bắt đầu</label>
                  <input className="input" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="input-label"><Calendar size={14} style={{ display: "inline", marginBottom: -2 }} /> Ngày kết thúc</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <input type="checkbox" id="noEndDate" checked={noEndDate} onChange={e => setNoEndDate(e.target.checked)} />
                      <label htmlFor="noEndDate" style={{ fontSize: 11, color: "#64748b" }}>Không kết thúc</label>
                    </div>
                  </div>
                  <input className="input" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={noEndDate} required={!noEndDate} />
                </div>
              </div>
            </div>
          </div>

          {/* Block 2: Conditions (Buy X) */}
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title"><PackageOpen size={18} color="#eab308" /> 2. Điều kiện áp dụng</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Chọn các sản phẩm hoặc danh mục sản phẩm mà khách hàng cần mua để nhận quà.</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Product Search */}
              <div style={{ position: "relative" }}>
                <label className="input-label">Tìm kiếm Sản phẩm / Mã SKU</label>
                <div style={{ position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#94a3b8" }} />
                  <input className="input" style={{ paddingLeft: 36 }} value={searchX} onChange={e => setSearchX(e.target.value)} placeholder="Nhập tên hoặc mã SKU sản phẩm..." />
                  {isSearchingX && <Loader2 size={16} className="spinner" style={{ position: "absolute", right: 12, top: 12, color: "#94a3b8" }} />}
                </div>
                {resultsX.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #e2e8f0", borderRadius: 8, marginTop: 4, zIndex: 10, maxHeight: 300, overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                    {resultsX.map(v => (
                      <div key={v.id} onClick={() => addConditionVariant(v)} style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #f1f5f9", cursor: "pointer" }} className="hover:bg-gray-50 transition-colors">
                        {v.image ? <img src={v.image} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} alt="" /> : <div style={{ width: 40, height: 40, background: "#f1f5f9", borderRadius: 6 }} />}
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{v.name}</p>
                          <p style={{ fontSize: 11, color: "#64748b" }}>SKU: {v.sku} • Tồn: {v.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Select */}
              <div>
                <label className="input-label">Hoặc chọn theo Danh mục</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select className="input" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button type="button" onClick={addConditionCategory} className="btn btn-secondary" style={{ whiteSpace: "nowrap" }}>Thêm DM</button>
                </div>
              </div>
            </div>

            {/* List X */}
            {conditions.length > 0 && (
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr auto", gap: 12, padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                  <span>Loại</span><span>Đối tượng áp dụng</span><span>Xóa</span>
                </div>
                {conditions.map((c, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 3fr auto", gap: 12, padding: "12px 16px", borderBottom: "1px solid #f8fafc", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: c.type === "category" ? "#dbeafe" : "#f1f5f9", color: c.type === "category" ? "#2563eb" : "#475569", borderRadius: 999, display: "inline-block", width: "fit-content" }}>
                      {c.type === "category" ? "Danh mục" : "Sản phẩm"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {c.image && <img src={c.image} style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover" }} alt="" />}
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{c.name}</p>
                        {c.sku && <p style={{ fontSize: 11, color: "#94a3b8" }}>SKU: {c.sku}</p>}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeCondition(i)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Block 3: Rewards (Get Y) */}
          <div className="card" style={{ padding: 24, border: "2px solid #fce7f3" }}>
            <h2 className="section-title" style={{ color: "#db2777" }}><Gift size={18} color="#ec4899" /> 3. Quà tặng kèm</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Khách hàng sẽ nhận được các sản phẩm dưới đây (Sẽ tự động trừ kho khi có đơn hàng).</p>
            
            {/* Reward Search */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <label className="input-label">Tìm kiếm Quà tặng (Sản phẩm trong kho)</label>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#94a3b8" }} />
                <input className="input" style={{ paddingLeft: 36, borderColor: "#fbcfe8" }} value={searchY} onChange={e => setSearchY(e.target.value)} placeholder="Nhập tên hoặc mã SKU quà tặng..." />
                {isSearchingY && <Loader2 size={16} className="spinner" style={{ position: "absolute", right: 12, top: 12, color: "#94a3b8" }} />}
              </div>
              {resultsY.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #e2e8f0", borderRadius: 8, marginTop: 4, zIndex: 10, maxHeight: 300, overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                  {resultsY.map(v => (
                    <div key={v.id} onClick={() => addReward(v)} style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #f1f5f9", cursor: "pointer" }} className="hover:bg-pink-50 transition-colors">
                      {v.image ? <img src={v.image} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} alt="" /> : <div style={{ width: 40, height: 40, background: "#f1f5f9", borderRadius: 6 }} />}
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{v.name}</p>
                        <p style={{ fontSize: 11, color: "#64748b" }}>SKU: {v.sku} • Tồn: {v.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List Y */}
            {rewards.length > 0 && (
              <div style={{ border: "1px solid #fbcfe8", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 12, padding: "10px 16px", background: "#fdf2f8", borderBottom: "1px solid #fbcfe8", fontSize: 12, fontWeight: 700, color: "#be185d" }}>
                  <span>Sản phẩm Quà tặng</span><span>Số lượng</span><span>Loại giảm</span><span>Giá trị</span><span></span>
                </div>
                {rewards.map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 12, padding: "12px 16px", borderBottom: "1px solid #fdf2f8", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {r.image && <img src={r.image} style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover" }} alt="" />}
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{r.name}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8" }}>SKU: {r.sku}</p>
                      </div>
                    </div>
                    <div><input className="input" type="number" min="1" value={r.quantity} onChange={e => updateReward(i, "quantity", e.target.value)} style={{ padding: "6px 10px" }} /></div>
                    <div>
                      <select className="input" value={r.discountType || "FREE"} onChange={e => updateReward(i, "discountType", e.target.value)} style={{ padding: "6px 10px" }}>
                        <option value="FREE">Tặng miễn phí</option>
                        <option value="FIXED">Giá cố định</option>
                        <option value="PERCENTAGE">Giảm %</option>
                      </select>
                    </div>
                    <div>
                      <input className="input" type="number" min="0" value={(r.discountType === "FREE") ? 0 : (r.discountValue || r.promoPrice || 0)} onChange={e => updateReward(i, "discountValue", e.target.value)} disabled={r.discountType === "FREE"} style={{ padding: "6px 10px" }} placeholder={r.discountType === "PERCENTAGE" ? "%" : "VNĐ"} />
                    </div>
                    <button type="button" onClick={() => removeReward(i)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 15 }} disabled={submitting}>
              {submitting ? <Loader2 className="spinner" size={18} /> : null}
              {submitting ? "Đang xử lý..." : "Lưu Chương Trình Khuyến Mãi"}
            </button>
            <Link href="/admin" className="btn btn-secondary" style={{ padding: "14px 32px", fontSize: 15, textDecoration: "none" }}>Hủy</Link>
          </div>

        </div>
      </form>
    </div>
  );
}
