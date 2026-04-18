import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full shadow-inner"></div>
        <div className="absolute inset-0 border-4 border-[#a757ff] rounded-full border-t-transparent animate-spin shadow-lg shadow-[#a757ff]/20"></div>
        <Loader2 className="w-6 h-6 text-[#a757ff] absolute animate-pulse" strokeWidth={3} />
      </div>
      <p className="mt-5 text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase animate-pulse">PicklePro đang tải...</p>
    </div>
  );
}
