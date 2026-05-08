"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/shop/CartContext";
import CartDrawer from "@/components/shop/CartDrawer";
import React, { createContext, useContext, useState, useCallback } from "react";

const ChatWidget = dynamic(() => import("@/components/shop/ChatWidget"), { ssr: false });
const PopupBanner = dynamic(() => import("@/components/shop/PopupBanner"), { ssr: false });

const SiteSettingsContext = createContext<any>(null);

export const useSiteSettings = () => useContext(SiteSettingsContext);

export default function Providers({ 
  children,
  settings 
}: { 
  children: React.ReactNode;
  settings?: any;
}) {
  // When PopupBanner closes → autoOpen ChatWidget
  const [chatAutoOpen, setChatAutoOpen] = useState(false);

  const handleBannerClose = useCallback(() => {
    setChatAutoOpen(true);
  }, []);

  const handleAutoOpenHandled = useCallback(() => {
    setChatAutoOpen(false);
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      <SessionProvider>
        <CartProvider>
          {children}
          <CartDrawer />
          <PopupBanner onClose={handleBannerClose} />
          <ChatWidget
            zaloLink={settings?.zalo}
            chatbotAvatar={settings?.chatbotAvatar}
            autoOpen={chatAutoOpen}
            onAutoOpenHandled={handleAutoOpenHandled}
          />
        </CartProvider>
      </SessionProvider>
    </SiteSettingsContext.Provider>
  );
}
