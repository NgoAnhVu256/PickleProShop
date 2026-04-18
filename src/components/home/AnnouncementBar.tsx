"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Announcement {
  id: string;
  image: string | null;
  link: string | null;
}

interface Props {
  announcements: Announcement[];
}

export default function AnnouncementBar({ announcements }: Props) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  // Lọc chỉ lấy những thông báo có hình ảnh
  const validAnnouncements = announcements.filter((a) => a.image);

  useEffect(() => {
    if (!localStorage.getItem("ann-closed") && validAnnouncements.length > 0) {
      setVisible(true);
    }
  }, [validAnnouncements.length]);

  const goToNext = useCallback(() => {
    if (validAnnouncements.length <= 1) return;
    setIndex((prev) => (prev + 1) % validAnnouncements.length);
  }, [validAnnouncements.length]);

  // Auto-loop
  useEffect(() => {
    if (validAnnouncements.length <= 1) return;
    const t = setInterval(goToNext, 3000);
    return () => clearInterval(t);
  }, [goToNext, validAnnouncements.length]);

  if (!visible || validAnnouncements.length === 0) return null;

  const cur = validAnnouncements[index];

  return (
    <div className="relative w-full h-12 overflow-hidden bg-gray-100 flex items-center justify-center">
      {cur.link ? (
        <Link href={cur.link} className="absolute inset-0 block w-full h-full">
          <Image
            src={cur.image!}
            alt="Banner"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        </Link>
      ) : (
        <div className="absolute inset-0 block w-full h-full">
          {" "}
          <Image
            src={cur.image!}
            alt="Banner"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Close */}
      <button
        onClick={() => {
          setVisible(false);
          localStorage.setItem("ann-closed", "1");
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-sm bg-black bg-opacity-30 hover:bg-opacity-50 text-white flex items-center justify-center transition-colors z-10"
      >
        <X size={16} />
      </button>
    </div>
  );
}
