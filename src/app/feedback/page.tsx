"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/components/shop/Header";
import toast from "react-hot-toast";

export default function FeedbackPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.success) setSettings(d.data); }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.subject || !form.message) {
      toast.error("Vui lòng nhập đầy đủ họ tên, chủ đề và nội dung");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        toast.error(data.error || "Gửi thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#fcfcfc]">
        <Header settings={settings} />
        <div className="max-w-lg mx-auto px-4 py-20 md:py-32 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">Cảm ơn bạn!</h1>
          <p className="text-gray-500 font-medium mb-8">Góp ý của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4f46e5] to-[#a757ff] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#a757ff]/20 hover:shadow-xl transition-all">
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header settings={settings} />
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="w-16 h-16 bg-[#a757ff]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="w-8 h-8 text-[#a757ff]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mb-3">Góp ý với PicklePro</h1>
          <p className="text-gray-500 text-sm md:text-base font-medium max-w-md mx-auto">Mọi góp ý của bạn đều rất quý giá và giúp chúng tôi cải thiện dịch vụ tốt hơn.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-xl shadow-gray-100/50 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Họ tên *</label>
              <input
                type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-[#a757ff]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a757ff]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-[#a757ff]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a757ff]/10 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Số điện thoại</label>
            <input
              type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="0912 345 678"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-[#a757ff]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a757ff]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chủ đề *</label>
            <input
              type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              placeholder="Góp ý về sản phẩm, dịch vụ, giao diện..."
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-[#a757ff]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a757ff]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nội dung góp ý *</label>
            <textarea
              rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Hãy chia sẻ ý kiến của bạn..."
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-transparent focus:border-[#a757ff]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a757ff]/10 transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full py-4 bg-gradient-to-r from-[#4f46e5] to-[#a757ff] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#a757ff]/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {sending ? "Đang gửi..." : <><Send size={16} /> Gửi góp ý</>}
          </button>
        </form>
      </div>
    </div>
  );
}
