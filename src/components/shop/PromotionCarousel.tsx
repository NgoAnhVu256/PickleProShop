"use client";
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PromotionCarousel({ promotions = [] }: { promotions: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (promotions.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
    scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 relative group">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight">Khuyến mãi</h2>
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 border border-gray-100 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 border border-gray-100 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {promotions.map((item) => (
          <div 
            key={item.id} 
            className="flex-none w-40 md:w-[190px] aspect-[1/1.6] rounded-xl md:rounded-2xl overflow-hidden relative group/card snap-start shadow-md border border-gray-50 block"
          >
            <img 
              src={item.image} 
              alt={item.title || "Promotion"} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
            />
            
            {/* Overlay Gradient as shown in screenshot */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

            {/* Action Button Label as shown in screenshot */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%]">
               <div className="bg-white/10 backdrop-blur-md border border-white/20 py-1.5 px-3 rounded-full flex items-center justify-center gap-2 text-[10px] font-bold text-white uppercase tracking-wider">
                 Xem chi tiết <ChevronRight className="w-3 h-3" />
               </div>
            </div>

            {item.link && (
              <a href={item.link} className="absolute inset-0 z-10" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
