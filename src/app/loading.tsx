export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 h-1.5 bg-[#2C2877] z-[9999] opacity-90 overflow-hidden shadow-sm">
      <div className="h-full bg-gradient-to-r from-[#2C2877] via-[#FF6220] to-[#A0E870] animate-loading-bar" />
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(0); }
          100% { width: 95%; transform: translateX(0); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.2s cubic-bezier(0.1, 0.8, 0.1, 1) forwards;
        }
      `}</style>
    </div>
  );
}
