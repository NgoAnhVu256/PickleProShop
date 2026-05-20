"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/components/shop/CartContext";
import { useSession } from "next-auth/react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const { data: session } = useSession();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Do not show on checkout page to avoid distractions
  if (pathname.startsWith("/checkout")) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-5px_10px_rgba(0,0,0,0.02)] z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            pathname === "/" ? "text-[#7DAACB]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Home size={22} className={pathname === "/" ? "fill-[#7DAACB]/20" : ""} />
          <span className="text-[10px] font-semibold">Trang chủ</span>
        </Link>

        <Link
          href="/products"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            pathname.startsWith("/products") || pathname.startsWith("/category")
              ? "text-[#7DAACB]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <LayoutGrid size={22} className={pathname.startsWith("/products") ? "fill-[#7DAACB]/20" : ""} />
          <span className="text-[10px] font-semibold">Sản phẩm</span>
        </Link>

        <Link
          href="/checkout"
          className="relative flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 hover:text-gray-600"
        >
          <div className="relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Giỏ hàng</span>
        </Link>

        <Link
          href={session ? "/account" : "/login"}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            pathname.startsWith("/account") || pathname.startsWith("/login")
              ? "text-[#7DAACB]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <User size={22} className={pathname.startsWith("/account") ? "fill-[#7DAACB]/20" : ""} />
          <span className="text-[10px] font-semibold">{session ? "Tài khoản" : "Đăng nhập"}</span>
        </Link>
      </div>
    </div>
  );
}
