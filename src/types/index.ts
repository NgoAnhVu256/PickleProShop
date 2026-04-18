import type { Role, OrderStatus, BannerPosition } from "@prisma/client";

// ─── Auth Types ──────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }
}

// ─── Cart Types ──────────────────────────────────
export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  sku: string;
  price: number;
  quantity: number;
  attributes: { name: string; value: string }[];
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// ─── API Response Types ──────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Re-exports ──────────────────────────────────
export type { Role, OrderStatus, BannerPosition };
