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

  useEffect(() => {
    // Check if popup was already dismissed in this session
    const dismissed = sessionStorage.getItem("popup_banner_dismissed");
    if (dismissed) return;

    // Fetch POPUP banners from API
    fetch("/api/banners?position=POPUP")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setBanner(data.data[0]);
          // Small delay so the animation feels natural
          setTimeout(() => setVisible(true), 500);
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem("popup_banner_dismissed", "true");
    // Remove from DOM after animation
    setTimeout(() => setBanner(null), 300);
  };

  if (!banner) return null;

  const content = (
    <img
      src={banner.image}
      alt={banner.title}
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
