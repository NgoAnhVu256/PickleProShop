"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function LoginClient({ settings }: { settings: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const { data: session, status } = useSession();

  // Auto redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any)?.role;
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [status, session, callbackUrl, router]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email hoặc mật khẩu không chính xác. Vui lòng thử lại.");
      } else {
        toast.success("Đăng nhập thành công!");
        // Role-based redirect will be handled by useEffect above
        // Force a new session check
        window.location.href = callbackUrl || "/";
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: callbackUrl || "/" });
    } catch (error) {
      toast.error("Lỗi kết nối với Google.");
      setIsGoogleLoading(false);
    }
  };

  const logo = settings?.logo;
  const siteName = settings?.name;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60 animate-pulse" />

      <div className="w-full max-w-[450px] z-10">
        {/* Brand Header */}
        <div className="mb-8 text-center relative z-10">
          <img src={logo || '/favicon.ico'} alt="PicklePro" className="h-16 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-black mb-2 tracking-tight text-gray-900">Đăng Nhập</h1>
          <p className="text-gray-500 font-medium text-sm">Chào mừng trở lại PicklePro</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 backdrop-blur-sm">
          
          {/* Social Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 mb-8 group"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span className="text-gray-700 font-semibold text-sm">Tiếp tục với Google</span>
          </button>

          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <span className="relative bg-white px-4 text-xs font-bold text-gray-300 uppercase tracking-widest">hoặc email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Địa chỉ Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-[#3cc06e] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@picklepro.vn"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#58d68d] focus:bg-white focus:ring-4 focus:ring-green-500/5 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mật khẩu</label>
                <Link href="#" className="text-xs font-bold text-[#3cc06e] hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-[#3cc06e] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#58d68d] focus:bg-white focus:ring-4 focus:ring-green-500/5 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden bg-gradient-to-br from-[#58d68d] to-[#3cc06e] text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-green-100 hover:shadow-green-200 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  ĐĂNG NHẬP NGAY
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-xs text-gray-400 font-medium">
          © 2026 {siteName || "PicklePro Store"}. Tất cả quyền được bảo lưu
        </div>
      </div>
    </div>
  );
}
