import {
  addCartItem,
  addToWishlist,
  cartCount,
  clearCart,
  getCart,
  isInWishlist,
  listWishlist,
  moveWishlistItemToCart,
  removeCartItem,
  removeFromWishlist,
  updateCartItemQuantity,
} from '../models/cart.model';
import { evaluateCoupon } from '../models/coupon.model';
import { settingsMap } from '../models/setting.model';
import { computeTotals } from '../utils/pricing';

export async function getCartDetail(userId: number) {
  return getCart(userId);
}

export async function getCartBadge(userId: number) {
  return { count: await cartCount(userId) };
}

export async function addItem(userId: number, productId: number, quantity: number) {
  return addCartItem(userId, productId, quantity);
}

export async function updateItem(userId: number, itemId: number, quantity: number) {
  return updateCartItemQuantity(userId, itemId, quantity);
}

export async function removeItem(userId: number, itemId: number) {
  return removeCartItem(userId, itemId);
}

export async function emptyCart(userId: number) {
  await clearCart(userId);
  return getCart(userId);
}

// ---------------------------------------------------------------- wishlist
export async function getWishlist(userId: number) {
  const [items, settings] = await Promise.all([listWishlist(userId), settingsMap()]);
  return { items, currency: settings.currency ?? 'PHP' };
}

export async function addWish(userId: number, productId: number) {
  await addToWishlist(userId, productId);
  return getWishlist(userId);
}

export async function removeWish(userId: number, productId: number) {
  const removed = await removeFromWishlist(userId, productId);
  if (!removed) return { removed: false, ...(await getWishlist(userId)) };
  return { removed: true, ...(await getWishlist(userId)) };
}

export async function checkWish(userId: number, productId: number) {
  return { in_wishlist: await isInWishlist(userId, productId) };
}

export async function wishToCart(userId: number, productId: number) {
  return moveWishlistItemToCart(userId, productId);
}

/**
 * Cart summary with live tax/shipping applied, used by the cart drawer and the
 * checkout page. Totals mirror the order-creation maths exactly.
 */
export async function getCartSummary(userId: number, couponCode?: string) {
  const cart = await getCart(userId);
  const settings = await settingsMap();

  let discount = 0;
  let coupon: Awaited<ReturnType<typeof evaluateCoupon>> | null = null;
  if (couponCode) {
    coupon = await evaluateCoupon(couponCode, Number(cart.summary.subtotal), userId);
    if (coupon.valid) discount = coupon.discount;
  }

  // Same helper the order transaction uses, so the quoted total is the charged
  // total to the peso.
  const totals = computeTotals({
    subtotal: Number(cart.summary.subtotal),
    discount,
    taxRatePercent: Number(settings.tax_rate ?? 12),
    shippingFee: Number(settings.shipping_fee ?? 0),
    freeShippingThreshold: Number(settings.free_shipping_threshold ?? 0),
  });

  return {
    ...cart,
    coupon,
    totals: {
      subtotal: String(totals.subtotal),
      discount: String(totals.discount),
      shipping_fee: String(totals.shippingFee),
      tax: String(totals.tax),
      total: String(totals.grandTotal),
      free_shipping: totals.freeShipping,
      free_shipping_threshold: String(settings.free_shipping_threshold ?? '0'),
      currency: settings.currency ?? 'PHP',
    },
  };
}
