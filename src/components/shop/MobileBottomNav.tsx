"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/components/shop/CartContext";
import { useSession } from "next-auth/react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { data: session } = useSession();

  // Do not show on checkout page to avoid distractions
  if (pathname.startsWith("/checkout")) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-5px_10px_rgba(0,0,0,0.02)] z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/"
          prefetch={false}
          className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
            pathname === "/" ? "text-[#2C2877]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Home size={22} className={pathname === "/" ? "fill-[#2C2877]/10" : ""} />
          <span className="text-[10px] font-semibold">Trang chủ</span>
        </Link>

        <Link
          href="/products"
          prefetch={false}
          className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
            pathname === "/products" ? "text-[#2C2877]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <LayoutGrid size={22} className={pathname === "/products" ? "fill-[#2C2877]/10" : ""} />
          <span className="text-[10px] font-semibold">Sản phẩm</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 hover:text-gray-600"
        >
          <div className="relative">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Giỏ hàng</span>
        </button>

        <Link
          href={session?.user ? "/account" : "/login"}
          prefetch={false}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            pathname.startsWith("/account") || pathname.startsWith("/login")
              ? "text-[#2C2877]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <User size={22} className={pathname.startsWith("/account") ? "fill-[#2C2877]/10" : ""} />
          <span className="text-[10px] font-semibold">{session ? "Tài khoản" : "Đăng nhập"}</span>
        </Link>
      </div>
    </div>
  );
}
