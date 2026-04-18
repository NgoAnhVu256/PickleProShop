"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, User, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Category {
  name: string;
  slug: string;
  image: string | null;
}

interface Props {
  categories: Category[];
  logoUrl: string | null;
}

export default function Header({ categories, logoUrl }: Props) {
  const [query, setQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // future: trigger search API call
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="w-full px-8">
        <div className="flex flex-col">
          {/* ── TOP SECTION ── */}
          <div className="py-4 flex items-center justify-between gap-6 relative">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={150}
                  height={40}
                  className="h-8 w-auto object-contain"
                  priority
                />
              )}
              <span className="text-xl font-bold text-gray-900 leading-tight">
                PicklePro
              </span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-2xl flex items-center gap-2 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-sm px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="absolute right-1 p-1.5 text-gray-500 hover:text-gray-700 bg-transparent rounded-sm">
                <Search size={16} />
              </button>
            </div>

            {/* Right Icons/Auth */}
            <div className="flex shrink-0 items-center space-x-3">
              {/* Mail Icon */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors relative">
                <Mail size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Cart Button */}
              <Link
                href="/cart"
                className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-gray-800 rounded-full text-sm hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart size={16} />
                Giỏ hàng
              </Link>
              
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-3">
                {/* Register link */}
                <Link
                  href="/register"
                  className="text-sm px-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Đăng ký
                </Link>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="flex justify-center px-6 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors font-medium"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>

          {/* ── BOTTOM NAV SECTION ── */}
          <nav className="py-3 flex items-center w-full overflow-x-auto">
            <ul className="flex items-center gap-6 whitespace-nowrap">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              
              {/* Additional generic links */}
              <li>
                <Link
                  href="/collections"
                  className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Bộ sưu tập
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Tin tức
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Cộng đồng
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
