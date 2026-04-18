"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube, Globe, Mail, Phone, MapPin, Clock } from "lucide-react";

/* TikTok SVG icon (Lucide doesn't include it) */
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.63a8.23 8.23 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.06z"/>
    </svg>
  );
}

export default function Footer({ settings }: { settings?: any }) {
  const logo = settings?.logo || '/favicon.ico';
  const siteName = settings?.name || "PicklePro";

  return (
    <footer className="bg-[#f5f5f5] text-gray-800 py-16 mt-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 border-b border-gray-200 pb-16">

        {/* Column 1: Store Info */}
        <div className="md:col-span-4 lg:col-span-4">
          <Link href="/" className="mb-6 inline-flex items-center gap-3">
            <img
              src={logo}
              alt={siteName}
              className="h-14 w-14 object-contain rounded-xl"
            />
            <span className="text-xl font-black text-gray-900 tracking-tight">{siteName}</span>
          </Link>

          {settings?.slogan && (
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              {settings.slogan}
            </p>
          )}

          {/* Contact Info */}
          <div className="flex flex-col gap-3 text-sm">
            {settings?.address && (
              <div className="flex items-start gap-2.5 text-gray-600">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <span>{settings.address}</span>
              </div>
            )}
            {settings?.phone && (
              <div className="flex items-center gap-2.5 text-gray-600">
                <Phone size={16} className="shrink-0 text-gray-400" />
                <a href={`tel:${settings.phone}`} className="hover:text-gray-900 transition-colors">{settings.phone}</a>
              </div>
            )}
            {settings?.hotline && (
              <div className="flex items-center gap-2.5 text-gray-600">
                <Phone size={16} className="shrink-0 text-gray-400" />
                <span>Hotline: <a href={`tel:${settings.hotline}`} className="font-semibold hover:text-gray-900 transition-colors">{settings.hotline}</a></span>
              </div>
            )}
            {settings?.email && (
              <div className="flex items-center gap-2.5 text-gray-600">
                <Mail size={16} className="shrink-0 text-gray-400" />
                <a href={`mailto:${settings.email}`} className="hover:text-gray-900 transition-colors">{settings.email}</a>
              </div>
            )}
            {settings?.workingHours && (
              <div className="flex items-center gap-2.5 text-gray-600">
                <Clock size={16} className="shrink-0 text-gray-400" />
                <span>{settings.workingHours}</span>
              </div>
            )}
            {settings?.website && (
              <div className="flex items-center gap-2.5 text-gray-600">
                <Globe size={16} className="shrink-0 text-gray-400" />
                <a href={settings.website} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">{settings.website}</a>
              </div>
            )}
          </div>

          {/* Social Networks */}
          <div className="flex items-center gap-4 mt-6">
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#1877F2] hover:text-white transition-all">
                <Facebook size={17} />
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#dc2743] hover:text-white transition-all">
                <Instagram size={17} />
              </a>
            )}
            {settings?.youtube && (
              <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#FF0000] hover:text-white transition-all">
                <Youtube size={17} />
              </a>
            )}
            {settings?.tiktok && (
              <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all">
                <TikTokIcon size={17} />
              </a>
            )}
          </div>
        </div>

        {/* The links take up the remaining columns */}
        <div className="md:col-span-8 lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 md:pl-8 lg:pl-16 pt-4">

          {/* Column 2: Sản phẩm */}
          <div className="flex flex-col gap-6">
            <h4 className="text-gray-900 font-black text-[15px] border-b border-gray-300 pb-4 uppercase tracking-widest">Sản phẩm</h4>
            <div className="flex flex-col gap-4 text-[14px] font-medium text-gray-500">
              <Link href="/category/vot-pickleball" className="hover:text-gray-900 hover:translate-x-1 transition-all">Vợt</Link>
              <Link href="/category/bong-pickleball" className="hover:text-gray-900 hover:translate-x-1 transition-all">Bóng</Link>
              <Link href="/category/phu-kien" className="hover:text-gray-900 hover:translate-x-1 transition-all">Phụ Kiện</Link>
            </div>
          </div>

          {/* Column 3: Khám phá */}
          <div className="flex flex-col gap-6">
            <h4 className="text-gray-900 font-black text-[15px] border-b border-gray-300 pb-4 uppercase tracking-widest">Khám phá</h4>
            <div className="flex flex-col gap-4 text-[14px] font-medium text-gray-500">
              <Link href="/" className="hover:text-gray-900 hover:translate-x-1 transition-all">Giới thiệu</Link>
              <Link href="/blog" className="hover:text-gray-900 hover:translate-x-1 transition-all">Tin tức</Link>
              <Link href="/" className="hover:text-gray-900 hover:translate-x-1 transition-all">Nhà phân phối</Link>
              <Link href="/" className="hover:text-gray-900 hover:translate-x-1 transition-all">Tài trợ &amp; Hợp tác</Link>
            </div>
          </div>

          {/* Column 4: Hỗ trợ */}
          <div className="flex flex-col gap-6">
            <h4 className="text-gray-900 font-black text-[15px] border-b border-gray-300 pb-4 uppercase tracking-widest">Hỗ trợ</h4>
            <div className="flex flex-col gap-4 text-[14px] font-medium text-gray-500">
              <Link href="/" className="hover:text-gray-900 hover:translate-x-1 transition-all">Q&amp;A</Link>
              <Link href="/" className="hover:text-gray-900 hover:translate-x-1 transition-all">Chính sách vận chuyển</Link>
              <Link href="/" className="hover:text-gray-900 hover:translate-x-1 transition-all">Chính sách thanh toán</Link>
              <Link href="/" className="hover:text-gray-900 hover:translate-x-1 transition-all">Chính sách bảo mật</Link>
              <Link href="/" className="hover:text-gray-900 hover:translate-x-1 transition-all">Chính sách bảo hành</Link>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
        <div className="text-center md:text-left">
          © {new Date().getFullYear()} {siteName}. Bản quyền thuộc về {siteName}.
        </div>
      </div>
    </footer>
  );
}
