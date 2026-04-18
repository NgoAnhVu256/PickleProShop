"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/shop/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, MapPin, Phone, FileText, CheckCircle, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import Header from "@/components/shop/Header";
import dynamic from "next/dynamic";

const MapSelector = dynamic(() => import("@/components/shop/MapSelector"), { 
  ssr: false,
  loading: () => <div className="h-[250px] bg-gray-50 animate-pulse rounded-2xl border border-gray-200"></div>
});

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [finalTotal, setFinalTotal] = useState(0);

  // New states for Coupon and QR Confirmation
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discountAmount: number} | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const [vietnamData, setVietnamData] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch Vietnam Provinces Array
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then(res => res.json())
      .then(data => setVietnamData(data))
      .catch(console.error);

    // 2. Fetch Latest Address/Phone from Order History
    if (session?.user) {
      fetch("/api/orders")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.length > 0) {
            const latest = data.data[0];
            setPhone(prev => prev ? prev : (latest.phone || ""));
            setProvince(prev => prev ? prev : (latest.province || ""));
            setDistrict(prev => prev ? prev : (latest.district || ""));
            setWard(prev => prev ? prev : (latest.ward || ""));
            setAddress(prev => prev ? prev : (latest.address || ""));
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const getMatchedProvince = (provName: string) => {
    if (!provName) return null;
    return vietnamData.find(p => p.name === provName || p.name.includes(provName) || provName.includes(p.name));
  };

  const getMatchedDistrict = (provObj: any, distName: string) => {
    if (!provObj || !distName) return null;
    return provObj.districts.find((d: any) => d.name === distName || d.name.includes(distName) || distName.includes(d.name));
  };

  const handleLocationSelect = (data: any) => {
    setAddress(data.addressComponent);
    setProvince(data.province);
    setDistrict(data.district);
    setWard(data.ward);
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#fcfcfc]">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h1>
          <p className="text-gray-500 mb-6">Bạn cần đăng nhập để tiếp tục đặt hàng.</p>
          <Link href="/login?callbackUrl=/checkout" className="inline-block bg-[#a757ff] text-white px-8 py-3 rounded-xl font-bold">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-[#fcfcfc]">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h1>
          <p className="text-gray-500 mb-6">Hãy thêm sản phẩm trước khi đặt hàng.</p>
          <Link href="/products" className="inline-block bg-[#a757ff] text-white px-8 py-3 rounded-xl font-bold">
            Mua sắm
          </Link>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    if (paymentMethod === 'BANK' && !paymentConfirmed) {
      return (
        <div className="min-h-screen bg-[#fcfcfc]">
          <Header />
          <div className="max-w-lg mx-auto px-4 py-20 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang chờ thanh toán</h1>
            <p className="text-gray-500 mb-2">Mã đơn hàng: <span className="font-mono font-bold text-gray-900">{orderSuccess.slice(-8).toUpperCase()}</span></p>
            <p className="text-gray-400 text-sm mb-8">Vui lòng hoàn tất thanh toán để chúng tôi xử lý đơn hàng.</p>

            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.1)] border-2 border-blue-100 mb-8 max-w-sm mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <h3 className="font-black text-blue-600 mb-2 text-lg">Mã QR Thanh Toán</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Mở ứng dụng ngân hàng bất kỳ để quét mã. Số tiền và nội dung sẽ được điền tự động.</p>
              
              <div className="bg-[#f8fafc] p-4 rounded-2xl mb-5 shadow-inner">
                <img 
                  src={`https://img.vietqr.io/image/MB-2506200466666-compact2.png?amount=${finalTotal}&addInfo=${orderSuccess.slice(-8).toUpperCase()}&accountName=PICKLEPRO`} 
                  alt="VietQR Payment" 
                  className="w-full h-auto rounded-xl drop-shadow-md"
                />
              </div>
              
              <div className="text-left bg-blue-50/50 p-4 rounded-xl border border-blue-50/80">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Cửa hàng PicklePro</p>
                <p className="text-sm text-gray-900 font-black">Ngân hàng MBBank</p>
                <p className="text-xl font-black text-blue-600 tracking-wider">2506200466666</p>
                <p className="text-xs text-blue-800 font-bold mt-2">Tổng tiền: {finalTotal.toLocaleString()}₫</p>
              </div>
            </div>

            <button
              onClick={async () => {
                setIsConfirmingPayment(true);
                try {
                  await fetch(`/api/orders/${orderSuccess}/confirm`, { method: "POST" });
                  // Simulate realistic bank checking delay
                  setTimeout(() => {
                    setPaymentConfirmed(true);
                    setIsConfirmingPayment(false);
                    toast.success("Đã gửi xác nhận thanh toán!");
                  }, 2000);
                } catch {
                  setIsConfirmingPayment(false);
                }
              }}
              disabled={isConfirmingPayment}
              className="w-full max-w-sm mx-auto py-4 bg-gradient-to-r from-[#eab308] to-[#ca8a04] text-white rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(202,138,4,0.3)] hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isConfirmingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : "TÔI ĐÃ CHUYỂN KHOẢN"}
            </button>
            <p className="text-xs text-gray-400 mt-4">Sau khi bạn bấm, chúng tôi sẽ kiểm tra sao kê ngay lập tức.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#fcfcfc]">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {paymentMethod === 'BANK' ? "Đã gửi yêu cầu xác nhận!" : "Đặt hàng thành công! 🎉"}
          </h1>
          <p className="text-gray-500 mb-2">Mã đơn hàng: <span className="font-mono font-bold text-gray-900">{orderSuccess.slice(-8).toUpperCase()}</span></p>
          <p className="text-gray-400 text-sm mb-8">
            {paymentMethod === 'BANK' 
              ? "Cảm ơn bạn! Chúng tôi đang kiểm tra sao kê ngân hàng và sẽ xử lý đơn hàng."
              : "Chúng tôi sẽ xử lý đơn hàng của bạn ngay lập tức."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="bg-[#a757ff] text-white px-8 py-3 rounded-xl font-bold">
              Tiếp tục mua sắm
            </Link>
            <Link href="/" className="border border-gray-200 px-8 py-3 rounded-xl font-bold text-gray-700">
              Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsCheckingCoupon(true);
    try {
      const res = await fetch("/api/coupons/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderValue: totalPrice })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon({ code: data.data.code, discountAmount: data.data.discountAmount });
        toast.success(`Áp dụng mã thành công! Giảm ${data.data.discountAmount.toLocaleString()}₫`);
      } else {
        setAppliedCoupon(null);
        toast.error(data.error);
      }
    } catch {
      toast.error("Lỗi khi kiểm tra mã ưu đãi");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
  };

  const finalOrderTotal = totalPrice - (appliedCoupon?.discountAmount || 0);

  const handleSubmitOrder = async () => {
    if (!phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!address.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
          phone,
          address,
          province,
          district,
          ward,
          note,
          paymentMethod,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFinalTotal(finalOrderTotal);
        setOrderSuccess(data.data.id);
        clearCart();
        toast.success("Đặt hàng thành công!");
      } else {
        toast.error(data.error || "Lỗi đặt hàng");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#a757ff] mb-8">
          <ArrowLeft size={16} /> Tiếp tục mua sắm
        </Link>

        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-10">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-[#a757ff]" />
                Thông tin giao hàng
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Họ và tên</label>
                  <input
                    type="text"
                    value={session.user.name || ""}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Số điện thoại *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#a757ff] focus:ring-2 focus:ring-[#a757ff]/10 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Địa chỉ giao hàng *</label>
                  
                  <div className="mb-4">
                    <MapSelector onLocationSelect={handleLocationSelect} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <select
                      value={province}
                      onChange={(e) => {
                        setProvince(e.target.value);
                        setDistrict("");
                        setWard("");
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#a757ff] focus:ring-2 focus:ring-[#a757ff]/10 outline-none transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                      {vietnamData.map((p: any) => (
                        <option key={p.code} value={p.name}>{p.name}</option>
                      ))}
                    </select>

                    <select
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        setWard("");
                      }}
                      disabled={!province || !getMatchedProvince(province)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#a757ff] focus:ring-2 focus:ring-[#a757ff]/10 outline-none transition-all appearance-none disabled:bg-gray-50 cursor-pointer"
                      required
                    >
                      <option value="" disabled>Chọn Quận/Huyện</option>
                      {getMatchedProvince(province)?.districts?.map((d: any) => (
                        <option key={d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>

                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      disabled={!district || !getMatchedDistrict(getMatchedProvince(province), district)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#a757ff] focus:ring-2 focus:ring-[#a757ff]/10 outline-none transition-all appearance-none disabled:bg-gray-50 cursor-pointer"
                      required
                    >
                      <option value="" disabled>Chọn Phường/Xã</option>
                      {getMatchedDistrict(getMatchedProvince(province), district)?.wards?.map((w: any) => (
                        <option key={w.code} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-3.5 text-gray-300" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, tên đường chi tiết..."
                      rows={2}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#a757ff] focus:ring-2 focus:ring-[#a757ff]/10 outline-none transition-all resize-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Ghi chú (tùy chọn)</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-4 top-3.5 text-gray-300" />
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú cho đơn hàng..."
                      rows={2}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#a757ff] focus:ring-2 focus:ring-[#a757ff]/10 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#a757ff] bg-[#a757ff]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[#a757ff] border-gray-300 focus:ring-[#a757ff]"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                      <span className="block text-xs text-gray-500 mt-1">Khách hàng thanh toán tiền mặt cho nhân viên giao hàng khi nhận được sản phẩm.</span>
                    </div>
                  </div>
                </label>

                <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'BANK' ? 'border-[#a757ff] bg-[#a757ff]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="BANK" 
                      checked={paymentMethod === 'BANK'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[#a757ff] border-gray-300 focus:ring-[#a757ff]"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-bold text-gray-900">Chuyển khoản VietQR Tự Động</span>
                      <span className="block text-xs text-gray-500 mt-1">Xuất hiện mã QR sau khi đặt. Quét bằng app ngân hàng tự động điền số tiền và nội dung.</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Đơn hàng ({items.length} sản phẩm)</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
                {items.map(item => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <img src={item.image || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.productName}</p>
                      <p className="text-[11px] text-gray-400">{item.variantLabel} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">{(item.price * item.quantity).toLocaleString()}₫</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 mb-4 border-t border-gray-100 pt-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Mã Khuyến Mãi</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon || isCheckingCoupon}
                    placeholder="Nhập mã..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#a757ff] focus:ring-1 focus:ring-[#a757ff] disabled:bg-gray-50 disabled:text-gray-400 uppercase outline-none"
                  />
                  {appliedCoupon ? (
                    <button onClick={handleRemoveCoupon} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                      Xóa
                    </button>
                  ) : (
                    <button 
                      onClick={handleApplyCoupon} 
                      disabled={isCheckingCoupon || !couponCode.trim()} 
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50 transition-colors flex items-center justify-center min-w-[80px]"
                    >
                      {isCheckingCoupon ? <Loader2 className="w-4 h-4 animate-spin"/> : "Áp dụng"}
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-semibold">{totalPrice.toLocaleString()}₫</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Mã ưu đãi ({appliedCoupon.code})</span>
                    <span>-{appliedCoupon.discountAmount.toLocaleString()}₫</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-black pt-3 border-t border-gray-100">
                  <span>Tổng cộng</span>
                  <span className="text-[#a757ff]">{finalOrderTotal.toLocaleString()}₫</span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full mt-6 py-4 bg-gradient-to-r from-[#4f46e5] to-[#a757ff] text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "XÁC NHẬN ĐẶT HÀNG"
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-4 font-medium uppercase tracking-widest">
                Thông tin được bảo mật
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
