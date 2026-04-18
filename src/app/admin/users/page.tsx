"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Users, Trash2, Loader2, ChevronLeft, ChevronRight, Edit3, X, Plus, Phone } from "lucide-react";
import toast from "react-hot-toast";

interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: "ADMIN" | "USER";
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Edit/Create modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "USER" as "ADMIN" | "USER", password: "" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch {
      toast.error("Lỗi khi tải danh sách user");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "USER") => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã cập nhật role thành ${newRole}`);
        fetchUsers();
      } else {
        toast.error(data.error || "Lỗi cập nhật");
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const handleDelete = async (userId: string, userName: string | null) => {
    if (!confirm(`Bạn có chắc muốn xóa user "${userName || userId}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa user");
        fetchUsers();
      } else {
        toast.error(data.error || "Lỗi xóa user");
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", phone: "", role: "USER", password: "" });
    setShowModal(true);
  };

  const openEdit = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role,
      password: "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Tên và email là bắt buộc");
      return;
    }
    try {
      if (editingUser) {
        // Update
        const body: Record<string, unknown> = { name: formData.name, phone: formData.phone, role: formData.role };
        if (formData.password) body.password = formData.password;
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Đã cập nhật user");
          fetchUsers();
          setShowModal(false);
        } else toast.error(data.error || "Lỗi cập nhật");
      } else {
        // Create
        if (!formData.password) { toast.error("Mật khẩu là bắt buộc khi tạo mới"); return; }
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Đã tạo user mới");
          fetchUsers();
          setShowModal(false);
        } else toast.error(data.error || "Lỗi tạo user");
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#323b4b", marginBottom: 4 }}>Quản lý người dùng</h1>
          <p style={{ fontSize: 13, color: "#8a98ac" }}>Tổng cộng {total} tài khoản</p>
        </div>
        <button onClick={openCreate}
          style={{ background: "#27ae60", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={16} /> Thêm user
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#b0bac9" }} />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: "100%", background: "#fff", border: "1px solid #eef2f7",
              borderRadius: 10, padding: "10px 12px 10px 38px", fontSize: 13, color: "#323b4b", outline: "none",
            }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          style={{
            background: "#fff", border: "1px solid #eef2f7", borderRadius: 10,
            padding: "10px 16px", fontSize: 13, color: "#323b4b", outline: "none", cursor: "pointer",
          }}
        >
          <option value="">Tất cả quyền</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eef2f7", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#b0bac9" }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
            Đang tải...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafbfc" }}>
                  {["Người dùng", "Email", "SĐT", "Quyền", "Đơn hàng", "Ngày tạo", "Thao tác"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#b0bac9", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "2px solid #eef2f7", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #f5f6fa" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", overflow: "hidden",
                          background: user.image ? "transparent" : `hsl(${user.name?.charCodeAt(0) || 0 * 37 % 360}, 55%, 62%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, color: "#fff", fontWeight: 700, flexShrink: 0,
                        }}>
                          {user.image ? (
                            <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            (user.name || "?")[0].toUpperCase()
                          )}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#323b4b" }}>{user.name || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#8a98ac" }}>{user.email || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#323b4b" }}>
                      {user.phone ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Phone size={12} style={{ color: "#27ae60" }} /> {user.phone}
                        </span>
                      ) : (
                        <span style={{ color: "#b0bac9" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as "ADMIN" | "USER")}
                        style={{
                          padding: "4px 10px", borderRadius: 8, border: "1px solid #eef2f7",
                          fontSize: 12, fontWeight: 700,
                          color: user.role === "ADMIN" ? "#e74c3c" : "#58d68d",
                          background: user.role === "ADMIN" ? "rgba(231,76,60,0.08)" : "rgba(88,214,141,0.08)",
                          cursor: "pointer", outline: "none",
                        }}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#323b4b" }}>
                      {user._count.orders}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#b0bac9", whiteSpace: "nowrap" }}>
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openEdit(user)}
                          style={{
                            background: "rgba(52,152,219,0.08)", border: "none", borderRadius: 8,
                            padding: "6px 10px", cursor: "pointer", color: "#3498db",
                            display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600,
                          }}
                        >
                          <Edit3 size={13} /> Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          style={{
                            background: "rgba(231,76,60,0.08)", border: "none", borderRadius: 8,
                            padding: "6px 10px", cursor: "pointer", color: "#e74c3c",
                            display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600,
                          }}
                        >
                          <Trash2 size={13} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 60, color: "#b0bac9", fontSize: 14 }}>
                      <Users size={38} style={{ margin: "0 auto 12px", opacity: 0.25, display: "block" }} />
                      Không tìm thấy user nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: 16, borderTop: "1px solid #eef2f7" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ background: "none", border: "1px solid #eef2f7", borderRadius: 8, padding: "6px 12px", cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, color: "#8a98ac", fontWeight: 600 }}>Trang {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ background: "none", border: "1px solid #eef2f7", borderRadius: 8, padding: "6px 12px", cursor: page === totalPages ? "default" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 480, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#323b4b" }}>{editingUser ? "Chỉnh sửa user" : "Tạo user mới"}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#8a98ac", display: "block", marginBottom: 6 }}>Họ tên *</label>
                <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #eef2f7", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#8a98ac", display: "block", marginBottom: 6 }}>Email *</label>
                <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} disabled={!!editingUser}
                  style={{ width: "100%", border: "1px solid #eef2f7", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", opacity: editingUser ? 0.6 : 1 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#8a98ac", display: "block", marginBottom: 6 }}>Số điện thoại</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="0912345678"
                  style={{ width: "100%", border: "1px solid #eef2f7", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#8a98ac", display: "block", marginBottom: 6 }}>Quyền</label>
                <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value as "ADMIN" | "USER" }))}
                  style={{ width: "100%", border: "1px solid #eef2f7", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", cursor: "pointer" }}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#8a98ac", display: "block", marginBottom: 6 }}>
                  {editingUser ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *"}
                </label>
                <input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #eef2f7", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "10px", border: "1px solid #eef2f7", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Hủy</button>
              <button onClick={handleSave}
                style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: "#27ae60", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                {editingUser ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        select:focus { border-color: #58d68d !important; }
        input:focus { border-color: #58d68d !important; box-shadow: 0 0 0 3px rgba(88,214,141,0.12); }
      `}</style>
    </div>
  );
}
