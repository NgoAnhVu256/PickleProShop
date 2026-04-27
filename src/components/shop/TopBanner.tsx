"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
export default function TopBanner({ banners = [] }: { banners?: any[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full h-10 overflow-hidden relative bg-gray-100">
      {banners.map((banner, i) => (
        <Link
          key={banner.id}
          href={banner.link || '#'}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img src={banner.image} alt={banner.title || 'Announcement'} className="w-full h-full object-cover" />
        </Link>
      ))}
    </div>
  );
}
