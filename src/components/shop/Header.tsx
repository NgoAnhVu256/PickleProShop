"use client";
import { Search, ShoppingCart, User, Menu, X, LogOut, Shield, ChevronDown, Package, UserCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from './CartContext';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  basePrice: number;
  salePrice: number | null;
}

import { useSiteSettings } from './Providers';

let globalNavCategories: {name: string, href: string}[] | null = null;

export default function Header() {
  const settingsContext = useSiteSettings();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [navCategories, setNavCategories] = useState<{name: string, href: string}[]>(globalNavCategories || [
    { name: "Sản phẩm", href: "/products" },
    { name: "Vợt Pickleball", href: "/category/vot-pickleball" },
    { name: "Giày Pickleball", href: "/category/giay-pickleball" },
    { name: "Trang Phục", href: "/category/trang-phuc" },
    { name: "Phụ kiện", href: "/category/phu-kien" },
    { name: "Tin tức", href: "/blog" }
  ]);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as any)?.role;
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  const logo = settingsContext?.logo;
  const siteName = settingsContext?.name || "PicklePro";

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch categories dynamically
  useEffect(() => {
    if (globalNavCategories) return; // Skip if already fetched in this session
    
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const fetchedCats = data.data.map((c: any) => ({
            name: c.name,
            href: `/category/${c.slug}`
          }));
          const newCats = [
            { name: "Sản phẩm", href: "/products" },
            ...fetchedCats,
            { name: "Tin tức", href: "/blog" }
          ];
          globalNavCategories = newCats;
          setNavCategories(newCats);
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  // Ajax search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.data);
          setShowDropdown(true);
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowDropdown(false);
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-100 text-gray-900 rounded-sm px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-[#2C2877] text-white border-b border-[#1b1853] shadow-sm">
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
        {/* LOGO */}
        <Link href="/" prefetch={false} className="flex items-center gap-2 md:gap-3 shrink-0" aria-label="Trang chủ">
          <img src={logo ? `/api/img?url=${encodeURIComponent(logo)}&w=96&q=80` : '/api/favicon'} alt={siteName} width={40} height={40} className="h-8 md:h-10 w-8 md:w-10 rounded-lg object-cover" />
          <span className="font-extrabold text-base md:text-xl tracking-tighter text-white">{siteName}</span>
        </Link>

        {/* SEARCH - DESKTOP & TABLET */}
        <div className="hidden md:block flex-1 max-w-2xl relative" ref={searchRef}>
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className="w-full h-10 md:h-12 bg-[#1b1853]/50 border border-[#1b1853] rounded-full pl-6 pr-14 text-sm md:text-[15px] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6220]/20 focus:border-[#FF6220] transition-all"
          />
          <button onClick={handleSearchSubmit} aria-label="Tìm kiếm" className="absolute right-1 md:right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 bg-[#FF6220] rounded-full flex items-center justify-center text-white hover:bg-[#FF6220]/80 transition-colors">
            <Search className="w-4 h-4 md:w-4.5 md:h-4.5 text-white" />
          </button>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <>
                  {searchResults.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={() => { setShowDropdown(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                        <Image src={p.thumbnail || 'https://placehold.co/80x80/f8fafc/94a3b8?text=SP'} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{highlightMatch(p.name, searchQuery)}</p>
                        <p className="text-xs font-bold text-accent">{(p.salePrice || p.basePrice).toLocaleString()}₫</p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/products?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setShowDropdown(false)}
                    className="block text-center py-3 text-sm font-bold text-primary border-t border-gray-100 hover:bg-gray-50 hover:text-primary-dark"
                  >
                    Xem tất cả kết quả →
                  </Link>
                </>
              ) : (
                <div className="p-6 text-center text-sm text-gray-400">
                  {isSearching ? "Đang tìm..." : "Không tìm thấy sản phẩm nào"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 shrink-0">
          {/* Hamburger Toggle */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Mobile Search Toggle */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Mở tìm kiếm"
          >
            <Search className="w-6 h-6" />
          </button>

          {/* Auth Section */}
          {user ? (
            /* Logged in - show user menu */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-sm"
                aria-label="Menu tài khoản"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#FF6220] to-[#2C2877] flex items-center justify-center text-white font-bold text-xs">
                  {user.image ? (
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (user.name || "U")[0].toUpperCase()
                  )}
                </div>
                <span className="hidden lg:inline font-bold text-gray-100 max-w-[100px] truncate">{user.name}</span>
                <ChevronDown size={14} className={`hidden lg:block text-gray-300 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 text-gray-900">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  
                  {role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      <Shield size={16} className="text-red-500" />
                      Quản trị Admin
                    </Link>
                  )}
                  
                  <Link href="/account" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <UserCircle size={16} className="text-[#2C2877]" />
                    Tài khoản
                  </Link>

                  <Link href="/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <Package size={16} className="text-gray-400" />
                    Đơn hàng của tôi
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 mt-1"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in */
            <div className="hidden lg:flex items-center gap-4 text-xs xl:text-sm font-bold">
              <Link href="/login" className="bg-white text-[#2C2877] hover:bg-gray-100 px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all">Đăng nhập</Link>
            </div>
          )}

          {!user && (
            <Link href="/login" className="p-1 lg:hidden text-white" aria-label="Đăng nhập">
              <User className="w-6 h-6" />
            </Link>
          )}

          <button onClick={() => setIsCartOpen(true)} className="relative bg-[#A0E870] hover:bg-[#82cc52] text-gray-900 font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transition-all text-xs md:text-sm" aria-label="Giỏ hàng">
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{totalItems > 99 ? "99+" : totalItems}</span>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH BAR - Visible when toggled */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top duration-200">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Bạn tìm gì hôm nay?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 text-sm focus:outline-none focus:border-primary"
              autoFocus
            />
            <button aria-label="Tìm kiếm trên điện thoại" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </button>
          </div>
          {/* Mobile search results */}
          {showDropdown && searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {searchResults.slice(0, 4).map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} onClick={() => { setShowDropdown(false); setIsSearchOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                    <Image src={p.thumbnail || 'https://placehold.co/80x80/f8fafc/94a3b8?text=SP'} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs font-bold text-accent">{(p.salePrice || p.basePrice).toLocaleString()}₫</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CATEGORY NAV */}
      <nav className="bg-[#1b1853]">
        <div className="max-w-7xl mx-auto px-2 md:px-6 h-12 md:h-16 flex items-center justify-start md:justify-center gap-1.5 md:gap-3 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
          {/* Home icon */}
          <Link
            href="/"
            prefetch={false}
            aria-label="Trang chủ"
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              pathname === "/" ? "bg-[#FF6220] text-white" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </Link>
          {navCategories.map((item) => {
            const isActive = pathname.startsWith(item.href) && item.href !== "/";
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={false}
                className={`nav-pill ${isActive ? "active" : ""}`}
              >
                {item.name}
              </Link>
            );
          })}
          {/* Nút liên hệ màu cam giống thiết kế mẫu */}
          <Link
            href="/feedback"
            prefetch={false}
            className="shrink-0 bg-[#FF6220] hover:bg-[#e04f10] text-white text-[11px] md:text-sm font-bold px-4 md:px-5 py-2.5 rounded-full flex items-center gap-1 shadow-sm transition-all uppercase tracking-wider"
          >
            Liên hệ ↗
          </Link>
        </div>
      </nav>

      {/* MOBILE SIDEBAR MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          {/* Sidebar */}
          <div className="absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-extrabold text-xl">{siteName}</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col px-4 gap-2">
                {navCategories.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 px-4 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {user ? (
              <div className="p-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold relative overflow-hidden">
                    {user.image ? <Image src={user.image} alt="" fill sizes="40px" className="object-cover" /> : (user.name || "U")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link href="/account" prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <UserCircle size={18} className="text-primary" /> Tài khoản
                </Link>
                <Link href="/orders" prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Package size={18} className="text-gray-400" /> Đơn hàng
                </Link>
                <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 mt-2">
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="p-4 border-t border-gray-100">
                <Link href="/login" prefetch={false} onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-3 bg-primary hover:bg-primary-dark text-white text-center rounded-xl font-bold transition-colors">
                  Đăng nhập / Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
