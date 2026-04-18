"use client";

import Link from "next/link";
import { Globe, Facebook, Instagram } from "lucide-react";

export default function Footer({ settings }: { settings?: any }) {
  const logo = settings?.logo || '/favicon.ico';
  const siteName = settings?.name || "PicklePro";

  return (
    <footer className="bg-[#0a0a0a] text-gray-400 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 border-b-2 border-[#1a1a1a] pb-16">
        
        {/* Column 1: Subscription Card (Takes 4 cols on Desktop) */}
        <div className="md:col-span-4 lg:col-span-3 flex justify-center md:justify-start">
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-gray-800 p-8 rounded-3xl w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            {/* Logo Wrapper (App Icon style to hide white backgrounds elegantly) */}
            <Link href="/" className="mb-6 block">
              <img 
                src={logo} 
                alt={siteName} 
                className="h-20 w-20 object-contain mx-auto drop-shadow-[0_4px_10px_rgba(255,255,255,0.1)]" 
              />
            </Link>
            
            <p className="text-[#bfdbfe] font-bold text-[13px] mb-6 leading-relaxed px-2 uppercase tracking-wide">
              Đăng ký để nhận thông tin cập nhật mới nhất từ {siteName}!
            </p>
            
            <form className="w-full flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="w-full bg-[#171717] border border-gray-700 text-white rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all font-medium"
                required
              />
              <button 
                type="submit" 
                className="w-full bg-white text-black font-black text-[13px] tracking-widest uppercase rounded-xl px-4 py-3.5 hover:bg-[#3b82f6] hover:text-white transition-all hover:scale-105 active:scale-95"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* The links take up the remaining 8 columns, arranged equally */}
        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 md:pl-8 lg:pl-16 pt-4">
          
          {/* Column 2: Sản phẩm */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white font-black text-[15px] border-b border-gray-800 pb-4 uppercase tracking-widest">Sản phẩm</h4>
            <div className="flex flex-col gap-4 text-[14px] font-medium text-gray-400">
              <Link href="/category/vot-pickleball" className="hover:text-white hover:translate-x-1 transition-all">Vợt</Link>
              <Link href="/category/bong-pickleball" className="hover:text-white hover:translate-x-1 transition-all">Bóng</Link>
              <Link href="/category/phu-kien" className="hover:text-white hover:translate-x-1 transition-all">Phụ Kiện</Link>
            </div>
          </div>

          {/* Column 3: Khám phá */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white font-black text-[15px] border-b border-gray-800 pb-4 uppercase tracking-widest">Khám phá</h4>
            <div className="flex flex-col gap-4 text-[14px] font-medium text-gray-400">
              <Link href="/" className="hover:text-white hover:translate-x-1 transition-all">Giới thiệu</Link>
              <Link href="/blog" className="hover:text-white hover:translate-x-1 transition-all">Tin tức</Link>
              <Link href="/" className="hover:text-white hover:translate-x-1 transition-all">Nhà phân phối</Link>
              <Link href="/" className="hover:text-white hover:translate-x-1 transition-all">Tài trợ & Hợp tác</Link>
            </div>
          </div>

          {/* Column 4: Hỗ trợ */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white font-black text-[15px] border-b border-gray-800 pb-4 uppercase tracking-widest">Hỗ trợ</h4>
            <div className="flex flex-col gap-4 text-[14px] font-medium text-gray-400">
              <Link href="/" className="hover:text-white hover:translate-x-1 transition-all">Q&A</Link>
              <Link href="/" className="hover:text-white hover:translate-x-1 transition-all">Chính sách vận chuyển</Link>
              <Link href="/" className="hover:text-white hover:translate-x-1 transition-all">Chính sách thanh toán</Link>
              <Link href="/" className="hover:text-white hover:translate-x-1 transition-all">Chính sách bảo mật</Link>
              <Link href="/" className="hover:text-white hover:translate-x-1 transition-all">Chính sách bảo hành</Link>
            </div>
          </div>
          
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-gray-600 uppercase tracking-widest">
        <div className="text-center md:text-left">
          © {new Date().getFullYear()} {siteName}. Bản quyền thuộc về {siteName}.
        </div>
        <div className="flex items-center gap-6">
          {settings?.facebook && (
            <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#3b82f6] hover:scale-110 transition-all">
              <Facebook size={18} />
            </a>
          )}
          {settings?.instagram && (
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#3b82f6] hover:scale-110 transition-all">
              <Instagram size={18} />
            </a>
          )}
          <div className="hover:text-[#3b82f6] cursor-pointer hover:scale-110 transition-all">
            <Globe size={18} />
          </div>
        </div>
      </div>
    </footer>
  );
}
