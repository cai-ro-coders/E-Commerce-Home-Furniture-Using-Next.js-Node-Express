import { execute, query, queryOne, transaction } from '../config/database';
import { ApiError } from '../utils/ApiError';
import type { RowDataPacket } from 'mysql2';

export interface CartRow extends RowDataPacket {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

/** Lazily creates the user's cart on first use — the schema has no guest carts. */
export async function getOrCreateCart(userId: number): Promise<number> {
  const existing = await queryOne<CartRow>('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [
    userId,
  ]);
  if (existing) return existing.id;
  try {
    const result = await execute('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    return result.insertId;
  } catch {
    // Lost an insert race — the unique key on user_id means the row now exists.
    const raced = await queryOne<CartRow>('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [
      userId,
    ]);
    if (!raced) throw new Error('CART_INIT_FAILED');
    return raced.id;
  }
}

export interface CartItemRow extends RowDataPacket {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price: string;
  product_name: string;
  slug: string;
  sku: string;
  stock_quantity: number;
  product_status: string;
  product_image: string | null;
  line_total: string;
}

export interface CartDetail {
  items: CartItemRow[];
  summary: {
    item_count: number;
    subtotal: string;
    total: string;
  };
}

export async function getCart(userId: number): Promise<CartDetail> {
  const cartId = await getOrCreateCart(userId);
  return readCart(cartId);
}

export async function readCart(cartId: number): Promise<CartDetail> {
  const items = await query<CartItemRow>(
    `SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, ci.price,
            p.name       AS product_name,
            p.slug       AS slug,
            p.sku        AS sku,
            p.stock_quantity,
            p.status     AS product_status,
            (SELECT pi.image FROM product_images pi WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS product_image,
            ROUND(ci.price * ci.quantity, 2) AS line_total
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at DESC, ci.id DESC`,
    [cartId]
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item.line_total), 0);
  const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

  return {
    items,
    summary: {
      item_count: itemCount,
      subtotal: String(round(subtotal)),
      total: String(round(subtotal)),
    },
  };
}

export async function addCartItem(
  userId: number,
  productId: number,
  quantity: number
): Promise<CartDetail> {
  const cartId = await getOrCreateCart(userId);

  const product = await queryOne<RowDataPacket & { stock: number; price: string; sale_price: string | null; status: string }>(
    'SELECT stock_quantity AS stock, price, sale_price, status FROM products WHERE id = ? LIMIT 1',
    [productId]
  );
  if (!product) throw ApiError.notFound('Product not found');
  if (product.status !== 'active') throw ApiError.badRequest('This product is not available for purchase');

  const unitPrice = product.sale_price ?? product.price;
  const existing = await queryOne<CartItemRow>(
    'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
    [cartId, productId]
  );

  const desiredQty = (existing?.quantity ?? 0) + quantity;
  if (desiredQty > Number(product.stock)) {
    throw ApiError.badRequest(
      `Only ${product.stock} unit(s) of this product are in stock`,
      { available: Number(product.stock) }
    );
  }

  if (existing) {
    // Refresh the price snapshot so a price change is reflected in the cart.
    await execute('UPDATE cart_items SET quantity = ?, price = ? WHERE id = ?', [
      desiredQty,
      unitPrice,
      existing.id,
    ]);
  } else {
    await execute(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [cartId, productId, quantity, unitPrice]
    );
  }

  return readCart(cartId);
}

export async function updateCartItemQuantity(
  userId: number,
  itemId: number,
  quantity: number
): Promise<CartDetail> {
  const cartId = await getOrCreateCart(userId);
  const item = await queryOne<CartItemRow & { stock_quantity: number }>(
    `SELECT ci.id, ci.quantity, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
      WHERE ci.id = ? AND ci.cart_id = ? LIMIT 1`,
    [itemId, cartId]
  );
  if (!item) throw ApiError.notFound('Cart item not found');
  if (quantity > Number(item.stock_quantity)) {
    throw ApiError.badRequest(`Only ${item.stock_quantity} unit(s) available`, {
      available: Number(item.stock_quantity),
    });
  }

  await execute('UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?', [
    quantity,
    itemId,
    cartId,
  ]);
  return readCart(cartId);
}

export async function removeCartItem(userId: number, itemId: number): Promise<CartDetail> {
  const cartId = await getOrCreateCart(userId);
  const result = await execute('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [
    itemId,
    cartId,
  ]);
  if (result.affectedRows === 0) throw ApiError.notFound('Cart item not found');
  return readCart(cartId);
}

export async function clearCart(userId: number): Promise<void> {
  const cart = await queryOne<CartRow>('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [userId]);
  if (!cart) return;
  await execute('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
}

export async function cartCount(userId: number): Promise<number> {
  const row = await queryOne<RowDataPacket & { total: number }>(
    `SELECT COALESCE(SUM(ci.quantity), 0) AS total
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
      WHERE c.user_id = ?`,
    [userId]
  );
  return Number(row?.total ?? 0);
}

// ---------------------------------------------------------------- wishlists
export async function listWishlist(userId: number): Promise<RowDataPacket[]> {
  return query(
    `SELECT w.id AS wishlist_id, p.*,
            (SELECT pi.image FROM product_images pi WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS primary_image,
            (SELECT ROUND(AVG(r.rating), 2) FROM reviews r
              WHERE r.product_id = p.id AND r.status = 'approved')    AS avg_rating,
            (SELECT COUNT(*) FROM reviews r
              WHERE r.product_id = p.id AND r.status = 'approved')    AS review_count
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC`,
    [userId]
  );
}

export async function addToWishlist(userId: number, productId: number): Promise<void> {
  const product = await queryOne<RowDataPacket>('SELECT id FROM products WHERE id = ? LIMIT 1', [
    productId,
  ]);
  if (!product) throw ApiError.notFound('Product not found');
  // INSERT IGNORE makes the endpoint idempotent per the (user_id, product_id) key.
  await execute('INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)', [
    userId,
    productId,
  ]);
}

export async function removeFromWishlist(userId: number, productId: number): Promise<boolean> {
  const result = await execute('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [
    userId,
    productId,
  ]);
  return result.affectedRows > 0;
}

export async function isInWishlist(userId: number, productId: number): Promise<boolean> {
  const row = await queryOne<RowDataPacket>(
    'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1',
    [userId, productId]
  );
  return row !== null;
}

/** Count wishlist entries per product — used to show hearts on product cards. */
export async function wishlistCounts(productIds: number[]): Promise<Map<number, number>> {
  if (productIds.length === 0) return new Map();
  const placeholders = productIds.map(() => '?').join(', ');
  const rows = await query<RowDataPacket & { product_id: number; total: number }>(
    `SELECT product_id, COUNT(*) AS total FROM wishlists
      WHERE product_id IN (${placeholders}) GROUP BY product_id`,
    productIds
  );
  return new Map(rows.map((row) => [Number(row.product_id), Number(row.total)]));
}

/** Move a wishlisted product into the cart, then drop it from the wishlist. */
export async function moveWishlistItemToCart(
  userId: number,
  productId: number
): Promise<CartDetail> {
  const inWishlist = await isInWishlist(userId, productId);
  if (!inWishlist) throw ApiError.notFound('Product is not in your wishlist');
  const cart = await addCartItem(userId, productId, 1);
  await removeFromWishlist(userId, productId);
  return cart;
}

// Clear a cart as part of checkout, inside the checkout transaction.
export async function clearCartWithConnection(
  connection: import('mysql2/promise').PoolConnection,
  userId: number
): Promise<void> {
  await connection.execute(
    'DELETE ci FROM cart_items ci JOIN carts c ON c.id = ci.cart_id WHERE c.user_id = ?',
    [userId]
  );
}

export { transaction };
