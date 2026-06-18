"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/shop/Header";
import ClientFooter from "@/components/shop/ClientFooter";

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

interface ProductListingClientProps {
  initialProducts: Product[];
  initialTotal: number;
  initialTotalPages: number;
  brands: BrandItem[];
  categories: CategoryItem[];
  searchParams: {
    search?: string;
    sort?: string;
    brand?: string;
    category?: string;
    price?: string;
    page?: string;
  };
}

export default function ProductListingClient({
  initialProducts,
  initialTotal,
  initialTotalPages,
  brands,
  categories,
  searchParams,
}: ProductListingClientProps) {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.search || "");
  const [sortBy, setSortBy] = useState(searchParams.sort || "newest");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.brand || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || "");
  const [priceRange, setPriceRange] = useState(searchParams.price || "");
  const [page, setPage] = useState(searchParams.page ? parseInt(searchParams.page) : 1);

  const isFirstRender = useRef(true);

  // Debounce search term
  useEffect(() => {
    if (isFirstRender.current) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sync state to URL params
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedBrand) params.set("brand", selectedBrand);
    if (selectedCategory) params.set("category", selectedCategory);
    if (priceRange) params.set("price", priceRange);
    if (sortBy !== "newest") params.set("sort", sortBy);

    const query = params.toString();
    router.replace(query ? `/products?${query}` : "/products", { scroll: false });
  }, [page, debouncedSearch, selectedBrand, selectedCategory, priceRange, sortBy, router]);

  // Fetch filtered products on change (excluding first render)
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
    } catch (err) {
      console.error("Error fetching products client side", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortBy, selectedBrand, selectedCategory, priceRange]);

  useEffect(() => {
    // Avoid fetching duplicate on first mount
    const skipFetch = isFirstRender.current && 
                      products.length === initialProducts.length && 
                      products[0]?.id === initialProducts[0]?.id;
    if (!skipFetch) {
      fetchProducts();
    }
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
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        {/* Title */}
        <div className="pt-6 md:pt-10 pb-6 md:pb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Tất cả sản phẩm</h1>
          <p className="text-gray-500 mt-1.5 md:mt-2 text-xs md:text-sm font-medium">
            Khám phá bộ sưu tập Pickleball chuyên nghiệp
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="sticky top-[120px] md:top-20 z-20 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-sm mb-6 md:mb-8 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 md:gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all border border-transparent focus:border-primary/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-gray-700 border border-transparent focus:border-primary/30 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá ↑</option>
              <option value="price_desc">Giá ↓</option>
              <option value="name_asc">A-Z</option>
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-gray-700 border border-transparent focus:border-primary/30 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="">Danh mục</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>

            {/* Brand filter */}
            <select
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}
              className="px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-gray-700 border border-transparent focus:border-primary/30 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="">Thương hiệu</option>
              {brands.map(b => (
                <option key={b.id} value={b.slug}>{b.name}</option>
              ))}
            </select>

            {/* Price Range filter */}
            <select
              value={priceRange}
              onChange={(e) => { setPriceRange(e.target.value); setPage(1); }}
              className="px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-gray-700 border border-transparent focus:border-primary/30 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="">Mức giá</option>
              <option value="0-500000">Dưới 500k</option>
              <option value="500000-1000000">500k - 1tr</option>
              <option value="1000000-2000000">1tr - 2tr</option>
              <option value="2000000-5000000">2tr - 5tr</option>
              <option value="5000000-">Trên 5tr</option>
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 md:px-4 py-2.5 md:py-3 bg-red-50 text-red-500 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:bg-red-100 transition-colors shrink-0">
                <X size={14} /> Xóa
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
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
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
              className="mt-8 text-sm font-bold text-primary underline underline-offset-4"
            >
              Thiết lập lại tất cả
            </button>
          </div>
        )}
      </div>

      <ClientFooter />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const price = product.salePrice || product.basePrice || 0;
  const originalPrice = product.basePrice || 0;
  const hasSale = !!product.salePrice && product.salePrice < originalPrice;
  const discount = hasSale ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Link 
      href={`/products/${product.slug}`} 
      className="bg-white rounded-2xl border border-gray-100 p-2 md:p-3 group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col gap-2 md:gap-3"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-50">
        <Image
          src={product.thumbnail || 'https://placehold.co/400x500/f8fafc/94a3b8?text=Product'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {hasSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase z-10">
            -{discount}%
          </div>
        )}
        {product.brand && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-600 z-10">
            {product.brand.name}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-[13px] md:text-sm font-bold text-gray-900 mb-0.5 line-clamp-2 min-h-[2.5em] group-hover:text-primary transition-colors leading-snug">
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
