"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaction = void 0;
exports.getOrCreateCart = getOrCreateCart;
exports.getCart = getCart;
exports.readCart = readCart;
exports.addCartItem = addCartItem;
exports.updateCartItemQuantity = updateCartItemQuantity;
exports.removeCartItem = removeCartItem;
exports.clearCart = clearCart;
exports.cartCount = cartCount;
exports.listWishlist = listWishlist;
exports.addToWishlist = addToWishlist;
exports.removeFromWishlist = removeFromWishlist;
exports.isInWishlist = isInWishlist;
exports.wishlistCounts = wishlistCounts;
exports.moveWishlistItemToCart = moveWishlistItemToCart;
exports.clearCartWithConnection = clearCartWithConnection;
const database_1 = require("../config/database");
Object.defineProperty(exports, "transaction", { enumerable: true, get: function () { return database_1.transaction; } });
const ApiError_1 = require("../utils/ApiError");
/** Lazily creates the user's cart on first use — the schema has no guest carts. */
async function getOrCreateCart(userId) {
    const existing = await (0, database_1.queryOne)('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [
        userId,
    ]);
    if (existing)
        return existing.id;
    try {
        const result = await (0, database_1.execute)('INSERT INTO carts (user_id) VALUES (?)', [userId]);
        return result.insertId;
    }
    catch {
        // Lost an insert race — the unique key on user_id means the row now exists.
        const raced = await (0, database_1.queryOne)('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [
            userId,
        ]);
        if (!raced)
            throw new Error('CART_INIT_FAILED');
        return raced.id;
    }
}
async function getCart(userId) {
    const cartId = await getOrCreateCart(userId);
    return readCart(cartId);
}
async function readCart(cartId) {
    const items = await (0, database_1.query)(`SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, ci.price,
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
      ORDER BY ci.created_at DESC, ci.id DESC`, [cartId]);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + Number(item.line_total), 0);
    const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
    return {
        items,
        summary: {
            item_count: itemCount,
            subtotal: String(round(subtotal)),
            total: String(round(subtotal)),
        },
    };
}
async function addCartItem(userId, productId, quantity) {
    const cartId = await getOrCreateCart(userId);
    const product = await (0, database_1.queryOne)('SELECT stock_quantity AS stock, price, sale_price, status FROM products WHERE id = ? LIMIT 1', [productId]);
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    if (product.status !== 'active')
        throw ApiError_1.ApiError.badRequest('This product is not available for purchase');
    const unitPrice = product.sale_price ?? product.price;
    const existing = await (0, database_1.queryOne)('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1', [cartId, productId]);
    const desiredQty = (existing?.quantity ?? 0) + quantity;
    if (desiredQty > Number(product.stock)) {
        throw ApiError_1.ApiError.badRequest(`Only ${product.stock} unit(s) of this product are in stock`, { available: Number(product.stock) });
    }
    if (existing) {
        // Refresh the price snapshot so a price change is reflected in the cart.
        await (0, database_1.execute)('UPDATE cart_items SET quantity = ?, price = ? WHERE id = ?', [
            desiredQty,
            unitPrice,
            existing.id,
        ]);
    }
    else {
        await (0, database_1.execute)('INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [cartId, productId, quantity, unitPrice]);
    }
    return readCart(cartId);
}
async function updateCartItemQuantity(userId, itemId, quantity) {
    const cartId = await getOrCreateCart(userId);
    const item = await (0, database_1.queryOne)(`SELECT ci.id, ci.quantity, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
      WHERE ci.id = ? AND ci.cart_id = ? LIMIT 1`, [itemId, cartId]);
    if (!item)
        throw ApiError_1.ApiError.notFound('Cart item not found');
    if (quantity > Number(item.stock_quantity)) {
        throw ApiError_1.ApiError.badRequest(`Only ${item.stock_quantity} unit(s) available`, {
            available: Number(item.stock_quantity),
        });
    }
    await (0, database_1.execute)('UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?', [
        quantity,
        itemId,
        cartId,
    ]);
    return readCart(cartId);
}
async function removeCartItem(userId, itemId) {
    const cartId = await getOrCreateCart(userId);
    const result = await (0, database_1.execute)('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [
        itemId,
        cartId,
    ]);
    if (result.affectedRows === 0)
        throw ApiError_1.ApiError.notFound('Cart item not found');
    return readCart(cartId);
}
async function clearCart(userId) {
    const cart = await (0, database_1.queryOne)('SELECT id FROM carts WHERE user_id = ? LIMIT 1', [userId]);
    if (!cart)
        return;
    await (0, database_1.execute)('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
}
async function cartCount(userId) {
    const row = await (0, database_1.queryOne)(`SELECT COALESCE(SUM(ci.quantity), 0) AS total
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
      WHERE c.user_id = ?`, [userId]);
    return Number(row?.total ?? 0);
}
// ---------------------------------------------------------------- wishlists
async function listWishlist(userId) {
    return (0, database_1.query)(`SELECT w.id AS wishlist_id, p.*,
            (SELECT pi.image FROM product_images pi WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS primary_image,
            (SELECT ROUND(AVG(r.rating), 2) FROM reviews r
              WHERE r.product_id = p.id AND r.status = 'approved')    AS avg_rating,
            (SELECT COUNT(*) FROM reviews r
              WHERE r.product_id = p.id AND r.status = 'approved')    AS review_count
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC`, [userId]);
}
async function addToWishlist(userId, productId) {
    const product = await (0, database_1.queryOne)('SELECT id FROM products WHERE id = ? LIMIT 1', [
        productId,
    ]);
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    // INSERT IGNORE makes the endpoint idempotent per the (user_id, product_id) key.
    await (0, database_1.execute)('INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)', [
        userId,
        productId,
    ]);
}
async function removeFromWishlist(userId, productId) {
    const result = await (0, database_1.execute)('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [
        userId,
        productId,
    ]);
    return result.affectedRows > 0;
}
async function isInWishlist(userId, productId) {
    const row = await (0, database_1.queryOne)('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1', [userId, productId]);
    return row !== null;
}
/** Count wishlist entries per product — used to show hearts on product cards. */
async function wishlistCounts(productIds) {
    if (productIds.length === 0)
        return new Map();
    const placeholders = productIds.map(() => '?').join(', ');
    const rows = await (0, database_1.query)(`SELECT product_id, COUNT(*) AS total FROM wishlists
      WHERE product_id IN (${placeholders}) GROUP BY product_id`, productIds);
    return new Map(rows.map((row) => [Number(row.product_id), Number(row.total)]));
}
/** Move a wishlisted product into the cart, then drop it from the wishlist. */
async function moveWishlistItemToCart(userId, productId) {
    const inWishlist = await isInWishlist(userId, productId);
    if (!inWishlist)
        throw ApiError_1.ApiError.notFound('Product is not in your wishlist');
    const cart = await addCartItem(userId, productId, 1);
    await removeFromWishlist(userId, productId);
    return cart;
}
// Clear a cart as part of checkout, inside the checkout transaction.
async function clearCartWithConnection(connection, userId) {
    await connection.execute('DELETE ci FROM cart_items ci JOIN carts c ON c.id = ci.cart_id WHERE c.user_id = ?', [userId]);
}
//# sourceMappingURL=cart.model.js.map