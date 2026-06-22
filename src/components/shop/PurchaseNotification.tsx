"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, CheckCircle2 } from "lucide-react";

interface Purchase {
  id: string;
  buyerName: string;
  location: string;
  productName: string;
  productSlug: string;
  thumbnail: string | null;
  createdAt: string;
  isReal: boolean;
}

export default function PurchaseNotification() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [timeAgoText, setTimeAgoText] = useState("");
  
  const currentIndexRef = useRef(0);
  const displayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch purchases data on mount
  useEffect(() => {
    async function loadPurchases() {
      try {
        const res = await fetch("/api/recent-purchases");
        const data = await res.json();
        if (data.success && data.purchases.length > 0) {
          setPurchases(data.purchases);
          
          // Schedule first display after 15 seconds
          displayTimeoutRef.current = setTimeout(() => {
            showNextPurchase(data.purchases);
          }, 15000);
        }
      } catch (err) {
        console.error("Failed to load recent purchases", err);
      }
    }

    loadPurchases();

    return () => {
      if (displayTimeoutRef.current) clearTimeout(displayTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Format time ago dynamically
  const updateRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      setTimeAgoText("vừa xong");
    } else if (diffMins < 60) {
      setTimeAgoText(`${diffMins} phút trước`);
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      setTimeAgoText(`${hours} giờ trước`);
    } else {
      const days = Math.floor(diffMins / 1440);
      setTimeAgoText(`${days} ngày trước`);
    }
  };

  const showNextPurchase = (list: Purchase[]) => {
    if (list.length === 0) return;

    const index = currentIndexRef.current;
    const purchase = list[index];
    
    setCurrentPurchase(purchase);
    updateRelativeTime(purchase.createdAt);
    setIsOpen(true);

    // Auto hide after 7 seconds
    displayTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 7000);

    // Update index for next time
    currentIndexRef.current = (index + 1) % list.length;

    // Schedule next notification in 3 minutes (180,000ms)
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      showNextPurchase(list);
    }, 180000);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };

  if (!currentPurchase) return null;

  const productUrl = `/products/${currentPurchase.productSlug}`;
  const imageUrl = currentPurchase.thumbnail
    ? `/api/img?url=${encodeURIComponent(currentPurchase.thumbnail)}&w=100&q=80`
    : "/api/favicon";

  return (
    <div
      className={`fixed z-[9990] transition-all duration-500 ease-out 
        bottom-20 right-4 md:bottom-6 md:right-6 max-w-[340px] md:max-w-[380px] w-full
        ${isOpen 
          ? "transform translate-y-0 opacity-100 pointer-events-auto" 
          : "transform translate-y-8 opacity-0 pointer-events-none"
        }`}
    >
      <Link
        href={productUrl}
        prefetch={false}
        className="block bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl p-3 flex gap-3 shadow-[0_10px_30px_rgba(44,40,119,0.08)] hover:shadow-[0_12px_35px_rgba(44,40,119,0.12)] hover:-translate-y-0.5 transition-all group relative overflow-hidden"
      >
        {/* Highlight badge for real purchases */}
        {currentPurchase.isReal && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2C2877] via-[#FF6220] to-[#A0E870]" />
        )}

        {/* Product Image */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-50 shrink-0 relative flex items-center justify-center">
          <img
            src={imageUrl}
            alt={currentPurchase.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Content text */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] font-bold text-gray-500 mb-0.5">
            <span className="text-[#2C2877]">{currentPurchase.buyerName}</span>
            <span className="text-gray-400 font-medium">ở</span>
            <span className="text-gray-700">{currentPurchase.location}</span>
          </div>

          <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#FF6220] transition-colors mb-1">
            vừa mua <span className="font-bold text-gray-900">{currentPurchase.productName}</span>
          </p>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 font-medium">{timeAgoText}</span>
            {currentPurchase.isReal && (
              <span className="flex items-center gap-0.5 text-[#10b981] text-[9px] font-black uppercase tracking-wider bg-[#10b981]/10 px-1.5 py-0.5 rounded-md">
                <CheckCircle2 size={9} className="stroke-[3px]" /> Đã xác minh
              </span>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Đóng thông báo"
        >
          <X size={12} className="stroke-[2.5px]" />
        </button>
      </Link>
    </div>
  );
}
