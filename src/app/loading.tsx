export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer static ring */}
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-[#7DAACB] rounded-full border-t-transparent border-r-transparent animate-spin shadow-lg shadow-[#7DAACB]/20"></div>
        {/* Favicon from admin — uses /api/favicon which reads store_favicon from DB */}
        <img
          src="/api/favicon"
          alt="PicklePro"
          width={52}
          height={52}
          className="w-[52px] h-[52px] rounded-full object-cover"
        />
      </div>
      <p className="mt-5 text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase animate-pulse">Đang tải...</p>
    </div>
  );
}
