"use client";

import { useCart } from "./CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const { data: session } = useSession();
  const [isOrdering, setIsOrdering] = useState(false);
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    if (!session?.user) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      router.push("/login?callbackUrl=/checkout");
      setIsCartOpen(false);
      return;
    }
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-[9990] transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[9991] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-gray-900" />
            <h2 className="text-lg font-black text-gray-900">Giỏ hàng</h2>
            <span className="bg-[#a757ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-500 font-semibold mb-1">Giỏ hàng trống</p>
              <p className="text-sm text-gray-400">Hãy thêm sản phẩm vào giỏ hàng</p>
              <Link
                href="/products"
                onClick={() => setIsCartOpen(false)}
                className="mt-6 text-sm font-bold text-[#a757ff] underline underline-offset-4"
              >
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="flex gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0">
                  <img src={item.image || 'https://placehold.co/80x80/f8fafc/94a3b8?text=SP'} alt={item.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productSlug}`} onClick={() => setIsCartOpen(false)} className="text-sm font-bold text-gray-900 line-clamp-1 hover:text-[#a757ff]">
                    {item.productName}
                  </Link>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.variantLabel}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200">
                      <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900">
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-sm font-black text-gray-900">{(item.price * item.quantity).toLocaleString()}₫</span>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.variantId)} className="self-start p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">Tạm tính</span>
              <span className="text-xl font-black text-gray-900">{totalPrice.toLocaleString()}₫</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isOrdering}
              className="w-full py-4 bg-gradient-to-r from-[#4f46e5] to-[#a757ff] text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isOrdering ? <Loader2 className="w-5 h-5 animate-spin" /> : "ĐẶT HÀNG NGAY"}
            </button>
            <button
              onClick={clearCart}
              className="w-full text-center text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>
    </>
  );
}
