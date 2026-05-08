"use client";

import { Facebook, Twitter, Link as LinkIcon, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ClientShare({ url, title }: { url: string, title?: string }) {
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Đã sao chép liên kết!");
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || "Bài viết hay từ PicklePro")}`, '_blank');
  };

  return (
    <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Chia sẻ:</span>
        <div className="flex gap-2">
          <button 
            onClick={handleShareFacebook}
            className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
            aria-label="Chia sẻ lên Facebook"
          >
            <Facebook size={18} />
          </button>
          <button 
            onClick={handleShareTwitter}
            className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"
            aria-label="Chia sẻ lên Twitter"
          >
            <Twitter size={18} />
          </button>
          <button 
            onClick={handleCopyLink}
            className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all"
            aria-label="Sao chép liên kết"
          >
            <LinkIcon size={18} />
          </button>
        </div>
      </div>
      <button 
        onClick={handleCopyLink}
        className="flex items-center gap-2 text-sm font-bold text-[#7DAACB] hover:underline underline-offset-4"
      >
        <Share2 size={16} /> Sao chép liên kết
      </button>
    </div>
  );
}
