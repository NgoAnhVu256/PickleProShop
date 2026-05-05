"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Search, ChevronDown, Filter, X, ShoppingCart, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/components/shop/CartContext";
import Header from "@/components/shop/Header";

interface Product {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  basePrice: number;
  salePrice: number | null;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string };
  variants: any[];
}

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export default function ProductListingPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /></div>}>
      <ProductListingContent />
    </Suspense>
  );
}

function ProductListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("price") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [settings, setSettings] = useState<any>(null);

  // Load settings
  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { if (d.success) setSettings(d.data); })
      .catch(() => {});
  }, []);

  // Load brands and categories
  useEffect(() => {
    Promise.all([
      fetch("/api/brands").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([brandsData, catsData]) => {
      if (brandsData.success) setBrands(brandsData.data);
      if (catsData.success) setCategories(catsData.data);
    }).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12", sort: sortBy });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedBrand) params.set("brand", selectedBrand);
      if (selectedCategory) params.set("category", selectedCategory);
      if (priceRange) {
        const [min, max] = priceRange.split("-");
        if (min) params.set("minPrice", min);
        if (max) params.set("maxPrice", max);
      }

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortBy, selectedBrand, selectedCategory, priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBrand("");
    setSelectedCategory("");
    setPriceRange("");
    setSortBy("newest");
    setPage(1);
  };

  const hasFilters = debouncedSearch || selectedBrand || selectedCategory || priceRange || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header settings={settings} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        {/* Title */}
        <div className="pt-10 pb-8">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Tất cả sản phẩm</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Khám phá bộ sưu tập Pickleball chuyên nghiệp ({total} sản phẩm)
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="sticky top-20 z-20 bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-4 shadow-sm mb-8 flex flex-col lg:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#a757ff]/20 focus:bg-white transition-all border border-transparent focus:border-[#a757ff]/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-transparent focus:border-[#a757ff]/30 focus:outline-none cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="name_asc">Tên A-Z</option>
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-transparent focus:border-[#a757ff]/30 focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>

            {/* Brand filter */}
            <select
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-transparent focus:border-[#a757ff]/30 focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map(b => (
                <option key={b.id} value={b.slug}>{b.name}</option>
              ))}
            </select>

            {/* Price Range filter */}
            <select
              value={priceRange}
              onChange={(e) => { setPriceRange(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-transparent focus:border-[#a757ff]/30 focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả mức giá</option>
              <option value="0-500000">Dưới 500.000₫</option>
              <option value="500000-1000000">500.000₫ - 1.000.000₫</option>
              <option value="1000000-2000000">1.000.000₫ - 2.000.000₫</option>
              <option value="2000000-5000000">2.000.000₫ - 5.000.000₫</option>
              <option value="5000000-">Trên 5.000.000₫</option>
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-4 py-3 bg-red-50 text-red-500 rounded-2xl text-sm font-bold hover:bg-red-100 transition-colors">
                <X size={14} /> Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col gap-3">
                <div className="aspect-[4/5] bg-gray-100 rounded-xl animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-1"></div>
                <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse mt-1 mb-2"></div>
                <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse mt-auto"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-default transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p;
                  if (totalPages <= 5) p = i + 1;
                  else if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? "bg-[#a757ff] text-white shadow-lg shadow-[#a757ff]/30"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-default transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-white border border-dashed border-gray-200 rounded-[32px]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Search className="text-gray-300" size={32} />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-500 text-sm font-medium">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.</p>
            <button
              onClick={clearFilters}
              className="mt-8 text-sm font-bold text-[#a757ff] underline underline-offset-4"
            >
              Thiết lập lại tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const price = product.salePrice || product.basePrice || 0;
  const originalPrice = product.basePrice || 0;
  const hasSale = !!product.salePrice && product.salePrice < originalPrice;
  const discount = hasSale ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Link href={`/products/${product.slug}`} className="bg-white rounded-2xl border border-gray-100 p-2 md:p-3 group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col gap-2 md:gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-50">
        <img
          src={product.thumbnail || 'https://placehold.co/400x500/f8fafc/94a3b8?text=Product'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hasSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">
            -{discount}%
          </div>
        )}
        {product.brand && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-600">
            {product.brand.name}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-[13px] md:text-sm font-bold text-gray-900 mb-0.5 line-clamp-2 min-h-[2.5em] group-hover:text-[#a757ff] transition-colors leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base font-black text-gray-900">{price.toLocaleString()}₫</span>
          {hasSale && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through font-medium">{originalPrice.toLocaleString()}₫</span>
          )}
        </div>
      </div>
    </Link>
  );
}
