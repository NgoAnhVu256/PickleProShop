"use client";

import Link from "next/link";
import { MoveLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: `url('/bg-404.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-5xl w-full px-6 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* Left Side: Illustration */}
        <div className="relative group w-full lg:w-1/2 flex justify-center">
          <div className="absolute inset-0 bg-[#a757ff]/20 blur-[100px] rounded-full animate-pulse" />
          <img 
            src="/404-char.png" 
            alt="Lost Pickleball Character" 
            className="relative w-full max-w-[400px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:-translate-y-4 transition-transform duration-500 animate-bounce-slow"
          />
        </div>

        {/* Right Side: Text & Actions */}
        <div className="w-full lg:w-1/2 text-center lg:text-left text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/10">
            <HelpCircle size={16} className="text-[#a757ff]" />
            <span className="text-xs font-black uppercase tracking-widest">404 Error</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tighter uppercase leading-none">
            LẠC LỐI RỒI
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-300 font-medium mb-10 max-w-md leading-relaxed">
            Pickleball ơi mình đi đâu thế? <br/>
            Trang này không còn tồn tại, hãy quay lại sân thi đấu chính nhé.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link 
              href="/" 
              className="group flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#a757ff] hover:text-white transition-all shadow-xl hover:shadow-[#a757ff]/40"
            >
              <MoveLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#a757ff]/10 rounded-full blur-3xl animate-pulse" />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
