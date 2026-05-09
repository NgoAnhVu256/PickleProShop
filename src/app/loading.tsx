export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Outer static ring */}
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        {/* Spinning ring around the favicon */}
        <div className="absolute inset-0 border-4 border-[#7DAACB] rounded-full border-t-transparent border-r-transparent animate-spin shadow-lg shadow-[#7DAACB]/20"></div>
        {/* Favicon logo in center */}
        <img
          src="/api/favicon"
          alt="PicklePro"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
      <p className="mt-5 text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase animate-pulse">PicklePro đang tải...</p>
    </div>
  );
}
