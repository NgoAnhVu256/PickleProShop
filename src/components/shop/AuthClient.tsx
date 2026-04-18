"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight, User, Phone, ArrowLeft, ArrowRightCircle } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function AuthClient({ settings, initialMode = "login" }: { settings: any, initialMode?: "login" | "register" }) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Register States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [isRegLoading, setIsRegLoading] = useState(false);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const { data: session, status } = useSession();

  // Redirect if logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any)?.role;
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [status, session, callbackUrl, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email hoặc mật khẩu không chính xác.");
      } else {
        toast.success("Đăng nhập thành công!");
        window.location.href = callbackUrl || "/";
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi hệ thống.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      toast.error("Định dạng Email không hợp lệ!");
      return;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(regPhone)) {
      toast.error("Số điện thoại không hợp lệ (Bắt đầu bằng 0, đủ 10 số).");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(regPassword)) {
      toast.error("Mật khẩu cần ít nhất 8 ký tự, gồm 1 hoa, 1 thường và 1 số.");
      return;
    }

    setIsRegLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone, password: regPassword }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Đăng ký thành công! Đang chuyển hướng...");
        const result = await signIn("credentials", { email: regEmail, password: regPassword, redirect: false });
        if (!result?.error) window.location.href = callbackUrl || "/";
      } else {
        toast.error(data.error || "Lỗi đăng ký");
      }
    } catch {
      toast.error("Lỗi kết nối tới máy chủ.");
    } finally {
      setIsRegLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: callbackUrl || "/" });
    } catch {
      toast.error("Lỗi Google Auth.");
      setIsGoogleLoading(false);
    }
  };

  const logo = settings?.logo || '/favicon.ico';
  const siteName = settings?.name || "PicklePro";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Background Shapes */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#60a5fa]/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#3b82f6]/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 md:top-10 md:left-10 z-[100] flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-white/70 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:shadow-md">
        <ArrowLeft size={16} /> Trang chủ
      </Link>

      {/* Main Container - Responsive */}
      <div className="relative w-full max-w-[450px] md:max-w-[900px] min-h-[600px] md:h-[650px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row mt-14 md:mt-0">
        
        {/* --- MOBILE TOGGLE TABS (Hidden on Desktop) --- */}
        <div className="md:hidden flex border-b border-gray-100 w-full relative z-30 bg-white">
          <button onClick={() => setMode('login')} className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors ${mode === 'login' ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]' : 'text-gray-400'}`}>Đăng Nhập</button>
          <button onClick={() => setMode('register')} className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors ${mode === 'register' ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]' : 'text-gray-400'}`}>Đăng Ký</button>
        </div>

        {/* --- REGISTER FORM (Left Side Desktop, conditional Mobile) --- */}
        <div className={`w-full md:w-1/2 h-full md:absolute md:top-0 md:left-0 z-10 transition-all duration-700 ease-in-out px-8 md:px-12 py-8 flex flex-col justify-center bg-white ${mode === 'register' ? 'opacity-100 md:translate-x-0 static' : 'opacity-0 md:-translate-x-10 pointer-events-none hidden md:flex'}`}>
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-gray-900">Tạo tài khoản</h2>
            <p className="text-gray-500 font-medium text-sm md:hidden mb-6">Tham gia {siteName}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#3b82f6] transition-colors" />
              <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Họ và tên" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#60a5fa] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" required />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#3b82f6] transition-colors" />
              <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="Email" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#60a5fa] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" required />
            </div>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#3b82f6] transition-colors" />
              <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="Số điện thoại" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#60a5fa] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" required />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#3b82f6] transition-colors" />
              <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Mật khẩu" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#60a5fa] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" required />
            </div>
            
            <button type="submit" disabled={isRegLoading} className="w-full mt-2 bg-gradient-to-br from-[#60a5fa] to-[#3b82f6] text-white py-3.5 rounded-xl font-black text-sm shadow-xl shadow-blue-100 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              {isRegLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "TẠO TÀI KHOẢN MỚI"}
            </button>
          </form>

          <GoogleButton isLoading={isGoogleLoading} onClick={handleGoogleLogin} mode="register" />
        </div>

        {/* --- LOGIN FORM (Right Side Desktop, conditional Mobile) --- */}
        <div className={`w-full md:w-1/2 h-full md:absolute md:top-0 md:right-0 z-10 transition-all duration-700 ease-in-out px-8 md:px-12 py-8 flex flex-col justify-center bg-white ${mode === 'login' ? 'opacity-100 md:translate-x-0 static' : 'opacity-0 md:translate-x-10 pointer-events-none hidden md:flex'}`}>
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-gray-900">Đăng Nhập</h2>
            <p className="text-gray-500 font-medium text-sm md:hidden mb-6">Chào mừng trở lại!</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#3b82f6] transition-colors" />
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Địa chỉ Email" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#60a5fa] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" required />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#3b82f6] transition-colors" />
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Mật khẩu" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#60a5fa] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" required />
            </div>
            
            <div className="flex justify-end">
              <Link href="#" className="text-xs font-bold text-[#3b82f6] hover:underline">Quên mật khẩu?</Link>
            </div>

            <button type="submit" disabled={isLoginLoading} className="w-full bg-gradient-to-br from-[#60a5fa] to-[#3b82f6] text-white py-3.5 rounded-xl font-black text-sm shadow-xl shadow-blue-100 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              {isLoginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ĐĂNG NHẬP"}
            </button>
          </form>

          <GoogleButton isLoading={isGoogleLoading} onClick={handleGoogleLogin} mode="login" />
        </div>

        {/* --- DESKTOP SLIDING OVERLAY PANEL --- */}
        <div className={`hidden md:block absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-[#60a5fa] to-[#3b82f6] z-20 transition-transform duration-700 ease-in-out shadow-2xl ${mode === 'login' ? 'translate-x-0' : 'translate-x-[100%]'}`}>
          
          {/* Overlay Login Mode => Prompts to Register */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-opacity duration-300 delay-200 ${mode === 'login' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="h-28 w-28 rounded-3xl flex items-center justify-center mb-8 shrink-0">
              <img src={logo} className="w-full h-full object-contain drop-shadow-[0_4px_15px_rgba(255,255,255,0.3)]" alt="logo" />
            </div>
            <h2 className="text-4xl font-black text-white mb-6 leading-tight">Chào bạn mới!</h2>
            <p className="text-white/90 font-medium mb-10 leading-relaxed text-sm">Hãy tạo ngay một tài khoản để thỏa sức mua sắm hàng ngàn món đồ Pickleball và tận hưởng khuyến mãi riêng biệt.</p>
            <button onClick={() => setMode('register')} className="border-2 border-white text-white px-10 py-3.5 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-[#3b82f6] transition-all hover:scale-105 active:scale-95">
              Đăng Ký Ngay
            </button>
          </div>

          {/* Overlay Register Mode => Prompts to Login */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-opacity duration-300 delay-200 ${mode === 'register' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="h-28 w-28 rounded-3xl flex items-center justify-center mb-8 shrink-0">
              <img src={logo} className="w-full h-full object-contain drop-shadow-[0_4px_15px_rgba(255,255,255,0.3)]" alt="logo" />
            </div>
            <h2 className="text-4xl font-black text-white mb-6 leading-tight">Chào mừng trở lại!</h2>
            <p className="text-white/90 font-medium mb-10 leading-relaxed text-sm">Đăng nhập để xem trạng thái đơn hàng, giỏ hàng đang lưu và nhiều thông tin hấp dẫn khác từ PicklePro.</p>
            <button onClick={() => setMode('login')} className="border-2 border-white text-white px-10 py-3.5 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-[#3b82f6] transition-all hover:scale-105 active:scale-95">
              Đăng Nhập
            </button>
          </div>

        </div>
      </div>
{/* Responsive Footer Info text */}
<div className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">© 2026 {siteName}. All Rights Reserved.</div>
    </div>
  );
}

// Reusable Google Auth Button Fragment
function GoogleButton({ isLoading, onClick, mode }: { isLoading: boolean, onClick: () => void, mode: string }) {
  return (
    <>
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
        <span className="relative bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">hoặc nhanh hơn</span>
      </div>
      <button onClick={onClick} disabled={isLoading} type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-all">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        <span className="text-gray-700 font-bold text-sm">{mode === 'login' ? 'Đăng nhập Google' : 'Đăng ký bằng Google'}</span>
      </button>
    </>
  );
}
