"use client";

import Header from "@/components/shop/Header";
import { useCart } from "@/components/shop/CartContext";

export default function HomeHeader() {
  const { totalItems, setIsCartOpen } = useCart();
  return (
    <Header
      cartCount={totalItems}
      onCartClick={() => setIsCartOpen(true)}
    />
  );
}
