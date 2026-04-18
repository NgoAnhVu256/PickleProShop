"use client";

import { useState, useEffect, use, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, Share2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";

const RichTextEditor = lazy(() => import("@/components/admin/RichTextEditor"));

interface Category {
  id: string;
  name: string;
}

export default function AdminEditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO State
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [schemaType, setSchemaType] = useState("Article");

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/posts/${id}`).then(r => r.json()),
      fetch("/api/admin/post-categories").then(r => r.json())
    ]).then(([pRes, cRes]) => {
      if (pRes.success) {
        const p = pRes.data;
        setTitle(p.title);
        setContent(p.content);
        setExcerpt(p.excerpt || "");
        setCategoryId(p.categoryId);
        setImage(p.image || "");
        setIsActive(p.isActive);
        setIsFeatured(p.isFeatured);
        
        setSeoTitle(p.seoTitle || "");
        setMetaDescription(p.metaDescription || "");
        setMetaKeywords(p.metaKeywords || "");
        setOgTitle(p.ogTitle || "");
        setOgDescription(p.ogDescription || "");
        setOgImage(p.ogImage || "");
        setCanonicalUrl(p.canonicalUrl || "");
        setSchemaType(p.schemaType || "Article");
      }
      if (cRes.success) setCategories(cRes.data);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, content, categoryId, image, excerpt,
          seoTitle, metaDescription, metaKeywords, ogTitle, ogDescription, ogImage, canonicalUrl, schemaType,
          isActive, isFeatured
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Đã cập nhật bài viết!");
        router.push("/admin/posts");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi cập nhật bài viết");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin/posts" style={{ color: "#8a98ac" }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#323b4b" }}>Sửa bài viết</h1>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 24, borderBottom: "1px solid #eef2f7" }}>
        <button onClick={() => setActiveTab("content")} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: activeTab === "content" ? "#58d68d" : "#8a98ac", borderBottom: activeTab === "content" ? "2px solid #58d68d" : "none" }}>
          Nội dung bài viết
        </button>
        <button onClick={() => setActiveTab("seo")} style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: activeTab === "seo" ? "#58d68d" : "#8a98ac", borderBottom: activeTab === "seo" ? "2px solid #58d68d" : "none" }}>
          Tối ưu SEO 2026
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          {activeTab === "content" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label className="input-label">Tiêu đề bài viết *</label>
                    <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div>
                    <label className="input-label">Danh mục *</label>
                    <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Mô tả ngắn</label>
                    <textarea className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
                  </div>
                </div>
              </div>

              {/* Rich Text Editor for Post Content */}
              <div className="card" style={{ padding: 24 }}>
                <Suspense fallback={<div className="skeleton" style={{ height: 400 }} />}>
                  <RichTextEditor
                    label="Nội dung chi tiết *"
                    value={content}
                    onChange={setContent}
                    height={500}
                    placeholder="Viết nội dung bài viết tại đây..."
                  />
                </Suspense>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <Globe size={18} color="#58d68d" /> SEO Metadata
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label className="input-label">SEO Title</label>
                    <input className="input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">Meta Description</label>
                    <textarea className="input" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: metaDescription.length > 160 ? "#ef4444" : "#8a98ac" }}>
                        {metaDescription.length}/160 ký tự
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Canonical URL</label>
                    <input className="input" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label className="input-label">Keywords</label>
                      <input className="input" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="pickleball, vợt joola..." />
                    </div>
                    <div>
                      <label className="input-label">Schema Type</label>
                      <select className="input" value={schemaType} onChange={(e) => setSchemaType(e.target.value)}>
                        <option value="Article">Article (Mặc định)</option>
                        <option value="NewsArticle">NewsArticle (Tin tức)</option>
                        <option value="Review">Review (Đánh giá)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <h2 style={{ fontSize: 16, fontWeight: 700, marginTop: 32, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <Share2 size={18} color="#3498db" /> Social Media & Open Graph
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label className="input-label">OG Title</label>
                    <input className="input" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">OG Description</label>
                    <textarea className="input" value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} rows={2} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="card" style={{ padding: 24, position: "sticky", top: 80 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Cập nhật</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Công khai</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Nổi bật</span>
                </label>
              </div>
              <div style={{ marginBottom: 20 }}>
                <ImageUpload 
                  label="Ảnh bài viết" 
                  value={image} 
                  onChange={setImage} 
                  onRemove={() => setImage("")}
                  folder="posts" 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 44 }} disabled={submitting}>
                {submitting ? <Loader2 className="spinner" size={18} /> : <Save size={18} />}
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <Link href="/admin/posts" className="btn btn-secondary" style={{ width: "100%", marginTop: 12, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                Hủy
              </Link>
            </div>
          </div>
        </div>
      </form>
      <style jsx>{`
        .input-label { display: block; font-size: 13px; font-weight: 600; color: #5a6677; margin-bottom: 6px; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
