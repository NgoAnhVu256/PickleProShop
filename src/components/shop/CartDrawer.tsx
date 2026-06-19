"use client";

import { useCart } from "./CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, Gift, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const {
    items, removeFromCart, updateQuantity, clearCart, totalItems,
    isCartOpen, setIsCartOpen,
    // Promotion-aware
    giftItems, appliedPromotions, subTotal, discountTotal, finalTotal, isCalculating,
  } = useCart();
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
            <span className="bg-[#FF6220] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Đóng giỏ hàng">
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
                prefetch={false}
                onClick={() => setIsCartOpen(false)}
                className="mt-6 text-sm font-bold text-[#2C2877] underline underline-offset-4"
              >
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            <>
              {/* Regular Cart Items */}
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0">
                    <img src={item.image || 'https://placehold.co/80x80/f8fafc/94a3b8?text=SP'} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.productSlug}`} prefetch={false} onClick={() => setIsCartOpen(false)} className="text-sm font-bold text-gray-900 line-clamp-1 hover:text-[#2C2877]">
                      {item.productName}
                    </Link>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.variantLabel}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200">
                        <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900" aria-label="Giảm số lượng">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900" aria-label="Tăng số lượng">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-black text-gray-900">{(item.price * item.quantity).toLocaleString()}₫</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.variantId)} className="self-start p-1.5 text-gray-300 hover:text-red-500 transition-colors" aria-label="Xóa sản phẩm">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* ─── Gift Items (Auto-injected by Promotion Engine) ─── */}
              {giftItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-[#ec4899] font-black text-xs uppercase tracking-wider">
                    <Gift size={14} />
                    <span>Quà tặng kèm</span>
                    <Sparkles size={12} className="text-yellow-400" />
                  </div>
                  {giftItems.map((gift) => (
                    <div key={`gift-${gift.variantId}-${gift.promotionId}`} className="flex gap-3 p-3 bg-gradient-to-r from-pink-50/80 to-purple-50/60 rounded-2xl border border-pink-100/80 relative overflow-hidden">
                      {/* Gift badge */}
                      <div className="absolute top-0 right-0 bg-gradient-to-bl from-red-500 to-pink-500 text-white text-[8px] font-black px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        {gift.finalPrice === 0 ? "Miễn phí" : `${gift.finalPrice.toLocaleString()}₫`}
                      </div>
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-pink-100">
                        <img src={gift.image || 'https://placehold.co/64x64/fdf2f8/ec4899?text=🎁'} alt={gift.productName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{gift.productName}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{gift.variantLabel}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-full">🎁 x{gift.quantity}</span>
                          {gift.discountAmount > 0 && (
                            <span className="text-[10px] font-medium text-gray-400 line-through">{gift.price.toLocaleString()}₫</span>
                          )}
                        </div>
                        <p className="text-[9px] text-pink-400 font-semibold mt-1 truncate">{gift.promotionName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-3">
            {/* Promotion banner */}
            {appliedPromotions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl px-3 py-2 flex items-center gap-2">
                <Sparkles size={14} className="text-green-600 shrink-0" />
                <p className="text-[11px] font-bold text-green-700 line-clamp-1">
                  {appliedPromotions.length === 1
                    ? appliedPromotions[0].name
                    : `${appliedPromotions.length} chương trình KM đang áp dụng`
                  }
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Tạm tính</span>
                <span className="text-sm font-bold text-gray-600">{subTotal.toLocaleString()}₫</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-600">Quà tặng KM</span>
                  <span className="text-sm font-bold text-green-600">-{discountTotal.toLocaleString()}₫</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-700">Tổng cộng</span>
                <div className="flex items-center gap-2">
                  {isCalculating && <Loader2 size={14} className="text-gray-300 animate-spin" />}
                  <span className="text-xl font-black text-gray-900">{finalTotal.toLocaleString()}₫</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isOrdering}
              className="w-full py-4 bg-gradient-to-r from-[#FF6220] to-[#e04f10] text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
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
