"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BannerGrid({ banners }: { banners?: any }) {
  if (!banners || !banners.HERO || banners.HERO.length === 0) return null;

  const data = banners;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 border-b border-gray-100">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* HERO SLIDER */}
        <div className="col-span-12 lg:col-span-6 order-1 lg:order-2 rounded-xl overflow-hidden bg-[#fffbf4] relative group shadow-sm border border-gray-100 h-60 min-h-[240px] md:h-80 lg:h-[300px]">
          <HeroSlider items={data.HERO} />
        </div>

        {/* LEFT BANNER */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 order-2 lg:order-1 rounded-xl overflow-hidden bg-[#fffbf4] shadow-sm border border-gray-100 h-48 md:h-80 lg:h-[300px]">
          {data.LEFT?.length > 0 ? (
            <AutoSlider items={data.LEFT} interval={3000} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-300 uppercase font-bold tracking-widest">PicklePro</div>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 order-3 flex flex-col gap-4 h-auto md:h-80 lg:h-[300px]">
          <div className="flex-1 rounded-xl overflow-hidden bg-[#fffbf4] shadow-sm border border-gray-100 min-h-[120px] md:min-h-0">
            {data.RIGHT_TOP?.length > 0 ? (
              <AutoSlider items={data.RIGHT_TOP} interval={3300} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">PicklePro</div>
            )}
          </div>
          <div className="flex-1 rounded-xl overflow-hidden bg-[#fffbf4] shadow-sm border border-gray-100 min-h-[120px] md:min-h-0">
            {data.RIGHT_BOTTOM?.length > 0 ? (
              <AutoSlider items={data.RIGHT_BOTTOM} interval={3600} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">PicklePro</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── AutoSlider (LEFT / RIGHT_TOP / RIGHT_BOTTOM) ───────────────────────────
function AutoSlider({ items = [], interval }: { items: any[]; interval: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIndex((p) => (p + 1) % items.length), interval);
    return () => clearInterval(timer);
  }, [items, interval]);

  return (
    <div className="w-full h-full relative">
      {items.map((item, i) => {
        const isActive = i === index;
        const content = (
          <img
            src={item.image}
            alt={item.title || 'Banner'}
            className="w-full h-full object-cover"
          />
        );

        const cls = `absolute inset-0 w-full h-full transition-opacity duration-700 ${
          isActive ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
        }`;

        if (item.link) {
          return (
            <Link key={item.id} href={item.link} className={cls}>
              {content}
            </Link>
          );
        }
        return (
          <div key={item.id} className={cls}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

// ─── HeroSlider (HERO center) ────────────────────────────────────────────────
function HeroSlider({ items = [] }: { items: any[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIndex((p) => (p + 1) % items.length), 4000);
    return () => clearInterval(timer);
  }, [items]);

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((p) => (p - 1 + items.length) % items.length);
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((p) => (p + 1) % items.length);
  };

  return (
    <div className="w-full h-full relative group">
      {/* Slides */}
      {items.map((item, i) => {
        const isActive = i === index;
        const content = (
          <img
            src={item.image}
            alt={item.title || 'Hero Banner'}
            className="w-full h-full object-cover"
          />
        );

        const cls = `absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          isActive ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
        }`;

        if (item.link) {
          return (
            <Link key={item.id} href={item.link} className={cls}>
              {content}
            </Link>
          );
        }
        return (
          <div key={item.id} className={cls}>
            {content}
          </div>
        );
      })}

      {/* Prev / Next — always above slides (z-20) */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow"
            aria-label="Ảnh sau"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots — z-20, pointer-events-none so they don't swallow clicks */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
        {items.map((_, i) => (
          <span
            key={i}
            className={`block rounded-full transition-all duration-300 ${
              i === index ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
