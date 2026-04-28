"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Target, Package, Grid3x3, Newspaper, Users } from "lucide-react";
import Link from "next/link";

export interface BannerProps {
  image: string;
  link: string;
}

interface HomePageClientProps {
  topBanners: BannerProps[];
  leftBanners: BannerProps[];
  heroBanners: BannerProps[];
  rightTopBanners: BannerProps[];
  rightBottomBanners: BannerProps[];
  logoUrl?: string | null;
}

function TopBanner({ banners }: { banners: BannerProps[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="w-full h-[45px] relative overflow-hidden bg-gray-100">
      {banners.map((b, idx) => (
        <Link
          key={idx}
          href={b.link || "#"}
          className={`absolute inset-0 transition-opacity duration-500 cursor-pointer ${
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.image} alt="Top Banner" className="w-full h-full object-cover" />
        </Link>
      ))}
    </div>
  );
}

function SearchBox() {
  return (
    <div className="flex-1 max-w-[700px] flex items-center relative group">
      <input
        type="text"
        placeholder="Gõ từ khóa bạn cần tìm kiếm"
        className="w-full text-[14px] pl-6 pr-14 py-3 bg-white/95 border border-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm transition-all text-gray-700 placeholder:text-gray-400"
      />
      <button className="absolute right-1.5 p-2 bg-[#0f172a] text-white hover:bg-black rounded-full transition-all flex items-center justify-center w-9 h-9 shadow-md active:scale-95">
        <Search className="w-4 h-4" />
      </button>
    </div>
  );
}

function CategoryNav() {
  return (
    <nav className="w-full bg-white border-b border-gray-100 shadow-sm flex justify-center sticky top-[92px] z-[90]">
      <div className="w-full px-6 lg:px-10 py-4">
        <ul className="flex items-center justify-center gap-10 text-[13px] font-bold text-gray-700 tracking-wide">
          <li className="flex items-center gap-2.5 hover:text-blue-600 cursor-pointer transition-colors group">
            <Target className="w-4 h-4 group-hover:scale-110 transition-transform" /> VỢT PICKLEBALL
          </li>
          <li className="flex items-center gap-2.5 hover:text-blue-600 cursor-pointer transition-colors group">
            <Package className="w-4 h-4 group-hover:scale-110 transition-transform" /> PHỤ KIỆN
          </li>
          <li className="flex items-center gap-2.5 hover:text-blue-600 cursor-pointer transition-colors group">
            <Grid3x3 className="w-4 h-4 group-hover:scale-110 transition-transform" /> BỘ SƯU TẬP
          </li>
          <li className="flex items-center gap-2.5 hover:text-blue-600 cursor-pointer transition-colors group">
            <Newspaper className="w-4 h-4 group-hover:scale-110 transition-transform" /> TIN TỨC
          </li>
          <li className="flex items-center gap-2.5 hover:text-blue-600 cursor-pointer transition-colors group">
            <Users className="w-4 h-4 group-hover:scale-110 transition-transform" /> CỘNG ĐỒNG
          </li>
        </ul>
      </div>
    </nav>
  );
}

function Header({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <header className="bg-gradient-to-b from-[#f0f7ff] to-[#e6effc] w-full border-b border-gray-100 sticky top-0 z-[100] shadow-sm">
      <div className="w-full px-6 lg:px-10 py-5 flex items-center justify-between gap-10 h-[92px]">
        {/* LEFT: Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-90 transition-opacity">
          {logoUrl ? (
             // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-[46px] w-auto object-contain" />
          ) : (
            <div className="w-12 h-12 bg-[#0f172a] rounded-[14px] flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-white/20">
              P
            </div>
          )}
          <span className="text-[28px] font-extrabold text-[#0f172a] tracking-tight whitespace-nowrap">PicklePro</span>
        </Link>

        {/* CENTER: SearchBox */}
        <div className="flex-1 flex justify-center px-4">
          <SearchBox />
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-5 shrink-0">
          <Link href="/login" className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-[14px] font-bold transition-all border border-gray-100 shadow-sm hover:shadow active:scale-95">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Tài khoản
          </Link>
          <Link href="/cart" className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-[#9333ea] to-[#7c3aed] hover:brightness-110 text-white rounded-full text-[14px] font-bold transition-all shadow-md hover:shadow-lg active:scale-95 text-nowrap">
            <ShoppingCart className="w-4 h-4" />
            Giỏ hàng
            <div className="bg-white text-[#9333ea] rounded-full w-[20px] h-[20px] flex items-center justify-center text-[10px] font-black ml-1 shadow-inner shrink-0">
              0
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

function SideSlider({ banners, intervalTime = 3000, className = "" }: { banners: BannerProps[], intervalTime?: number, className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [banners.length, intervalTime]);

  return (
    <div className={`w-full h-full relative rounded-[20px] overflow-hidden bg-gray-50 group shadow-sm ${className}`}>
      {banners.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm border border-gray-100 italic">Trống</div>
      ) : (
        banners.map((b, idx) => (
          <Link key={idx} href={b.link || "#"} className={`absolute inset-0 w-full h-full transition-opacity duration-700 block ${idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.image} alt="Side Banners" className="w-full h-full object-cover" />
          </Link>
        ))
      )}
    </div>
  );
}

function HeroSlider({ banners, className = "" }: { banners: BannerProps[], className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className={`w-full h-full relative rounded-[20px] overflow-hidden bg-gray-50 shadow-sm group ${className}`}>
      {banners.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm border border-gray-100 italic">Trống</div>
      ) : (
        <>
          {banners.map((b, idx) => (
            <Link key={idx} href={b.link || "#"} className={`absolute inset-0 w-full h-full transition-opacity duration-700 block ${idx === currentIndex ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt="Hero Banner" className="w-full h-full object-cover" />
            </Link>
          ))}

          {/* Navigation Arrows (Pill shaped like reference) */}
          {banners.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-16 rounded-full bg-black/10 hover:bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
              >
                <span className="text-xl font-light">‹</span>
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % banners.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-16 rounded-full bg-black/10 hover:bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
              >
                <span className="text-xl font-light">›</span>
              </button>
              
              {/* Pagination Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-white w-8 shadow-sm" : "bg-white/40 hover:bg-white/60 w-1.5"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function HeroSection({ 
  leftBanners, 
  heroBanners, 
  rightTopBanners, 
  rightBottomBanners 
}: { 
  leftBanners: BannerProps[], 
  heroBanners: BannerProps[], 
  rightTopBanners: BannerProps[], 
  rightBottomBanners: BannerProps[] 
}) {
  return (
    <section className="w-full bg-white flex justify-center">
      <div className="w-full max-w-[1440px] px-4 md:px-8 lg:px-16 py-8">
        {/* h-auto using Hero's aspect ratio to define height for everyone */}
        <div className="grid grid-cols-12 grid-rows-2 gap-3 h-auto items-stretch">
          
          {/* 1. LEFT - row-span-2 will stretch to full height */}
          <div className="col-span-2 row-span-2">
             <SideSlider banners={leftBanners} className="h-full w-full" />
          </div>

          {/* 2. MAIN HERO - Defines the height via aspect-ratio */}
          <div className="col-span-8 row-span-2 aspect-[2.6/1] lg:aspect-[2.8/1]">
             <HeroSlider banners={heroBanners} className="h-full w-full" />
          </div>

          {/* 3. RIGHT TOP */}
          <div className="col-span-2 row-span-1 h-full overflow-hidden">
             <SideSlider banners={rightTopBanners} className="h-full w-full" />
          </div>

          {/* 4. RIGHT BOTTOM */}
          <div className="col-span-2 row-span-1 h-full overflow-hidden">
             <SideSlider banners={rightBottomBanners} className="h-full w-full" />
          </div>

        </div>
      </div>
    </section>
  );
}

export default function HomePageClient(props: HomePageClientProps) {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 italic-none">
      {/* 1. FIXED TOP BANNER - Always at the very top */}
      {props.topBanners.length > 0 && <TopBanner banners={props.topBanners} />}

      {/* 2. HEADER & NAVIGATION - Sticky at top */}
      <Header logoUrl={props.logoUrl} />

      {/* 3. CONSOLIDATED HERO SECTION (All Sliders) */}
      <HeroSection 
        leftBanners={props.leftBanners} 
        heroBanners={props.heroBanners} 
        rightTopBanners={props.rightTopBanners} 
        rightBottomBanners={props.rightBottomBanners} 
      />
      
      {/* Future sections (Featured, New, etc.) can go here */}
    </div>
  );
}
