"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterClient({ settings }: { settings: any }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Định dạng Email không hợp lệ!");
      return;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Số điện thoại không hợp lệ (Bắt đầu bằng 0, đủ 10 số).");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Mật khẩu cần ít nhất 8 ký tự, gồm 1 chữ hoa, 1 chữ thường và 1 số.");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Đăng ký thành công! Đang đăng nhập...");
        // Auto login after register
        const loginResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (loginResult?.error) {
          router.push("/login");
        } else {
          router.push("/");
        }
      } else {
        toast.error(data.error || "Có lỗi xảy ra khi đăng ký.");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast.error("Lỗi kết nối với Google.");
    }
  };

  const logo = settings?.logo;
  const siteName = settings?.name;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-center" />
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-60 animate-pulse" />

      <div className="w-full max-w-[480px] z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <img src={logo || '/favicon.ico'} alt={siteName} className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Trở thành thành viên</h1>
          <p className="text-gray-500 text-sm px-10">Gia nhập cộng đồng {siteName || "PicklePro"} để nhận ưu đãi đặc quyền.</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100 backdrop-blur-sm">
          
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#f8fafc] border border-gray-100 py-3.5 rounded-2xl hover:bg-gray-100 transition-all duration-300 mb-8 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-gray-700 font-bold text-sm">Đăng ký bằng Google</span>
          </button>

          <div className="relative mb-8 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <span className="relative bg-white px-6">hoặc bằng tay</span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Họ và tên</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-[#3cc06e] transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#58d68d] focus:bg-white focus:ring-4 focus:ring-green-500/5 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-[#3cc06e] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#58d68d] focus:bg-white focus:ring-4 focus:ring-green-500/5 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Số điện thoại</label>
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-[#3cc06e] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#58d68d] focus:bg-white focus:ring-4 focus:ring-green-500/5 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 pb-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mật khẩu</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-[#3cc06e] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#58d68d] focus:bg-white focus:ring-4 focus:ring-green-500/5 transition-all"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:bg-gray-900 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  TẠO TÀI KHOẢN MIỄN PHÍ
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500 font-medium">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-[#3cc06e] font-bold hover:underline">Đăng nhập</Link>
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            <ShieldCheck className="w-4 h-4 text-[#3cc06e]" />
            Dữ liệu mã hoá
          </div>
          <div className="w-1 h-1 bg-gray-200 rounded-full" />
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Trực thuộc {siteName || "PicklePro.vn"}
          </div>
        </div>
      </div>
    </div>
  );
}
