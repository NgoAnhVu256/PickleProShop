"use client";
import { Search, ShoppingCart, User, Menu, X, LogOut, Shield, ChevronDown, Package } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  basePrice: number;
  salePrice: number | null;
}

export default function Header({ settings, cartCount = 0, onCartClick }: { settings?: any; cartCount?: number; onCartClick?: () => void }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as any)?.role;
  const pathname = usePathname();

  const logo = settings?.logo;
  const siteName = settings?.name || "PicklePro";

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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0">
          <img src={logo || '/favicon.ico'} alt={siteName} className="h-8 md:h-10 w-auto object-contain" />
          <span className="font-extrabold text-base md:text-xl tracking-tighter">{siteName}</span>
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
            className="w-full h-10 md:h-12 bg-gray-50 border border-gray-200 rounded-full pl-6 pr-14 text-sm md:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#a757ff]/20 focus:border-[#a757ff] transition-all"
          />
          <button onClick={handleSearchSubmit} className="absolute right-1 md:right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 bg-black rounded-full flex items-center justify-center text-white hover:bg-[#a757ff] transition-colors">
            <Search className="w-4 h-4 md:w-4.5 md:h-4.5" />
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
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        <img src={p.thumbnail || 'https://placehold.co/80x80/f8fafc/94a3b8?text=SP'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{highlightMatch(p.name, searchQuery)}</p>
                        <p className="text-xs font-bold text-[#a757ff]">{(p.salePrice || p.basePrice).toLocaleString()}₫</p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/products?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setShowDropdown(false)}
                    className="block text-center py-3 text-sm font-bold text-[#a757ff] border-t border-gray-100 hover:bg-gray-50"
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
          {/* Mobile Search Toggle */}
          <button 
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
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
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#4f46e5] to-[#a757ff] flex items-center justify-center text-white font-bold text-xs">
                  {user.image ? (
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (user.name || "U")[0].toUpperCase()
                  )}
                </div>
                <span className="hidden lg:inline font-bold text-gray-700 max-w-[100px] truncate">{user.name}</span>
                <ChevronDown size={14} className={`hidden lg:block text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
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
              <Link href="/login" className="text-gray-600 hover:text-[#a757ff]">Đăng nhập</Link>
              <Link href="/register" className="bg-gradient-to-r from-[#4f46e5] to-[#a757ff] text-white px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all">Đăng ký</Link>
            </div>
          )}

          {!user && (
            <Link href="/login" className="p-1 lg:hidden text-gray-700">
              <User className="w-6 h-6" />
            </Link>
          )}

          <button onClick={onCartClick} className="relative p-1 text-gray-700">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount > 99 ? "99+" : cartCount}</span>
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
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 text-sm focus:outline-none focus:border-[#a757ff]"
              autoFocus
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </button>
          </div>
          {/* Mobile search results */}
          {showDropdown && searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {searchResults.slice(0, 4).map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} onClick={() => { setShowDropdown(false); setIsSearchOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    <img src={p.thumbnail || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs font-bold text-[#a757ff]">{(p.salePrice || p.basePrice).toLocaleString()}₫</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CATEGORY NAV */}
      <nav className="border-t border-gray-100 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-12 md:h-14 flex items-center gap-6 md:gap-12 text-[13px] md:text-[15px] font-bold tracking-tight overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
          {[
            { name: "Trang chủ", href: "/" },
            { name: "Vợt Pickleball", href: "/category/vot-pickleball" },
            { name: "Giày Pickleball", href: "/category/giay-pickleball" },
            { name: "Trang Phục", href: "/category/trang-phuc" },
            { name: "Balo & Túi", href: "/category/balo-tui" },
            { name: "Phụ kiện", href: "/category/phu-kien" },
            { name: "Tin tức", href: "/blog" },
          ].map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative py-1 shrink-0 transition-colors duration-200 ${
                  isActive ? "text-[#a757ff]" : "text-gray-600 md:text-gray-900 hover:text-[#a757ff]"
                }`}
              >
                {item.name}
                <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#a757ff] transition-transform duration-300 origin-left ${
                  isActive ? "scale-x-100" : "scale-x-0"
                }`} />
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
