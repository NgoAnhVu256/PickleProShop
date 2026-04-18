"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  basePrice: number;
  salePrice: number | null;
}

export default function CategoryProductFilter({ products, categoryName }: { products: Product[]; categoryName: string }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999999]);
  const [showFilters, setShowFilters] = useState(false);

  // Price range from products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 10000000;
    return Math.max(...products.map(p => p.salePrice || p.basePrice));
  }, [products]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const filtered = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    // Price range
    result = result.filter(p => {
      const price = p.salePrice || p.basePrice;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
        break;
      case "price_desc":
        result.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
        break;
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break; // newest = original DB order
    }

    return result;
  }, [products, search, sortBy, priceRange]);

  const hasFilters = search || sortBy !== "newest" || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <div>
      {/* Search + Filter Bar */}
      <div className="sticky top-20 z-20 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-sm mb-6 md:mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder={`Tìm trong ${categoryName}...`}
            className="w-full pl-10 md:pl-11 pr-4 py-2.5 md:py-3 bg-gray-50 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#a757ff]/20 focus:bg-white transition-all border border-transparent focus:border-[#a757ff]/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-gray-700 border border-transparent focus:border-[#a757ff]/30 focus:outline-none cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="name_asc">Tên A-Z</option>
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-colors ${showFilters ? "bg-[#a757ff] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
          >
            <SlidersHorizontal size={14} /> Lọc
          </button>

          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setSortBy("newest"); setPriceRange([0, maxPrice]); }}
              className="flex items-center gap-1 px-3 md:px-4 py-2.5 md:py-3 bg-red-50 text-red-500 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:bg-red-100 transition-colors"
            >
              <X size={14} /> Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Price filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 shadow-sm">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Khoảng giá</h4>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="number"
              placeholder="Từ"
              value={priceRange[0] || ""}
              onChange={e => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
              className="w-28 md:w-36 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#a757ff]/50"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="number"
              placeholder="Đến"
              value={priceRange[1] >= maxPrice ? "" : priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value) || maxPrice])}
              className="w-28 md:w-36 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#a757ff]/50"
            />
            <span className="text-xs text-gray-400">₫</span>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs md:text-sm text-gray-500 font-medium mb-4 md:mb-6">
        {filtered.length} / {products.length} sản phẩm
        {search && <span> cho "{search}"</span>}
      </p>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {filtered.map((product) => {
            const price = product.salePrice || product.basePrice;
            const hasSale = !!product.salePrice && product.salePrice < product.basePrice;
            const discount = hasSale ? Math.round(((product.basePrice - price) / product.basePrice) * 100) : 0;

            return (
              <Link key={product.id} href={`/products/${product.slug}`}
                className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-2 md:p-3 group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col gap-2 md:gap-3">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg md:rounded-xl bg-gray-50">
                  <img
                    src={product.thumbnail || 'https://placehold.co/400x500/f8fafc/94a3b8?text=Product'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {hasSale && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">
                      -{discount}%
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
                      <span className="text-[10px] md:text-xs text-gray-400 line-through font-medium">{product.basePrice.toLocaleString()}₫</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-20 md:py-32 text-center bg-white border border-dashed border-gray-200 rounded-2xl md:rounded-3xl">
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bold">Không tìm thấy sản phẩm</p>
          <p className="text-gray-300 text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc</p>
        </div>
      )}
    </div>
  );
}
