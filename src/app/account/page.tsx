"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Save, Loader2, ArrowLeft, Package, Shield, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import Header from "@/components/shop/Header";

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

  const avatarUrl = image || (email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=7DAACB&color=fff&size=128&bold=true` : "");

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
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#7DAACB] mb-8">
          <ArrowLeft size={16} /> Trang chủ
        </Link>

        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Tài khoản của tôi</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-[#5a93b5] to-[#7DAACB] relative">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="pt-16 px-6 pb-6">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-black text-gray-900">{name || "Chưa đặt tên"}</h2>
              {role === "ADMIN" && (
                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black rounded-full uppercase">Admin</span>
              )}
            </div>
            <p className="text-sm text-gray-400 font-medium">{email}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <Calendar size={12} />
              <span>Tham gia từ {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : "..."}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Thông tin cá nhân</h3>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Họ và tên</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#7DAACB] focus:ring-2 focus:ring-[#7DAACB]/10 outline-none transition-all"
                  placeholder="Nguyễn Văn A"
                />
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

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Số điện thoại</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#7DAACB] focus:ring-2 focus:ring-[#7DAACB]/10 outline-none transition-all"
                  placeholder="0901234567"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-gradient-to-r from-[#5a93b5] to-[#7DAACB] text-white rounded-xl font-black text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <Link href="/orders" className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Đơn hàng của tôi</p>
              <p className="text-xs text-gray-400">Xem lịch sử mua hàng</p>
            </div>
          </Link>
          {role === "ADMIN" && (
            <Link href="/admin" className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Quản trị Admin</p>
                <p className="text-xs text-gray-400">Truy cập bảng điều khiển</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
