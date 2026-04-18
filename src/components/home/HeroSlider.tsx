"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface Banner {
  id: string;
  image: string;
  title: string;
  link?: string | null;
}

export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setSelected(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  if (!banners.length) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-2xl flex items-center justify-center text-white/20 text-lg italic select-none">
        Hero Slider
      </div>
    );
  }

  return (
    <div className="relative group w-full h-full overflow-hidden rounded-2xl shadow-2xl">
      {/* Embla viewport */}
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {banners.map((b, i) => (
            <div key={b.id} className="flex-[0_0_100%] min-w-0 relative h-full">
              {/* Slide image */}
              <Image
                src={b.image}
                alt={b.title}
                fill
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 58vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Text overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
                <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-2">
                  PicklePro Collection
                </p>
                <h2 className="text-white text-2xl lg:text-4xl font-black leading-tight max-w-lg drop-shadow-lg mb-4">
                  {b.title}
                </h2>
                {b.link && (
                  <Link
                    href={b.link}
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-6 py-2.5 rounded-xl w-fit transition-all shadow-lg shadow-emerald-900/40 group/btn"
                  >
                    Khám phá ngay
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
      >
        <ChevronRight size={22} />
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === selected
                ? "bg-emerald-400 w-6 h-2"
                : "bg-white/40 hover:bg-white/60 w-2 h-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
