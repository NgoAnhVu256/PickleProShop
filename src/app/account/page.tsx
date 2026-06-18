"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Save, Loader2, Package, Shield, Calendar, LogOut, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import Header from "@/components/shop/Header";
import ClientFooter from "@/components/shop/ClientFooter";

function AccountSidebar({ name, email, image, role }: { name: string; email: string; image: string; role: string }) {
  const pathname = usePathname();
  const avatarUrl = image || (email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=2C2877&color=fff&size=128&bold=true` : "");

  const navItems = [
    { href: "/account", label: "Thông tin tài khoản", icon: User, active: pathname === "/account" },
    { href: "/orders", label: "Đơn hàng đã mua", icon: Package, active: pathname === "/orders" },
  ];

  return (
    <aside className="w-full lg:w-[260px] shrink-0">
      {/* User info */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2C2877]/20 bg-white shadow-sm">
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-gray-900 truncate">{name || "Chưa đặt tên"}</p>
          <p className="text-xs text-gray-400 truncate">{email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 mb-4">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                item.active
                  ? "bg-[#2C2877]/10 text-[#2C2877] border border-[#2C2877]/20"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} className={item.active ? "text-[#2C2877]" : "text-gray-400"} />
              {item.label}
            </Link>
          );
        })}
        {role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <Shield size={18} className="text-red-400" />
            Quản trị Admin
          </Link>
        )}
      </nav>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        Đăng Xuất
      </button>
    </aside>
  );
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/account")
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setName(d.data.name || "");
            setEmail(d.data.email || "");
            setPhone(d.data.phone || "");
            setImage(d.data.image || "");
            setCreatedAt(d.data.createdAt || "");
            setRole(d.data.role || "");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cập nhật thành công!");
      } else {
        toast.error(data.error || "Lỗi cập nhật");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc]">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Sidebar ─── */}
          <AccountSidebar name={name} email={email} image={image} role={role} />

          {/* ─── Main Content ─── */}
          <main className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 mb-6">Thông tin tài khoản</h1>

            {/* Personal Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Thông tin cá nhân</h3>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Họ và tên</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#2C2877] focus:ring-2 focus:ring-[#2C2877]/10 outline-none transition-all"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Số điện thoại</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#2C2877] focus:ring-2 focus:ring-[#2C2877]/10 outline-none transition-all"
                        placeholder="0901234567"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Email không thể thay đổi.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>Tham gia từ {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : "..."}</span>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#2C2877] to-[#FF6220] text-white rounded-xl font-black text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>

      <ClientFooter />
    </div>
  );
}
