/**
 * PicklePro Promotion Engine — Rule-based Cart Calculator
 * 
 * Xử lý logic "Mua X Tặng Y" và "Mua X được mua Y giá sốc"
 * 
 * Luồng xử lý:
 * 1. Nhận cartItems[] từ client
 * 2. Truy vấn DB → lấy tất cả Promotions đang active + trong thời hạn
 * 3. Sắp xếp theo priority (cao → thấp)
 * 4. Với mỗi Promotion, kiểm tra TẤT CẢ conditions có thỏa mãn không
 * 5. Nếu thỏa → inject rewards vào mảng kết quả (gắn cờ isGift)
 * 6. Tính lại subTotal, discountTotal, finalTotal
 * 7. Edge case: khi xóa parent item → cascade xóa child gifts
 */

import { prisma } from "@/lib/prisma";

// ── Types ──────────────────────────────────────────────

export interface CartInputItem {
  variantId: string;
  quantity: number;
}

export interface CalculatedCartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantSku: string;
  variantLabel: string;
  price: number;          // Original price
  finalPrice: number;     // After promo discount (= price for normal items)
  quantity: number;
  image: string;
  stock: number;
  // Promotion fields
  isGift: boolean;
  parentVariantId: string | null;  // Which cart item triggered this gift
  promotionId: string | null;
  promotionName: string | null;
  discountAmount: number; // Per-unit discount
}

export interface CartCalculationResult {
  items: CalculatedCartItem[];
  subTotal: number;       // Sum of item.price * item.quantity (original prices, excl gifts)
  discountTotal: number;  // Total discount from promotions
  giftTotal: number;      // Market value of gifted items
  finalTotal: number;     // subTotal - discountTotal
  appliedPromotions: {
    id: string;
    name: string;
    giftCount: number;
  }[];
}

// ── Core Engine ────────────────────────────────────────

export async function calculateCart(cartInputItems: CartInputItem[]): Promise<CartCalculationResult> {
  if (!cartInputItems || cartInputItems.length === 0) {
    return { items: [], subTotal: 0, discountTotal: 0, giftTotal: 0, finalTotal: 0, appliedPromotions: [] };
  }

  // 1. Hydrate cart items from DB (get full product info)
  const variantIds = cartInputItems.map(i => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    include: {
      product: { select: { id: true, name: true, slug: true, thumbnail: true, categoryId: true } },
      attrValues: { include: { attribute: { select: { name: true, label: true } } } },
    },
  });

  const variantMap = new Map(variants.map(v => [v.id, v]));

  // Build hydrated cart items (only real items, no gifts yet)
  const hydratedItems: CalculatedCartItem[] = [];
  for (const input of cartInputItems) {
    const v = variantMap.get(input.variantId);
    if (!v) continue; // Skip invalid variants

    const label = v.attrValues.map(a => `${a.attribute.label}: ${a.value}`).join(", ") || v.sku;
    hydratedItems.push({
      variantId: v.id,
      productId: v.product.id,
      productName: v.product.name,
      productSlug: v.product.slug,
      variantSku: v.sku,
      variantLabel: label,
      price: v.price,
      finalPrice: v.price,
      quantity: input.quantity,
      image: v.images?.[0] || v.product.thumbnail || "",
      stock: v.stock,
      isGift: false,
      parentVariantId: null,
      promotionId: null,
      promotionName: null,
      discountAmount: 0,
    });
  }

  // 2. Fetch all active promotions (with conditions + rewards), sorted by priority DESC
  const now = new Date();
  const promotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    include: {
      conditions: {
        include: {
          productVariant: { select: { id: true, productId: true } },
          category: { select: { id: true } },
        },
      },
      rewards: {
        include: {
          productVariant: {
            include: {
              product: { select: { id: true, name: true, slug: true, thumbnail: true } },
              attrValues: { include: { attribute: { select: { name: true, label: true } } } },
            },
          },
        },
      },
    },
    orderBy: { priority: "desc" },
  });

  // 3. Evaluate each promotion
  const giftItems: CalculatedCartItem[] = [];
  const appliedPromotions: CartCalculationResult["appliedPromotions"] = [];
  const appliedNonStackableIds = new Set<string>();

  // Build lookup: variantId -> cart quantity, categoryId -> [variantIds]
  const cartVariantQty = new Map<string, number>();
  const cartCategoryVariants = new Map<string, string[]>();

  for (const item of hydratedItems) {
    cartVariantQty.set(item.variantId, item.quantity);
    const v = variantMap.get(item.variantId);
    if (v) {
      const catId = v.product.categoryId;
      if (!cartCategoryVariants.has(catId)) cartCategoryVariants.set(catId, []);
      cartCategoryVariants.get(catId)!.push(item.variantId);
    }
  }

  for (const promo of promotions) {
    // Skip if a non-stackable promo already applied and this one isn't stackable
    if (!promo.stackable && appliedNonStackableIds.size > 0) continue;

    // 3a. Check ALL conditions must be met (AND logic)
    let allConditionsMet = true;
    let triggerVariantId: string | null = null; // For parent tracking

    for (const cond of promo.conditions) {
      let conditionMet = false;

      if (cond.productVariantId) {
        // Variant-specific condition
        const qtyInCart = cartVariantQty.get(cond.productVariantId) || 0;
        if (qtyInCart >= cond.minQuantity) {
          conditionMet = true;
          triggerVariantId = cond.productVariantId;
        }
      } else if (cond.categoryId) {
        // Category-wide condition: any variant from this category in cart
        const categoryVariants = cartCategoryVariants.get(cond.categoryId) || [];
        if (categoryVariants.length > 0) {
          // Sum total qty of all variants from this category
          const totalQty = categoryVariants.reduce((sum, vid) => sum + (cartVariantQty.get(vid) || 0), 0);
          if (totalQty >= cond.minQuantity) {
            conditionMet = true;
            triggerVariantId = categoryVariants[0]; // Use first matching variant as parent
          }
        }
      }

      if (!conditionMet) {
        allConditionsMet = false;
        break;
      }
    }

    if (!allConditionsMet) continue;

    // 3b. All conditions met → inject rewards as gift items
    let promoGiftCount = 0;

    for (const reward of promo.rewards) {
      const rv = reward.productVariant;
      const label = rv.attrValues.map(a => `${a.attribute.label}: ${a.value}`).join(", ") || rv.sku;

      // Calculate gift price based on discountType
      let giftFinalPrice = 0;
      let perUnitDiscount = rv.price; // Default: full discount (FREE)

      switch (reward.discountType) {
        case "FREE":
          giftFinalPrice = 0;
          perUnitDiscount = rv.price;
          break;
        case "FIXED":
          giftFinalPrice = Math.max(0, reward.discountValue); // discountValue IS the special price
          perUnitDiscount = Math.max(0, rv.price - reward.discountValue);
          break;
        case "PERCENTAGE":
          const discountAmt = rv.price * (reward.discountValue / 100);
          giftFinalPrice = Math.max(0, rv.price - discountAmt);
          perUnitDiscount = discountAmt;
          break;
        default:
          // Legacy: use promoPrice field
          giftFinalPrice = reward.promoPrice;
          perUnitDiscount = Math.max(0, rv.price - reward.promoPrice);
      }

      // Check if this reward variant is already in gifts (avoid duplicates)
      const existingGift = giftItems.find(
        g => g.variantId === rv.id && g.promotionId === promo.id
      );
      if (existingGift) continue;

      giftItems.push({
        variantId: rv.id,
        productId: rv.product.id,
        productName: rv.product.name,
        productSlug: rv.product.slug,
        variantSku: rv.sku,
        variantLabel: label,
        price: rv.price,
        finalPrice: giftFinalPrice,
        quantity: reward.quantity,
        image: rv.images?.[0] || rv.product.thumbnail || "",
        stock: rv.stock,
        isGift: true,
        parentVariantId: triggerVariantId,
        promotionId: promo.id,
        promotionName: promo.name,
        discountAmount: perUnitDiscount,
      });

      promoGiftCount += reward.quantity;
    }

    if (promoGiftCount > 0) {
      appliedPromotions.push({ id: promo.id, name: promo.name, giftCount: promoGiftCount });
      if (!promo.stackable) appliedNonStackableIds.add(promo.id);
    }
  }

  // 4. Merge and calculate totals
  const allItems = [...hydratedItems, ...giftItems];

  const subTotal = hydratedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const giftTotal = giftItems.reduce((sum, g) => sum + g.price * g.quantity, 0); // Market value
  const discountTotal = giftItems.reduce((sum, g) => sum + g.discountAmount * g.quantity, 0);
  const giftCharges = giftItems.reduce((sum, g) => sum + g.finalPrice * g.quantity, 0); // What customer pays for gifts
  const finalTotal = subTotal + giftCharges;

  return {
    items: allItems,
    subTotal,
    discountTotal,
    giftTotal,
    finalTotal,
    appliedPromotions,
  };
}

// ── Edge Case: Remove parent → cascade remove gifts ────

export function removeItemWithGiftCascade(
  items: CalculatedCartItem[],
  removedVariantId: string
): CalculatedCartItem[] {
  // Remove the item itself AND any gifts triggered by it
  return items.filter(item => {
    // Remove the item being deleted
    if (item.variantId === removedVariantId && !item.isGift) return false;
    // Remove any gifts that had this item as parent
    if (item.isGift && item.parentVariantId === removedVariantId) return false;
    return true;
  });
}

// ── Edge Case: Update quantity → re-evaluate gifts ─────

export function shouldRecalculate(
  currentItems: CalculatedCartItem[],
  changedVariantId: string,
  newQuantity: number
): boolean {
  // If the changed item is a parent of any gift, we need to recalculate
  const isParent = currentItems.some(
    i => i.isGift && i.parentVariantId === changedVariantId
  );
  // If quantity dropped to 0, also recalculate
  return isParent || newQuantity <= 0;
}
