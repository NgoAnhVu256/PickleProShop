"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube, Globe, MapPin } from "lucide-react";

/* TikTok SVG icon */
function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.63a8.23 8.23 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.06z"/>
    </svg>
  );
}

export default function Footer({ settings }: { settings?: any }) {
  const logo = settings?.logo || settings?.favicon || '/favicon.ico';
  const siteName = settings?.name || "PicklePro";

  return (
    <footer className="bg-[#f4f5f7] text-[#3d4f5f] mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">

          {/* Col 1: Logo + Slogan */}
          <div className="md:col-span-3">
            <Link href="/" className="inline-block mb-3">
              <img
                src={logo}
                alt={siteName}
                className="h-16 w-16 object-contain"
              />
            </Link>
            {settings?.slogan && (
              <p className="text-[13px] font-semibold text-[#3d4f5f] leading-relaxed">
                {settings.slogan}
              </p>
            )}
          </div>

          {/* Col 2: Liên kết */}
          <div className="md:col-span-2">
            <h4 className="text-[13px] font-black text-[#2d3a45] uppercase tracking-[0.15em] mb-5">Liên kết</h4>
            <div className="flex flex-col gap-3 text-[13px] font-medium text-[#5a6a78]">
              <Link href="/" className="hover:text-[#2d3a45] transition-colors">Cửa hàng</Link>
              <Link href="/blog" className="hover:text-[#2d3a45] transition-colors">Tin tức</Link>
              <Link href="/" className="hover:text-[#2d3a45] transition-colors">Đại lý</Link>
            </div>
          </div>

          {/* Col 3: Thông tin liên hệ */}
          <div className="md:col-span-4">
            <h4 className="text-[13px] font-black text-[#2d3a45] uppercase tracking-[0.15em] mb-5">Thông tin liên hệ</h4>
            <div className="flex flex-col gap-3 text-[13px] font-medium text-[#5a6a78]">
              {settings?.email && (
                <p>Email: <a href={`mailto:${settings.email}`} className="hover:text-[#2d3a45] transition-colors">{settings.email}</a></p>
              )}
              {(settings?.hotline || settings?.phone) && (
                <p>Hotline: <a href={`tel:${settings.hotline || settings.phone}`} className="hover:text-[#2d3a45] transition-colors">{settings.hotline || settings.phone}</a></p>
              )}
              {settings?.address && (
                <div className="flex gap-2 items-start">
                  <MapPin size={14} className="mt-[2px] shrink-0 text-[#3d8f5f]" />
                  <span><span className="font-semibold text-[#2d3a45]">CS1:</span> {settings.address}</span>
                </div>
              )}
              {settings?.address2 && (
                <div className="flex gap-2 items-start">
                  <MapPin size={14} className="mt-[2px] shrink-0 text-[#3d8f5f]" />
                  <span><span className="font-semibold text-[#2d3a45]">CS2:</span> {settings.address2}</span>
                </div>
              )}
            </div>
          </div>

          {/* Col 4: Mạng xã hội */}
          <div className="md:col-span-3">
            <h4 className="text-[13px] font-black text-[#2d3a45] uppercase tracking-[0.15em] mb-5">Mạng xã hội</h4>
            <div className="flex items-center gap-3">
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-[#3d4f5f] hover:text-[#1877F2] transition-colors">
                  <Facebook size={20} />
                </a>
              )}
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-[#3d4f5f] hover:text-[#E4405F] transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {settings?.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-[#3d4f5f] hover:text-[#FF0000] transition-colors">
                  <Youtube size={20} />
                </a>
              )}
              {settings?.tiktok && (
                <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#3d4f5f] hover:text-black transition-colors">
                  <TikTokIcon size={20} />
                </a>
              )}
              {settings?.website && (
                <a href={settings.website} target="_blank" rel="noopener noreferrer" className="text-[#3d4f5f] hover:text-[#2d3a45] transition-colors">
                  <Globe size={20} />
                </a>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <p className="text-center text-[11px] font-bold text-[#8a9baa] uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {siteName}. Bản quyền thuộc về {siteName}.
          </p>
        </div>
      </div>
    </footer>
  );
}
