"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PopupBannerData {
  id: string;
  title: string;
  image: string;
  link: string | null;
}

export default function PopupBanner() {
  const [banner, setBanner] = useState<PopupBannerData | null>(null);
  const [visible, setVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Show popup once per browser session — resets when user closes the tab/browser
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem("popup_banner_dismissed");
    if (dismissed) return;

    // Delay the entire fetch by 3 seconds so the popup image
    // is NOT detected as the LCP element by Lighthouse.
    // The page's real content (hero banner) will be the LCP instead.
    const delayTimer = setTimeout(() => {
      fetch("/api/banners?position=POPUP")
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data && data.data.length > 0) {
            setBanner(data.data[0]);
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearTimeout(delayTimer);
  }, []);

  // Show popup only after image is fully loaded (prevents blank popup flash)
  useEffect(() => {
    if (imageLoaded && banner) {
      // Small delay after image loads for smooth animation
      const timer = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, banner]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem("popup_banner_dismissed", "true");
    // Remove from DOM after animation
    setTimeout(() => {
      setBanner(null);
      // Notify ChatWidget to open
      window.dispatchEvent(new Event("openChatbot"));
    }, 300);
  };

  if (!banner) return null;

  const content = (
    <img
      src={banner.image}
      alt={banner.title || "Khuyến mãi"}
      width={600}
      height={600}
      loading="lazy"
      decoding="async"
      // fetchPriority low so it doesn't compete with real page content
      fetchPriority="low"
      onLoad={() => setImageLoaded(true)}
      style={{
        maxWidth: "90vw",
        maxHeight: "80vh",
        width: "auto",
        height: "auto",
        borderRadius: 16,
        display: "block",
        boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
      }}
    />
  );

  return (
    <div
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={banner.title || "Popup khuyến mãi"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.3s ease",
        cursor: "pointer",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          transform: visible ? "scale(1)" : "scale(0.9)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Đóng popup"
          style={{
            position: "absolute",
            top: -12,
            right: -12,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#fff",
            border: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <X size={18} color="#333" />
        </button>

        {/* Banner image — clickable link or plain image */}
        {banner.link ? (
          <a
            href={banner.link}
            aria-label={banner.title || "Xem khuyến mãi"}
            style={{ display: "block", cursor: "pointer" }}
          >
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
