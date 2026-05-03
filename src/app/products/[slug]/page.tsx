"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Minus, Plus, Package, Truck, Shield, Loader2 } from "lucide-react";
import Header from "@/components/shop/Header";
import { useCart } from "@/components/shop/CartContext";
import toast from "react-hot-toast";

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  images: string[];
  basePrice: number;
  salePrice: number | null;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string; logo: string | null } | null;
  variants: {
    id: string;
    sku: string;
    price: number;
    stock: number;
    images: string[];
    attrValues: { value: string; attribute: { name: string; label: string } }[];
  }[];
  gallery: { id: string; url: string; alt: string | null }[];
  relatedProducts: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    basePrice: number;
    salePrice: number | null;
  }[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>("");
  const [settings, setSettings] = useState<any>(null);

  // Load settings
  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { if (d.success) setSettings(d.data); })
      .catch(() => {});
  }, []);

  // Load product
  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setProduct(data.data);
          setMainImage(data.data.thumbnail || data.data.images?.[0] || "");
          if (data.data.variants.length > 0) {
            setSelectedVariant(data.data.variants[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc]">
        <Header settings={settings} />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 text-[#a757ff] animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fcfcfc]">
        <Header settings={settings} />
        <div className="flex flex-col items-center justify-center py-40">
          <h1 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
          <Link href="/products" className="text-[#a757ff] font-bold">← Quay lại cửa hàng</Link>
        </div>
      </div>
    );
  }

  const variant = product.variants.find(v => v.id === selectedVariant);
  const displayPrice = variant?.price || product.salePrice || product.basePrice;
  const allImages = [
    product.thumbnail,
    ...product.images,
    ...product.gallery.map(g => g.url),
    ...(variant?.images || []),
  ].filter(Boolean) as string[];

  const handleAddToCart = () => {
    if (product.variants.length > 0 && !variant) {
      toast.error("Vui lòng chọn phân loại sản phẩm");
      return;
    }

    if (variant) {
      // Product WITH variants
      if (variant.stock < quantity) {
        toast.error("Số lượng vượt quá tồn kho");
        return;
      }

      const variantLabel = variant.attrValues.map(a => `${a.attribute.label}: ${a.value}`).join(", ") || variant.sku;

      addToCart({
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantSku: variant.sku,
        variantLabel,
        price: variant.price,
        quantity,
        image: variant.images?.[0] || product.thumbnail || "",
      });
    } else {
      // Product WITHOUT variants — use base/sale price
      addToCart({
        variantId: product.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantSku: "",
        variantLabel: "Mặc định",
        price: product.salePrice || product.basePrice,
        quantity,
        image: product.thumbnail || "",
      });
    }

    toast.success("Đã thêm vào giỏ hàng! 🛒");
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header settings={settings} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-8 flex-wrap">
          <Link href="/" className="hover:text-[#a757ff]">Trang chủ</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-[#a757ff]">Sản phẩm</Link>
          <ChevronRight size={12} />
          <Link href={`/category/${product.category.slug}`} className="hover:text-[#a757ff]">{product.category.name}</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100">
              <img src={mainImage || 'https://placehold.co/600x600/f8fafc/94a3b8?text=Product'} alt={product.name} className="w-full h-full object-contain p-4" />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      mainImage === img ? "border-[#a757ff] shadow-lg" : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.brand && (
              <span className="text-xs font-black text-[#a757ff] uppercase tracking-widest">{product.brand.name}</span>
            )}
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">{displayPrice.toLocaleString()}₫</span>
              {product.salePrice && product.salePrice < product.basePrice && (
                <span className="text-lg text-gray-400 line-through">{product.basePrice.toLocaleString()}₫</span>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700">Phân loại:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => {
                    const label = v.attrValues.map(a => a.value).join(" / ") || v.sku;
                    const isSelected = v.id === selectedVariant;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v.id);
                          if (v.images?.length > 0) setMainImage(v.images[0]);
                        }}
                        disabled={v.stock === 0}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          isSelected
                            ? "border-[#a757ff] bg-[#a757ff]/5 text-[#a757ff]"
                            : v.stock === 0
                              ? "border-gray-100 text-gray-300 cursor-not-allowed"
                              : "border-gray-200 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {label}
                        {v.stock === 0 && <span className="ml-1 text-[10px]">(Hết hàng)</span>}
                      </button>
                    );
                  })}
                </div>
                {variant && (
                  <p className="text-xs text-gray-400 font-medium">
                    SKU: {variant.sku} • Tồn kho: {variant.stock}
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <p className="text-sm font-bold text-gray-700">Số lượng:</p>
              <div className="flex items-center gap-0 bg-gray-50 rounded-xl border border-gray-200">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-gradient-to-r from-[#4f46e5] to-[#a757ff] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#a757ff]/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                THÊM VÀO GIỎ HÀNG
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { icon: Package, label: "Chính hãng 100%" },
                { icon: Truck, label: "Giao hàng nhanh" },
                { icon: Shield, label: "Bảo hành tốt nhất" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl text-center">
                  <Icon size={18} className="text-[#a757ff]" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-16 max-w-4xl">
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
                const price = p.salePrice || p.basePrice;
                const hasSale = !!p.salePrice && p.salePrice < p.basePrice;
                return (
                  <Link key={p.id} href={`/products/${p.slug}`} className="bg-white rounded-2xl border border-gray-100 p-2 md:p-3 group hover:shadow-xl transition-all duration-300">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gray-50 relative mb-2">
                      <img src={p.thumbnail || 'https://placehold.co/400x500/f8fafc/94a3b8?text=SP'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {hasSale && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md">Sale</div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#a757ff]">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black">{price.toLocaleString()}₫</span>
                      {hasSale && <span className="text-xs text-gray-400 line-through">{p.basePrice.toLocaleString()}₫</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
