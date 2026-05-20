"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ShoppingCart, Minus, Plus, Package, Truck, Shield, Check } from "lucide-react";
import Header from "@/components/shop/Header";
import ClientFooter from "@/components/shop/ClientFooter";
import { useCart } from "@/components/shop/CartContext";
import toast from "react-hot-toast";

interface ProductDetail {
  id: string; name: string; slug: string; description: string | null;
  thumbnail: string | null; images: string[]; basePrice: number; salePrice: number | null;
  saleStartAt?: string | null; saleEndAt?: string | null; stock?: number;
  category: { id: string; name: string; slug: string; promotionConditions?: any[] };
  brand: { id: string; name: string; slug: string; logo: string | null } | null;
  variants: {
    id: string; sku: string; price: number; stock: number; images: string[];
    attrValues: { value: string; attribute: { name: string; label: string } }[];
    promotionConditions?: any[];
  }[];
  gallery: { id: string; url: string; alt: string | null }[];
  relatedProducts: { id: string; name: string; slug: string; thumbnail: string | null; basePrice: number; salePrice: number | null }[];
}

export default function ProductClient({ product }: { product: ProductDetail }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>(product.thumbnail || product.images?.[0] || "");
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  const { colorOptions, sizeOptions, colorImageMap } = useMemo(() => {
    if (!product || product.variants.length === 0) return { colorOptions: [] as string[], sizeOptions: [] as string[], colorImageMap: {} as Record<string, string> };
    const colors = new Set<string>(); const sizes = new Set<string>(); const imgMap: Record<string, string> = {};
    product.variants.forEach(v => {
      v.attrValues.forEach(av => {
        const n = av.attribute.name.toLowerCase();
        if (n === "color" || n.includes("color") || n.includes("mau")) {
          colors.add(av.value);
          if (!imgMap[av.value] && v.images?.length > 0) imgMap[av.value] = v.images[0];
        }
        if (n === "size" || n === "kich_thuoc" || n === "thickness") sizes.add(av.value);
      });
    });
    return { colorOptions: Array.from(colors), sizeOptions: Array.from(sizes), colorImageMap: imgMap };
  }, [product]);

  useEffect(() => {
    if (colorOptions.length > 0 && !selectedColor) {
      setSelectedColor(colorOptions[0]);
      if (colorImageMap[colorOptions[0]]) setMainImage(colorImageMap[colorOptions[0]]);
    }
    if (sizeOptions.length > 0 && !selectedSize) setSelectedSize(sizeOptions[0]);
  }, [colorOptions, sizeOptions, colorImageMap, selectedColor, selectedSize]);

  const matchedVariant = useMemo(() => {
    if (!product) return null;
    if (colorOptions.length === 0 && sizeOptions.length === 0) return product.variants.length > 0 ? product.variants[0] : null;
    return product.variants.find(v => {
      let cM = true, sM = true;
      v.attrValues.forEach(av => {
        const n = av.attribute.name.toLowerCase();
        if (n === "color" || n.includes("color") || n.includes("mau")) cM = av.value === selectedColor;
        if (n === "size" || n === "kich_thuoc" || n === "thickness") sM = av.value === selectedSize;
      });
      return cM && sM;
    }) || null;
  }, [product, selectedColor, selectedSize, colorOptions, sizeOptions]);

  const handleColorSelect = (color: string) => { setSelectedColor(color); if (colorImageMap[color]) setMainImage(colorImageMap[color]); };

  const allImages = useMemo(() => {
    if (!product) return [];
    const seen = new Set<string>(); const imgs: string[] = [];
    const add = (url: string | null | undefined) => { if (url && !seen.has(url)) { seen.add(url); imgs.push(url); } };
    add(product.thumbnail);
    product.variants.forEach(v => v.images?.forEach(add));
    product.gallery.forEach(g => add(g.url));
    return imgs;
  }, [product]);

  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem("recently_viewed");
      let recent = stored ? JSON.parse(stored) : [];
      const others = recent.filter((p: any) => p.id !== product.id);
      setRecentProducts(others.slice(0, 5));
      const currentLite = { id: product.id, name: product.name, slug: product.slug, thumbnail: product.thumbnail, basePrice: product.basePrice, salePrice: product.salePrice };
      localStorage.setItem("recently_viewed", JSON.stringify([currentLite, ...others].slice(0, 10)));
    } catch {}
  }, [product]);

  const hasOptionMatrix = colorOptions.length > 0 || sizeOptions.length > 0;
  const now = new Date();
  const isSaleActive = product.salePrice != null && product.salePrice < product.basePrice
    && (!product.saleStartAt || new Date(product.saleStartAt) <= now)
    && (!product.saleEndAt || new Date(product.saleEndAt) >= now);

  const getEffectivePrice = (variant: any) => isSaleActive && product.salePrice != null ? product.salePrice : variant.price;
  const displayPrice = matchedVariant ? getEffectivePrice(matchedVariant) : (isSaleActive ? product.salePrice! : product.basePrice);
  const originalPrice = matchedVariant?.price || product.basePrice;
  const isDiscounted = displayPrice < originalPrice;
  const hasAnyVariants = product.variants.length > 0;
  const totalStock = hasAnyVariants ? product.variants.reduce((s, v) => s + (v.stock || 0), 0) : (product.stock ?? 0);
  const isOutOfStock = totalStock === 0;
  const currentVariantOutOfStock = matchedVariant ? matchedVariant.stock === 0 : (hasAnyVariants ? isOutOfStock : (product.stock ?? 0) === 0);

  const handleAddToCart = () => {
    if (currentVariantOutOfStock) { toast.error("Sản phẩm này hiện đã hết hàng"); return; }
    if (hasOptionMatrix && !matchedVariant) { toast.error("Vui lòng chọn đầy đủ phân loại sản phẩm"); return; }
    if (matchedVariant) {
      if (matchedVariant.stock < quantity) { toast.error("Số lượng vượt quá tồn kho"); return; }
      addToCart({ variantId: matchedVariant.id, productId: product.id, productName: product.name, productSlug: product.slug, variantSku: matchedVariant.sku, variantLabel: matchedVariant.attrValues.map(a => `${a.attribute.label}: ${a.value}`).join(", ") || matchedVariant.sku, price: getEffectivePrice(matchedVariant), quantity, image: matchedVariant.images?.[0] || product.thumbnail || "" });
    } else {
      addToCart({ variantId: product.id, productId: product.id, productName: product.name, productSlug: product.slug, variantSku: "", variantLabel: "Mặc định", price: product.salePrice || product.basePrice, quantity, image: product.thumbnail || "" });
    }
    toast.success("Đã thêm vào giỏ hàng! 🛒");
  };

  const handleBuyNow = () => {
    if (currentVariantOutOfStock) { toast.error("Sản phẩm này hiện đã hết hàng"); return; }
    if (hasOptionMatrix && !matchedVariant) { toast.error("Vui lòng chọn đầy đủ phân loại sản phẩm"); return; }
    if (matchedVariant) {
      if (matchedVariant.stock < quantity) { toast.error("Số lượng vượt quá tồn kho"); return; }
      addToCart({ variantId: matchedVariant.id, productId: product.id, productName: product.name, productSlug: product.slug, variantSku: matchedVariant.sku, variantLabel: matchedVariant.attrValues.map(a => `${a.attribute.label}: ${a.value}`).join(", ") || matchedVariant.sku, price: getEffectivePrice(matchedVariant), quantity, image: matchedVariant.images?.[0] || product.thumbnail || "" });
    } else {
      addToCart({ variantId: product.id, productId: product.id, productName: product.name, productSlug: product.slug, variantSku: "", variantLabel: "Mặc định", price: product.salePrice || product.basePrice, quantity, image: product.thumbnail || "" });
    }
    router.push("/checkout");
  };

  const getVariantStock = (color: string, size: string) => {
    const v = product.variants.find(v => { let cM = !color, sM = !size; v.attrValues.forEach(av => { const n = av.attribute.name.toLowerCase(); if ((n === "color" || n.includes("color") || n.includes("mau")) && av.value === color) cM = true; if ((n === "size" || n === "kich_thuoc" || n.includes("size") || n.includes("kich")) && av.value === size) sM = true; }); return cM && sM; });
    return v?.stock ?? 0;
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-400 font-medium mb-4 md:mb-8 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#7DAACB]">Trang chủ</Link><ChevronRight size={12} />
          <Link href="/products" className="hover:text-[#7DAACB]">Sản phẩm</Link><ChevronRight size={12} />
          <Link href={`/category/${product.category.slug}`} className="hover:text-[#7DAACB]">{product.category.name}</Link><ChevronRight size={12} />
          <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </nav>

        <div className="flex flex-col xl:flex-row gap-8 lg:gap-12">
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Images */}
              <div className="space-y-4">
                <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100">
                  <img src={mainImage || 'https://placehold.co/600x600/f8fafc/94a3b8?text=Product'} alt={product.name} width={600} height={600} className="w-full h-full object-contain p-4" />
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {allImages.slice(0, 8).map((img, i) => (
                      <button key={i} onClick={() => setMainImage(img)} aria-label={`Xem ảnh ${i + 1} của ${product.name}`} className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${mainImage === img ? "border-[#7DAACB] shadow-lg" : "border-gray-100 hover:border-gray-300"}`}>
                        <img src={img} alt={`${product.name} - Ảnh ${i + 1}`} width={80} height={80} loading="lazy" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {product.brand && <span className="text-xs font-black text-[#7DAACB] uppercase tracking-widest">{product.brand.name}</span>}
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{product.brand?.name && !product.name.toLowerCase().startsWith(product.brand.name.toLowerCase()) ? `${product.brand.name} ${product.name}` : product.name}</h1>

                {/* Price */}
                <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                  <span className="text-2xl md:text-3xl font-black text-gray-900">{displayPrice.toLocaleString()}₫</span>
                  {isDiscounted && <span className="text-lg text-gray-400 line-through">{originalPrice.toLocaleString()}₫</span>}
                  {isDiscounted && <span className="text-sm font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">-{Math.round((1 - displayPrice / originalPrice) * 100)}%</span>}
                </div>

                {/* Color Selector */}
                {colorOptions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-700">Màu sắc: <span className="text-[#7DAACB]">{selectedColor}</span></p>
                    <div className="flex flex-wrap gap-3">
                      {colorOptions.map(color => {
                        const colorImg = colorImageMap[color]; const isSelected = color === selectedColor;
                        return (
                          <button key={color} onClick={() => handleColorSelect(color)} aria-label={`Chọn màu ${color}`} className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all min-w-[80px] ${isSelected ? "border-[#7DAACB] bg-[#FFFDEB] shadow-md" : "border-gray-200 bg-white hover:border-gray-400"}`}>
                            {colorImg && <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50"><img src={colorImg} alt={color} className="w-full h-full object-cover" /></div>}
                            <span className="text-xs font-semibold text-gray-700">{color}</span>
                            {isSelected && <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#7DAACB] rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {sizeOptions.length > 0 && (() => {
                  const sizeAttrLabel = product.variants[0]?.attrValues.find(av => { const n = av.attribute.name.toLowerCase(); return n === "thickness" || n.includes("size") || n.includes("kich"); })?.attribute.label || "Size";
                  return (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-gray-700">{sizeAttrLabel}: <span className="text-[#7DAACB]">{selectedSize}</span></p>
                      <div className="flex flex-wrap gap-2">
                        {sizeOptions.map(size => { const isSelected = size === selectedSize; const stock = selectedColor ? getVariantStock(selectedColor, size) : 1; const oos = stock === 0;
                          return (<button key={size} onClick={() => !oos && setSelectedSize(size)} disabled={oos} aria-label={`Chọn size ${size}${oos ? ' - Hết hàng' : ''}`} className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${isSelected ? "border-[#7DAACB] bg-[#7DAACB]/5 text-[#7DAACB]" : oos ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed line-through" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}>{size}</button>);
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Flat variant list */}
                {!hasOptionMatrix && product.variants.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-700">Phân loại:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map(v => { const label = v.attrValues.map(a => a.value).join(" / ") || v.sku; const isSelected = matchedVariant?.id === v.id;
                        return (<button key={v.id} onClick={() => { setSelectedColor(""); setSelectedSize(""); if (v.images?.length > 0) setMainImage(v.images[0]); }} disabled={v.stock === 0} aria-label={`Chọn phân loại ${label}${v.stock === 0 ? ' - Hết hàng' : ''}`} className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${isSelected ? "border-[#7DAACB] bg-[#7DAACB]/5 text-[#7DAACB]" : v.stock === 0 ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}>{label}{v.stock === 0 && <span className="ml-1 text-[10px]">(Hết hàng)</span>}</button>);
                      })}
                    </div>
                  </div>
                )}

                {/* Promotions */}
                {(() => {
                  const vPromos = matchedVariant?.promotionConditions || [];
                  const cPromos = product.category.promotionConditions || [];
                  const map = new Map(); [...vPromos, ...cPromos].forEach(pc => { if (pc.promotion && !map.has(pc.promotion.id)) map.set(pc.promotion.id, pc); });
                  const all = Array.from(map.values()); if (all.length === 0) return null;
                  return (
                    <div className="space-y-3 p-4 bg-[#7DAACB]/5 border border-[#7DAACB]/20 rounded-2xl mt-4">
                      <div className="flex items-center gap-2 text-[#5a93b5] font-black text-sm uppercase"><Package size={16} /> Quà Tặng Kèm</div>
                      {all.map(pc => (
                        <div key={pc.promotion.id} className="space-y-2">
                          <div className="text-xs font-bold text-[#5a93b5] bg-white px-2 py-1 rounded inline-block border border-[#7DAACB]/20">🎁 {pc.promotion.name}</div>
                          {pc.promotion.rewards.map((r: any) => {
                            const vn = r.productVariant.attrValues.map((a: any) => a.value).join(" / ");
                            const fn = vn ? `${r.productVariant.product.name} - ${vn}` : r.productVariant.product.name;
                            return (
                              <div key={r.id} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0"><img src={r.productVariant.product.thumbnail || 'https://placehold.co/100x100'} alt={fn} className="w-full h-full object-cover" /></div>
                                <div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-900 truncate">{fn}</p><p className="text-[10px] font-bold text-gray-400 mt-0.5">Số lượng: <span className="text-[#7DAACB]">x{r.quantity}</span></p></div>
                                <div className="text-right shrink-0">{r.promoPrice === 0 ? <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Tặng miễn phí</span> : <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">+{r.promoPrice.toLocaleString()}₫</span>}<p className="text-[10px] font-medium text-gray-400 line-through mt-1">{r.productVariant.price.toLocaleString()}₫</p></div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-gray-700">Số lượng:</p>
                  <div className={`flex items-center gap-0 bg-gray-50 rounded-xl border border-gray-200 ${currentVariantOutOfStock ? 'opacity-40 pointer-events-none' : ''}`}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Giảm số lượng" className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900"><Minus size={16} /></button>
                    <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} aria-label="Tăng số lượng" className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900"><Plus size={16} /></button>
                  </div>
                  {matchedVariant && matchedVariant.stock > 0 && <span className="text-xs text-gray-400 font-medium">Còn {matchedVariant.stock} sản phẩm</span>}
                  {!hasAnyVariants && !currentVariantOutOfStock && (product.stock ?? 0) > 0 && <span className="text-xs text-gray-400 font-medium">Còn {product.stock} sản phẩm</span>}
                </div>

                {/* Desktop Add to Cart / Buy Now (Hidden on Mobile, replaced by Sticky Bar) */}
                <div className="hidden md:flex gap-3 pt-2">
                  {currentVariantOutOfStock ? (
                    <div className="flex-1 py-4 bg-gray-200 text-gray-500 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed"><Package size={18} /> HẾT HÀNG</div>
                  ) : (
                    <>
                      <button onClick={handleAddToCart} aria-label="Thêm vào giỏ hàng" className="flex-1 py-4 border-2 border-[#7DAACB] text-[#7DAACB] bg-white rounded-2xl font-black text-sm hover:bg-[#7DAACB]/5 transition-all flex items-center justify-center gap-2">
                        <ShoppingCart size={18} /> THÊM VÀO GIỎ
                      </button>
                      <button onClick={handleBuyNow} aria-label="Mua ngay" className="flex-1 py-4 bg-gradient-to-r from-[#5a93b5] to-[#7DAACB] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#7DAACB]/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2">
                        MUA NGAY
                      </button>
                    </>
                  )}
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  {[{ icon: Package, label: "Chính hãng 100%" }, { icon: Truck, label: "Giao hàng nhanh" }, { icon: Shield, label: "Bảo hành tốt nhất" }].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl text-center">
                      <Icon size={18} className="text-[#7DAACB]" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 md:mt-16 max-w-4xl">
                <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Mô tả sản phẩm</h2>
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {/* Related Products */}
            {product.relatedProducts.length > 0 && (
              <section className="mt-20">
                <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Sản phẩm liên quan</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {product.relatedProducts.map(p => {
                    const price = p.salePrice || p.basePrice; const hasSale = !!p.salePrice && p.salePrice < p.basePrice;
                    return (
                      <Link key={p.id} href={`/products/${p.slug}`} className="bg-white rounded-2xl border border-gray-100 p-2 md:p-3 group hover:shadow-xl transition-all duration-300">
                        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gray-50 relative mb-2">
                          <img src={p.thumbnail || 'https://placehold.co/400x500/f8fafc/94a3b8?text=SP'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          {hasSale && <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md">Sale</div>}
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#7DAACB]">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-black text-gray-900">{price.toLocaleString()}₫</span>
                          {hasSale && <span className="text-xs text-gray-400 line-through">{p.basePrice.toLocaleString()}₫</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Recently Viewed — horizontal scroll on mobile, sidebar on desktop */}
          <aside className="w-full xl:w-[280px] shrink-0 space-y-6">
            {recentProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden xl:sticky xl:top-24">
                <div className="bg-gray-50 border-b border-gray-100 p-3 md:p-4"><h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-wider">Sản phẩm đã xem</h3></div>
                {/* Mobile: horizontal scroll */}
                <div className="flex xl:flex-col gap-3 p-3 md:p-4 overflow-x-auto xl:overflow-x-visible no-scrollbar">
                  {recentProducts.map(p => {
                    const price = p.salePrice || p.basePrice; const hasSale = !!p.salePrice && p.salePrice < p.basePrice;
                    return (
                      <Link key={p.id} href={`/products/${p.slug}`} className="flex xl:flex-row flex-col gap-2 xl:gap-3 group shrink-0 w-[120px] xl:w-auto">
                        <div className="w-full xl:w-20 h-24 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100"><img src={p.thumbnail || 'https://placehold.co/100x120'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" /></div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-[#7DAACB] mb-1 leading-snug">{p.name}</h4>
                          <span className="text-sm font-black text-[#1a6fa0]">{price.toLocaleString()}₫</span>
                          {hasSale && <span className="text-[10px] text-gray-400 line-through">{p.basePrice.toLocaleString()}₫</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-[60] pb-safe">
        <div className="flex gap-2">
          {currentVariantOutOfStock ? (
            <div className="flex-1 py-3 bg-gray-200 text-gray-500 rounded-xl font-black text-xs flex items-center justify-center gap-1 cursor-not-allowed"><Package size={16} /> HẾT HÀNG</div>
          ) : (
            <>
              <button onClick={handleAddToCart} className="w-14 shrink-0 h-12 flex items-center justify-center border-2 border-[#7DAACB] text-[#7DAACB] rounded-xl hover:bg-[#7DAACB]/5 transition-colors">
                <ShoppingCart size={20} />
              </button>
              <button onClick={handleBuyNow} className="flex-1 h-12 bg-gradient-to-r from-[#5a93b5] to-[#7DAACB] text-white rounded-xl font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center">
                MUA NGAY
              </button>
            </>
          )}
        </div>
      </div>

      <ClientFooter />
    </div>
  );
}
