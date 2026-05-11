import { getSiteSettings } from "@/lib/settings";

export default async function Loading() {
  let logoSrc = "/api/favicon";
  try {
    const settings = await getSiteSettings();
    // Ưu tiên logo từ admin, fallback favicon
    if (settings.logo) {
      logoSrc = settings.logo;
    } else if (settings.favicon && settings.favicon !== "/favicon.ico") {
      logoSrc = settings.favicon;
    }
  } catch {}

  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer static ring */}
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-[#7DAACB] rounded-full border-t-transparent border-r-transparent animate-spin shadow-lg shadow-[#7DAACB]/20"></div>
        {/* Logo from admin settings */}
        <img
          src={logoSrc}
          alt="PicklePro"
          width={52}
          height={52}
          className="w-13 h-13 rounded-full object-cover"
        />
      </div>
      <p className="mt-5 text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase animate-pulse">PicklePro đang tải...</p>
    </div>
  );
}
