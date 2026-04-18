"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function BannerGrid({ banners }: { banners?: any }) {
  if (!banners || !banners.HERO || banners.HERO.length === 0) return null;

  const data = banners;
  
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 border-b border-gray-100">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* HERO SLIDER - order-1 on mobile, order-2 on desktop */}
        <div className="col-span-12 lg:col-span-6 order-1 lg:order-2 rounded-xl overflow-hidden bg-[#fffbf4] relative group shadow-sm border border-gray-100 h-60 min-h-[240px] md:h-80 lg:h-[300px]">
          <HeroSlider items={data.HERO} />
        </div>

        {/* LEFT BANNER - order-2 on mobile, order-1 on desktop */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 order-2 lg:order-1 rounded-xl overflow-hidden bg-[#fffbf4] shadow-sm border border-gray-100 h-48 md:h-80 lg:h-[300px]">
          {data.LEFT?.length > 0 ? (
            <AutoSlider items={data.LEFT} interval={3000} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-300 uppercase font-bold tracking-widest">PicklePro</div>
          )}
        </div>

        {/* RIGHT SECTION - order-3 on all sizes */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 order-3 lg:order-3 flex flex-col gap-4 h-auto md:h-80 lg:h-[300px]">
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

function AutoSlider({ items = [], interval }: { items: any[], interval: number }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % items.length), interval);
    return () => clearInterval(timer);
  }, [items]);
  return (
    <div className="w-full h-full relative">
      {items.map((item, i) => (
        <img 
          key={item.id} 
          src={item.image} 
          alt={item.title || "Banner"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`} 
        />
      ))}
    </div>
  );
}

function HeroSlider({ items = [] }: { items: any[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % items.length), 2000);
    return () => clearInterval(timer);
  }, [items]);

  return (
    <div className="w-full h-full relative group">
      {items.map((item, i) => (
        <img 
          key={item.id} 
          src={item.image} 
          alt="Hero"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`} 
        />
      ))}
      
      {/* Navigation */}
      <button onClick={() => setIndex((prev) => (prev - 1 + items.length) % items.length)} 
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => setIndex((prev) => (prev + 1) % items.length)} 
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {items.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}
