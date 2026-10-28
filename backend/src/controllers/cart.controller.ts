import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import {
  addItem,
  addWish,
  checkWish,
  emptyCart,
  getCartBadge,
  getCartDetail,
  getCartSummary,
  getWishlist,
  removeItem,
  removeWish,
  updateItem,
  wishToCart,
} from '../services/cart.service';
import { checkCoupon } from '../services/coupon.service';

const userId = (req: Request) => req.user!.id;

// -------------------------------------------------------------------- cart
export const getCartHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getCartDetail(userId(req)));
});

/** Item count only — the header badge should not download the whole cart. */
export const getCartBadgeHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getCartBadge(userId(req)));
});

export const addCartItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { product_id: number; quantity?: number };
  const cart = await addItem(userId(req), Number(body.product_id), Number(body.quantity ?? 1));
  return created(res, cart, 'Item added to cart');
});

export const updateCartItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { quantity: number };
  const cart = await updateItem(userId(req), Number(req.params.itemId), Number(body.quantity));
  return ok(res, cart, 'Cart updated');
});

export const removeCartItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const cart = await removeItem(userId(req), Number(req.params.itemId));
  return ok(res, cart, 'Item removed');
});

export const clearCartHandler = asyncHandler(async (req: Request, res: Response) => {
  const cart = await emptyCart(userId(req));
  return ok(res, cart, 'Cart emptied');
});

/**
 * Cart totals with an optional coupon applied. Kept separate from the cart read
 * because the coupon code is per-request state, not stored on the cart.
 */
export const cartSummaryHandler = asyncHandler(async (req: Request, res: Response) => {
  const code = typeof req.query.coupon === 'string' ? req.query.coupon : undefined;
  return ok(res, await getCartSummary(userId(req), code));
});

export const summaryCouponHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { code: string; cart_total: number };
  const result = await checkCoupon(body.code, Number(body.cart_total), userId(req));
  return ok(res, result, 'Coupon applied');
});

// ---------------------------------------------------------------- wishlist
export const getWishlistHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getWishlist(userId(req)));
});

export const addWishlistHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { product_id: number };
  const wishlist = await addWish(userId(req), Number(body.product_id));
  return created(res, wishlist, 'Saved to wishlist');
});

export const removeWishlistHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  const wishlist = await removeWish(userId(req), productId);
  return ok(res, wishlist, 'Removed from wishlist');
});

export const checkWishlistHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, { in_wishlist: await checkWish(userId(req), Number(req.params.productId)) });
});

export const wishlistToCartHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  if (!(await checkWish(userId(req), productId))) {
    throw ApiError.badRequest('That product is not on your wishlist');
  }
  const cart = await wishToCart(userId(req), productId);
  return created(res, cart, 'Moved to cart');
});
