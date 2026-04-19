"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, User, Eye, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useConfirm } from "@/hooks/useConfirm";

interface Post {
  id: string;
  title: string;
  slug: string;
  image: string;
  isActive: boolean;
  publishedAt: string;
  category: { name: string };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { confirm, ConfirmDialog } = useConfirm();

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch {
      toast.error("Lỗi tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: "Xóa bài viết", message: "Bạn có chắc muốn xóa bài viết này? Không thể hoàn tác.", confirmText: "Xóa", variant: "danger" });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa");
        fetchPosts();
      }
    } catch {
      toast.error("Lỗi xóa bài viết");
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#323b4b" }}>Tin tức & Bài viết</h1>
          <p style={{ fontSize: 13, color: "#8a98ac", marginTop: 2 }}>Quản lý nội dung blog, review và tin tức SEO</p>
        </div>
        <Link href="/admin/posts/create" className="btn btn-primary">
          <Plus size={16} /> Viết bài mới
        </Link>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#b0bac9" }} />
            <input 
              className="input" 
              placeholder="Tìm theo tiêu đề hoặc danh mục..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
          <button className="btn btn-secondary"><Filter size={16} /> Lọc</button>
        </div>
      </div>

      <div className="table-container shadow-sm">
        <table>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Ngày đăng</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 40 }} /></td></tr>
              ))
            ) : filteredPosts.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#8a98ac" }}>Chưa có bài viết nào</td></tr>
            ) : (
              filteredPosts.map(post => (
                <tr key={post.id}>
                  <td>
                    <div style={{ width: 60, height: 40, borderRadius: 6, background: "#f8f9fb", overflow: "hidden" }}>
                      {post.image ? (
                        <img src={post.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : <User size={16} color="#b0bac9" style={{ margin: "12px 22px" }} />}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 700, color: "#323b4b", fontSize: 14 }}>{post.title}</span>
                      <span style={{ fontSize: 11, color: "#8a98ac" }}>/{post.slug}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-secondary">{post.category.name}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5a6677" }}>
                      <Calendar size={14} color="#b0bac9" />
                      {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${post.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {post.isActive ? 'Đã đăng' : 'Bản nháp'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <Link href={`/posts/${post.slug}`} target="_blank" className="btn btn-secondary btn-sm"><Eye size={14} /></Link>
                      <Link href={`/admin/posts/${post.id}`} className="btn btn-secondary btn-sm"><Edit size={14} /></Link>
                      <button onClick={() => handleDelete(post.id)} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
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
