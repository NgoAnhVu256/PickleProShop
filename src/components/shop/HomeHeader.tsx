"use client";

import Header from "@/components/shop/Header";
import { useCart } from "@/components/shop/CartContext";

export default function HomeHeader({ settings }: { settings?: any }) {
  const { totalItems, setIsCartOpen } = useCart();
  return (
    <Header
      settings={settings}
      cartCount={totalItems}
      onCartClick={() => setIsCartOpen(true)}
    />
  );
}
