"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantSku: string;
  variantLabel: string;
  price: number;
  quantity: number;
  image: string;
}

// Extended item type returned from the promotion engine
export interface CalculatedCartItem extends CartItem {
  finalPrice: number;
  stock: number;
  isGift: boolean;
  parentVariantId: string | null;
  promotionId: string | null;
  promotionName: string | null;
  discountAmount: number;
}

export interface AppliedPromotion {
  id: string;
  name: string;
  giftCount: number;
}

interface CartContextType {
  // Raw items (user-added, stored in localStorage)
  items: CartItem[];
  addToCart: (item: CartItem, openCart?: boolean) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  // Promotion-aware calculated state
  calculatedItems: CalculatedCartItem[];
  giftItems: CalculatedCartItem[];
  appliedPromotions: AppliedPromotion[];
  subTotal: number;
  discountTotal: number;
  giftTotal: number;
  finalTotal: number;
  isCalculating: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Promotion engine state
  const [calculatedItems, setCalculatedItems] = useState<CalculatedCartItem[]>([]);
  const [appliedPromotions, setAppliedPromotions] = useState<AppliedPromotion[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [giftTotal, setGiftTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const calcTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("picklepro_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("picklepro_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // ── Promotion Engine: Debounced calculation ──
  const recalculate = useCallback(async (currentItems: CartItem[]) => {
    if (currentItems.length === 0) {
      setCalculatedItems([]);
      setAppliedPromotions([]);
      setSubTotal(0);
      setDiscountTotal(0);
      setGiftTotal(0);
      setFinalTotal(0);
      return;
    }

    setIsCalculating(true);
    try {
      const res = await fetch("/api/cart/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: currentItems.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCalculatedItems(data.data.items);
        setAppliedPromotions(data.data.appliedPromotions);
        setSubTotal(data.data.subTotal);
        setDiscountTotal(data.data.discountTotal);
        setGiftTotal(data.data.giftTotal);
        setFinalTotal(data.data.finalTotal);
      }
    } catch {
      // Fallback: use simple calculation without promotions
      const fallbackTotal = currentItems.reduce((s, i) => s + i.price * i.quantity, 0);
      setSubTotal(fallbackTotal);
      setFinalTotal(fallbackTotal);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Debounce recalculation when items change
  useEffect(() => {
    if (!isLoaded) return;
    if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);
    calcTimeoutRef.current = setTimeout(() => {
      recalculate(items);
    }, 300); // 300ms debounce
    return () => {
      if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);
    };
  }, [items, isLoaded, recalculate]);

  const addToCart = useCallback((item: CartItem, openCart = true) => {
    setItems(prev => {
      const existing = prev.find(i => i.variantId === item.variantId);
      if (existing) {
        return prev.map(i =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    if (openCart) setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((variantId: string) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId));
    // The recalculation will automatically remove orphaned gifts
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.variantId !== variantId));
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.variantId === variantId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Simple totals from raw items (for backward compat)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Separate gift items for rendering
  const giftItems = calculatedItems.filter(i => i.isGift);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, totalPrice, isCartOpen, setIsCartOpen,
      // Promotion-aware
      calculatedItems,
      giftItems,
      appliedPromotions,
      subTotal: subTotal || totalPrice,
      discountTotal,
      giftTotal,
      finalTotal: finalTotal || totalPrice,
      isCalculating,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
