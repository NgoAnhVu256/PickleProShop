"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
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
  MessageSquare,
} from "lucide-react";
import { Logo } from "@/components/common/Icons";
import { signOut } from "next-auth/react";

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
      { href: "/admin/feedbacks",     label: "Góp ý",       icon: MessageSquare },
      { href: "/admin/settings",      label: "Cài đặt",     icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const { data: session } = useSession();
  const adminUser = session?.user;
  const adminEmail = adminUser?.email || "admin@picklepro.vn";
  const adminName = adminUser?.name || "Admin";
  const adminImage = adminUser?.image || "";

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const lastOrderCountRef = useRef<number | null>(null);

  // Profile menu
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { if (d.success) setSettings(d.data); });
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearchResults(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Real-time order notification polling (every 15 seconds)
  const fetchNewOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders?limit=5&sort=createdAt&order=desc");
      const data = await res.json();
      if (data.success && data.data) {
        const orders = data.data;
        const totalOrders = orders.length;
        if (lastOrderCountRef.current !== null && totalOrders > lastOrderCountRef.current) {
          const newCount = totalOrders - lastOrderCountRef.current;
          setUnreadCount(prev => prev + newCount);
        }
        lastOrderCountRef.current = totalOrders;
        setNotifications(orders.map((o: any) => ({
          id: o.id,
          title: `Đơn hàng mới #${o.id.slice(-6).toUpperCase()}`,
          desc: `${o.user?.name || 'Khách'} - ${o.totalPrice?.toLocaleString() || 0}₫`,
          time: o.createdAt,
          status: o.status,
        })));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchNewOrders();
    const interval = setInterval(fetchNewOrders, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchNewOrders]);

  // Admin search (products by name or SKU)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.data.map((p: any) => ({
            type: 'product',
            id: p.id,
            label: p.name,
            href: `/admin/products/${p.id}`,
            sub: p._count?.variants > 0 ? `${p._count.variants} biến thể` : p.slug,
          })));
          setShowSearchResults(true);
        }
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const adminAvatarUrl = adminImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=58d68d&color=fff&size=64&bold=true`;

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
            <img src={settings.store_favicon || settings.store_logo || "/api/favicon"} alt="Logo" style={{ height: 34, width: 34, objectFit: "cover", borderRadius: "50%" }} />
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
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, fontSize: 14, color: "#e57373", background: "none", border: "none", cursor: "pointer", width: "100%", transition: "background 0.15s" }}>
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
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
            <div className="admin-search-desktop" style={{ position: "relative" }} ref={searchRef}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#b0bac9" }} />
              <input
                type="text"
                placeholder="Tìm sản phẩm, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              style={{
                  background: "#f5f6fa",
                  border: "1px solid #eef2f7",
                  borderRadius: 8,
                  padding: "7px 12px 7px 34px",
                  fontSize: 13,
                  color: "#323b4b",
                  outline: "none",
                  width: 200,
                  maxWidth: "40vw",
                }}
              />
              {showSearchResults && searchResults.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 6, background: "#fff", border: "1px solid #eef2f7", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", zIndex: 100, maxHeight: 300, overflowY: "auto" }}>
                  {searchResults.map((r) => (
                    <Link key={r.id} href={r.href} onClick={() => { setShowSearchResults(false); setSearchQuery(""); }} style={{ display: "flex", flexDirection: "column", padding: "10px 14px", borderBottom: "1px solid #f5f6fa", textDecoration: "none", fontSize: 13, color: "#323b4b" }}>
                      <span style={{ fontWeight: 600 }}>{r.label}</span>
                      <span style={{ fontSize: 11, color: "#b0bac9" }}>{r.sub}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div style={{ position: "relative" }} ref={notifRef}>
              <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) setUnreadCount(0); }} style={{ background: "#f5f6fa", border: "1px solid #eef2f7", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8a98ac", position: "relative" }}>
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, background: "#ef4444", borderRadius: 999, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>
              {showNotifs && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 320, background: "#fff", border: "1px solid #eef2f7", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", zIndex: 100 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#323b4b" }}>Thông báo</span>
                    <span style={{ fontSize: 11, color: "#b0bac9" }}>Đơn hàng gần đây</span>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "#b0bac9" }}>Không có thông báo mới</div>
                    ) : notifications.map(n => (
                      <Link key={n.id} href={`/admin/orders`} onClick={() => setShowNotifs(false)} style={{ display: "flex", gap: 10, padding: "10px 16px", borderBottom: "1px solid #f8f9fb", textDecoration: "none", alignItems: "center" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: n.status === "PENDING" ? "#fef3c7" : "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <ShoppingCart size={14} color={n.status === "PENDING" ? "#d97706" : "#16a34a"} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#323b4b", margin: 0 }}>{n.title}</p>
                          <p style={{ fontSize: 11, color: "#8a98ac", margin: 0 }}>{n.desc} • {new Date(n.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/admin/orders" onClick={() => setShowNotifs(false)} style={{ display: "block", textAlign: "center", padding: "10px", fontSize: 12, fontWeight: 700, color: "#58d68d", textDecoration: "none", borderTop: "1px solid #eef2f7" }}>Xem tất cả đơn hàng →</Link>
                </div>
              )}
            </div>

            {/* Admin avatar + dropdown */}
            <div style={{ position: "relative" }} ref={profileRef}>
              <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", border: "2px solid #e8f5e9" }}>
                  <img src={adminAvatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="admin-avatar-info" style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#323b4b" }}>{adminName}</span>
                  <span style={{ fontSize: 11, color: "#b0bac9" }}>{adminEmail}</span>
                </div>
                <ChevronDown size={14} color="#b0bac9" className={showProfileMenu ? "rotate-180" : ""} style={{ transition: "transform 0.2s" }} />
              </div>
              {showProfileMenu && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 220, background: "#fff", border: "1px solid #eef2f7", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", zIndex: 100, padding: 6 }}>
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid #f5f6fa", marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#323b4b", margin: 0 }}>{adminName}</p>
                    <p style={{ fontSize: 11, color: "#b0bac9", margin: 0 }}>{adminEmail}</p>
                  </div>
                  <Link href="/account" onClick={() => setShowProfileMenu(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, fontSize: 13, color: "#323b4b", textDecoration: "none" }}>
                    <Users size={15} color="#58d68d" /> Tài khoản cá nhân
                  </Link>
                  <Link href="/" onClick={() => setShowProfileMenu(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, fontSize: 13, color: "#323b4b", textDecoration: "none" }}>
                    <ExternalLink size={15} color="#8a98ac" /> Về trang chủ
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, fontSize: 13, color: "#e57373", background: "none", border: "none", cursor: "pointer", width: "100%", marginTop: 2 }}>
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </div>
              )}
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
