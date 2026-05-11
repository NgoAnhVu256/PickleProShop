"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/shop/CartContext";
import { usePathname } from "next/navigation";

// Lazy-load heavy components to reduce main-thread blocking time
const ChatWidget = dynamic(() => import("@/components/shop/ChatWidget"), { ssr: false });
const PopupBanner = dynamic(() => import("@/components/shop/PopupBanner"), { ssr: false });
const CartDrawer = dynamic(() => import("@/components/shop/CartDrawer"), { ssr: false });

import React, { createContext, useContext } from "react";

const SiteSettingsContext = createContext<any>(null);

export const useSiteSettings = () => useContext(SiteSettingsContext);

export default function Providers({ 
  children,
  settings 
}: { 
  children: React.ReactNode;
  settings?: any;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <SiteSettingsContext.Provider value={settings}>
      <SessionProvider>
        <CartProvider>
          {children}
          {!isAdmin && <CartDrawer />}
          {!isAdmin && <PopupBanner />}
          {!isAdmin && (
            <ChatWidget
              zaloLink={settings?.zalo}
              messengerLink={settings?.messenger}
              chatbotAvatar="/api/favicon"
            />
          )}
        </CartProvider>
      </SessionProvider>
    </SiteSettingsContext.Provider>
  );
}
