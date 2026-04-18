export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `/uploads/${path}`;
}

/**
 * Calculate discount percentage between base price and sale price.
 */
export function getDiscountPercent(basePrice: number, salePrice: number | null | undefined): number {
  if (!salePrice || salePrice >= basePrice || basePrice <= 0) return 0;
  return Math.round(((basePrice - salePrice) / basePrice) * 100);
}

/**
 * Check if a time-bound sale is currently active.
 */
export function isSaleActive(
  salePrice: number | null | undefined,
  saleStartAt: string | Date | null | undefined,
  saleEndAt: string | Date | null | undefined,
): boolean {
  if (!salePrice) return false;
  const now = new Date();
  if (saleStartAt && new Date(saleStartAt) > now) return false;
  if (saleEndAt && new Date(saleEndAt) < now) return false;
  return true;
}

/**
 * Get the display price considering sale scheduling.
 * Returns { price, originalPrice, discount }.
 */
export function getDisplayPrice(product: {
  basePrice: number;
  salePrice?: number | null;
  saleStartAt?: string | Date | null;
  saleEndAt?: string | Date | null;
}) {
  const active = isSaleActive(product.salePrice, product.saleStartAt, product.saleEndAt);
  if (active && product.salePrice && product.salePrice < product.basePrice) {
    return {
      price: product.salePrice,
      originalPrice: product.basePrice,
      discount: getDiscountPercent(product.basePrice, product.salePrice),
      isOnSale: true,
    };
  }
  return {
    price: product.basePrice,
    originalPrice: null,
    discount: 0,
    isOnSale: false,
  };
}
