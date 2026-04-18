"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Image as ImageIcon,
  Megaphone,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  ExternalLink,
  Users,
  Tag,
  Layers,
  Award,
  SlidersHorizontal,
  FileText,
} from "lucide-react";
import { Logo } from "@/components/common/Icons";

const navGroups = [
  {
    label: "TỔNG QUAN",
    items: [
      { href: "/admin",  label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "CATALOG",
    items: [
      { href: "/admin/products",   label: "Sản phẩm",   icon: Package },
      { href: "/admin/categories", label: "Danh mục",   icon: FolderOpen },
      { href: "/admin/brands",     label: "Thương hiệu",  icon: Award },
      { href: "/admin/attributes", label: "Thuộc tính",  icon: SlidersHorizontal },
    ],
  },
  {
    label: "BÁN HÀNG",
    items: [
      { href: "/admin/orders",     label: "Đơn hàng",    icon: ShoppingCart },
      { href: "/admin/promotions", label: "Khuyến mãi",  icon: Tag },
      { href: "/admin/users",      label: "Người dùng",  icon: Users },
    ],
  },
  {
    label: "NỘI DUNG",
    items: [
      { href: "/admin/posts",         label: "Bài viết",     icon: FileText },
      { href: "/admin/banners",       label: "Banners",     icon: ImageIcon },
      { href: "/admin/announcements", label: "Thông báo",   icon: Megaphone },
      { href: "/admin/settings",      label: "Cài đặt",     icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { if (d.success) setSettings(d.data); });
  }, []);

  return (
    <div className="admin-theme" style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 39 }}
        />
      )}

      {/* ─── Sidebar ─────────────────────────────────── */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`} style={{
        width: 240,
        height: "100vh",
        background: "#ffffff",
        borderRight: "1px solid #eef2f7",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        boxShadow: sidebarOpen ? "4px 0 25px rgba(0,0,0,0.1)" : "0 0 20px rgba(0,0,0,0.04)",
        transition: "transform 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #eef2f7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src={settings.store_logo || "/favicon.ico"} alt="Logo" style={{ height: 34, width: "auto", objectFit: "contain" }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: "#323b4b", letterSpacing: -0.5 }}>
              {settings.store_name || "PicklePro"}
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a98ac", display: "none" }} className="sidebar-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, padding: "12px 12px 40px", overflowY: "auto" }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#b0bac9", letterSpacing: 1.2, textTransform: "uppercase", padding: "12px 8px 6px" }}>
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "9px 10px",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#ffffff" : "#8a98ac",
                      background: isActive ? "linear-gradient(135deg, #58d68d, #3cc06e)" : "transparent",
                      textDecoration: "none",
                      transition: "all 0.15s",
                      marginBottom: 2,
                      boxShadow: isActive ? "0 4px 12px rgba(88,214,141,0.3)" : "none",
                    }}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding: "12px 12px 16px", borderTop: "1px solid #eef2f7" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, fontSize: 14, color: "#8a98ac", textDecoration: "none", transition: "background 0.15s" }}>
            <ExternalLink size={16} />
            <span>Về trang chủ</span>
          </Link>
          <Link href="/api/auth/signout" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, fontSize: 14, color: "#e57373", textDecoration: "none", transition: "background 0.15s" }}>
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </Link>
        </div>
      </aside>

      {/* ─── Main area ───────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="admin-main">

        {/* Top bar */}
        <header style={{
          height: 60,
          background: "#ffffff",
          borderBottom: "1px solid #eef2f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          position: "sticky",
          top: 0,
          zIndex: 30,
          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
        }}>
          {/* Left: mobile menu + breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(true)} className="sidebar-toggle-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "#8a98ac", display: "none", padding: 4 }}>
              <Menu size={22} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#8a98ac" }}>
              <span style={{ color: "#58d68d", fontWeight: 500 }}>Admin</span>
              <span>/</span>
              <span style={{ color: "#323b4b", fontWeight: 600 }}>{getPageTitle(pathname)}</span>
            </div>
          </div>

          {/* Right: search + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Search */}
            <div className="admin-search-desktop" style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#b0bac9" }} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
              style={{
                  background: "#f5f6fa",
                  border: "1px solid #eef2f7",
                  borderRadius: 8,
                  padding: "7px 12px 7px 34px",
                  fontSize: 13,
                  color: "#323b4b",
                  outline: "none",
                  width: 160,
                  maxWidth: "40vw",
                }}
              />
            </div>

            {/* Bell */}
            <button style={{ background: "#f5f6fa", border: "1px solid #eef2f7", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8a98ac", position: "relative" }}>
              <Bell size={16} />
              <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#58d68d", borderRadius: "50%", border: "2px solid #fff" }} />
            </button>

            {/* Admin avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #58d68d, #3cc06e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={16} color="#fff" />
              </div>
              <div className="admin-avatar-info" style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#323b4b" }}>Admin</span>
                <span style={{ fontSize: 11, color: "#b0bac9" }}>admin@picklepro.vn</span>
              </div>
              <ChevronDown size={14} color="#b0bac9" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "20px 16px", animation: "fadeInUp 0.3s ease" }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Desktop: sidebar visible */
        @media (min-width: 1025px) {
          .admin-main { margin-left: 240px !important; }
          .admin-main main { padding: 28px !important; }
          .admin-main header { padding: 0 28px !important; }
          .sidebar-toggle-btn { display: none !important; }
          .sidebar-close-btn { display: none !important; }
          .admin-sidebar { transform: translateX(0) !important; }
        }
        /* Mobile/Tablet: sidebar hidden by default, slide in when open */
        @media (max-width: 1024px) {
          .admin-main { margin-left: 0 !important; }
          .admin-sidebar { transform: translateX(-100%) !important; }
          .admin-sidebar.open { transform: translateX(0) !important; }
          .sidebar-close-btn { display: flex !important; }
          .sidebar-toggle-btn { display: flex !important; }
          .admin-avatar-info { display: none !important; }
          .admin-search-desktop { display: none !important; }
        }
        header input:focus {
          border-color: #58d68d !important;
          box-shadow: 0 0 0 3px rgba(88,214,141,0.12);
        }
        nav a:hover {
          background: #f5f6fa !important;
          color: #323b4b !important;
        }
        nav a.active-link { background: linear-gradient(135deg, #58d68d, #3cc06e) !important; }
      `}</style>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === "/admin")                        return "Dashboard";
  if (pathname.startsWith("/admin/products"))       return "Sản phẩm";
  if (pathname.startsWith("/admin/categories"))     return "Danh mục";
  if (pathname.startsWith("/admin/brands"))         return "Thương hiệu";
  if (pathname.startsWith("/admin/attributes"))     return "Thuộc tính";
  if (pathname.startsWith("/admin/orders"))         return "Đơn hàng";
  if (pathname.startsWith("/admin/promotions"))     return "Khuyến mãi";
  if (pathname.startsWith("/admin/posts"))          return "Bài viết";
  if (pathname.startsWith("/admin/banners"))        return "Banners";
  if (pathname.startsWith("/admin/announcements"))  return "Thông báo";
  if (pathname.startsWith("/admin/settings"))       return "Cài đặt";
  if (pathname.startsWith("/admin/users"))          return "Người dùng";
  return "Admin";
}
