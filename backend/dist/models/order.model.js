"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_ITEM_IMAGE_SQL = void 0;
exports.listOrders = listOrders;
exports.allOrders = allOrders;
exports.findOrderById = findOrderById;
exports.listOrderItems = listOrderItems;
exports.listOrderStatusHistory = listOrderStatusHistory;
exports.findPaymentByOrder = findPaymentByOrder;
exports.setPaymentTransaction = setPaymentTransaction;
exports.markOrderPaid = markOrderPaid;
exports.createOrder = createOrder;
exports.updateOrder = updateOrder;
exports.updateOrderStatus = updateOrderStatus;
exports.deleteOrder = deleteOrder;
exports.orderStats = orderStats;
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
const jwt_1 = require("../utils/jwt");
const pricing_1 = require("../utils/pricing");
/** Logical sort field -> SQL expression (customer comes from the joined user, item_count is computed). */
const SORTABLE = {
    id: 'o.id',
    order_number: 'o.order_number',
    order_status: 'o.order_status',
    payment_status: 'o.payment_status',
    payment_method: 'o.payment_method',
    grand_total: 'o.grand_total',
    subtotal: 'o.subtotal',
    created_at: 'o.created_at',
    customer_name: 'u.full_name',
    item_count: 'item_count',
};
/**
 * The image to show for an order line, given an `oi` (order_items) alias.
 *
 * `order_items.product_image` is a snapshot taken at checkout, but the file it
 * points at is deleted when the product's photo is replaced. Prefer the
 * product's current primary image and fall back to the snapshot so old orders
 * keep working after a catalogue update (and still show something for products
 * that have since been deleted).
 */
exports.ORDER_ITEM_IMAGE_SQL = `COALESCE(
  (SELECT pi.image FROM product_images pi
    WHERE pi.product_id = oi.product_id
    ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1),
  oi.product_image
)`;
/** The canonical order listing, shared by the admin table and the CSV export. */
const ORDER_SELECT = `
  SELECT o.*,
         u.full_name AS customer_name,
         u.email     AS customer_email,
         u.avatar    AS customer_avatar,
         a.city      AS city,
         a.province  AS province,
         (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
         (SELECT ${exports.ORDER_ITEM_IMAGE_SQL} FROM order_items oi WHERE oi.order_id = o.id
           ORDER BY oi.id ASC LIMIT 1) AS product_thumb
    FROM orders o
    LEFT JOIN users u     ON u.id = o.user_id
    LEFT JOIN addresses a ON a.id = o.shipping_address_id`;
function buildWhere(filters) {
    const where = [];
    const params = [];
    const search = (0, pagination_1.buildSearchFilter)(filters.search, [
        'o.order_number',
        'u.full_name',
        'u.email',
        'o.notes',
    ]);
    if (search.clause) {
        where.push(search.clause);
        params.push(...search.params);
    }
    if (filters.status) {
        where.push('o.order_status = ?');
        params.push(filters.status);
    }
    if (filters.payment_status) {
        where.push('o.payment_status = ?');
        params.push(filters.payment_status);
    }
    if (filters.payment_method) {
        where.push('o.payment_method = ?');
        params.push(filters.payment_method);
    }
    if (filters.customer_id) {
        where.push('o.user_id = ?');
        params.push(filters.customer_id);
    }
    if (filters.from) {
        where.push('DATE(o.created_at) >= ?');
        params.push(filters.from);
    }
    if (filters.to) {
        where.push('DATE(o.created_at) <= ?');
        params.push(filters.to);
    }
    if (filters.min_total !== undefined) {
        where.push('o.grand_total >= ?');
        params.push(filters.min_total);
    }
    if (filters.max_total !== undefined) {
        where.push('o.grand_total <= ?');
        params.push(filters.max_total);
    }
    return { sql: where.length ? ` WHERE ${where.join(' AND ')}` : '', params };
}
async function listOrders(filters) {
    const { sql: whereSql, params } = buildWhere(filters);
    const sortColumn = (0, pagination_1.safeSortExpression)(filters.sortBy, SORTABLE, 'id');
    const direction = filters.sortDir === 'asc' ? 'ASC' : 'DESC';
    const countRow = await (0, database_1.queryOne)(`SELECT COUNT(*) AS total FROM orders o LEFT JOIN users u ON u.id = o.user_id ${whereSql}`, params);
    const total = Number(countRow?.total ?? 0);
    const rows = await (0, database_1.query)(`${ORDER_SELECT}${whereSql} ORDER BY ${sortColumn} ${direction}, o.id DESC LIMIT ? OFFSET ?`, [...params, filters.pageSize, (filters.page - 1) * filters.pageSize]);
    return (0, pagination_1.buildPagedResult)(rows, total, filters.page, filters.pageSize);
}
/** Unpaginated variant for CSV export — same filters, no LIMIT. */
async function allOrders(filters) {
    const { sql: whereSql, params } = buildWhere(filters);
    const sortColumn = (0, pagination_1.safeSortExpression)(filters.sortBy, SORTABLE, 'id');
    const direction = filters.sortDir === 'asc' ? 'ASC' : 'DESC';
    return (0, database_1.query)(`${ORDER_SELECT}${whereSql} ORDER BY ${sortColumn} ${direction}, o.id DESC LIMIT 10000`, params);
}
async function findOrderById(id) {
    return (0, database_1.queryOne)(`${ORDER_SELECT} WHERE o.id = ? LIMIT 1`, [id]);
}
async function listOrderItems(orderId) {
    return (0, database_1.query)(`SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.sku,
            ${exports.ORDER_ITEM_IMAGE_SQL} AS product_image,
            oi.quantity, oi.price, oi.total, oi.created_at, oi.updated_at
       FROM order_items oi
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC`, [orderId]);
}
async function listOrderStatusHistory(orderId) {
    return (0, database_1.query)(`SELECT h.*, u.full_name AS created_by_name
       FROM order_status_history h
       LEFT JOIN users u ON u.id = h.created_by
      WHERE h.order_id = ?
      ORDER BY h.created_at ASC, h.id ASC`, [orderId]);
}
async function findPaymentByOrder(orderId) {
    return (0, database_1.queryOne)('SELECT * FROM payments WHERE order_id = ? LIMIT 1', [orderId]);
}
/** Record the gateway reference (e.g. a Stripe Checkout Session id) on an order. */
async function setPaymentTransaction(orderId, transactionId) {
    await (0, database_1.execute)('UPDATE payments SET transaction_id = ? WHERE order_id = ?', [
        transactionId,
        orderId,
    ]);
}
/**
 * Mark an order as paid after the gateway confirms the charge. Idempotent: a
 * duplicate webhook or a double page refresh cannot charge or record twice.
 */
async function markOrderPaid(orderId, transactionId, note = 'Payment received') {
    return (0, database_1.transaction)(async (connection) => {
        const [rows] = await connection.execute('SELECT order_status, payment_status FROM orders WHERE id = ? FOR UPDATE', [orderId]);
        if (rows.length === 0)
            return false;
        const current = rows[0];
        // Already settled (duplicate webhook or page refresh): report "no change".
        if (current.payment_status === 'Paid')
            return false;
        await connection.execute('UPDATE orders SET payment_status = ? WHERE id = ?', ['Paid', orderId]);
        await connection.execute('UPDATE payments SET status = ?, transaction_id = ?, paid_at = ? WHERE order_id = ?', ['Paid', transactionId, new Date(), orderId]);
        await connection.execute('INSERT INTO order_status_history (order_id, status, note, created_by) VALUES (?, ?, ?, NULL)', [orderId, current.order_status, note]);
        return true;
    });
}
/**
 * Create an order with full inventory integrity, atomically.
 *
 * Steps (all inside one transaction):
 *   1. Lock every product row, verify stock, and re-read live prices
 *   2. Apply the coupon and recompute subtotal / discount / tax / grand total
 *   3. Insert the order, its items, its payment row, and its first history entry
 *   4. Decrement stock and write inventory_logs entries
 *
 * Pricing is always taken from the database here, never from the request body,
 * so a client cannot dictate what it pays.
 */
async function createOrder(data) {
    return (0, database_1.transaction)(async (connection) => {
        const placeholders = data.items.map(() => '?').join(', ');
        const productIds = data.items.map((item) => item.product_id);
        const [productRows] = await connection.execute(`SELECT p.id, p.name, p.sku, p.price, p.sale_price, p.stock_quantity, p.status,
              pi.image AS primary_image
         FROM products p
         LEFT JOIN product_images pi
           ON pi.id = (SELECT id FROM product_images
                        WHERE product_id = p.id
                        ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1)
        WHERE p.id IN (${placeholders})
        FOR UPDATE`, productIds);
        if (productRows.length !== data.items.length) {
            throw new Error('PRODUCT_NOT_FOUND');
        }
        const productMap = new Map();
        for (const row of productRows)
            productMap.set(Number(row.id), row);
        let subtotal = 0;
        const lineItems = [];
        for (const item of data.items) {
            const product = productMap.get(item.product_id);
            if (!product)
                throw new Error('PRODUCT_NOT_FOUND');
            if (product.status !== 'active')
                throw new Error('PRODUCT_INACTIVE');
            if (Number(product.stock_quantity) < item.quantity)
                throw new Error('INSUFFICIENT_STOCK');
            const unitPrice = Number(product.sale_price ?? product.price);
            const lineTotal = (0, pricing_1.round2)(unitPrice * item.quantity);
            subtotal += lineTotal;
            lineItems.push({
                product_id: item.product_id,
                product_name: String(product.name),
                sku: String(product.sku),
                product_image: product.primary_image ?? null,
                quantity: item.quantity,
                price: unitPrice,
                total: lineTotal,
            });
        }
        subtotal = (0, pricing_1.round2)(subtotal);
        // ---- coupon -----------------------------------------------------------
        let discount = 0;
        if (data.couponCode) {
            const [couponRows] = await connection.execute(`SELECT * FROM coupons
          WHERE code = ? AND status = 'active'
            AND start_date <= NOW() AND end_date >= NOW()
          LIMIT 1`, [data.couponCode]);
            const coupon = couponRows[0];
            if (coupon) {
                const alreadyUsed = await connection.execute('SELECT id FROM coupon_usages WHERE coupon_id = ? AND user_id = ? LIMIT 1', [coupon.id, data.userId ?? 0]);
                const withinLimit = coupon.usage_limit === null || Number(coupon.used_count) < Number(coupon.usage_limit);
                const meetsMinimum = subtotal >= Number(coupon.minimum_order);
                if (withinLimit && meetsMinimum && alreadyUsed[0].length === 0) {
                    discount =
                        coupon.type === 'percentage'
                            ? (0, pricing_1.round2)((subtotal * Number(coupon.value)) / 100)
                            : Number(coupon.value);
                    if (coupon.maximum_discount !== null) {
                        discount = Math.min(discount, Number(coupon.maximum_discount));
                    }
                    discount = (0, pricing_1.round2)(Math.max(0, Math.min(discount, subtotal)));
                }
            }
        }
        const [settingRows] = await connection.execute(`SELECT \`key\`, value FROM settings
        WHERE \`key\` IN ('tax_rate', 'shipping_fee', 'free_shipping_threshold')`);
        const settings = new Map();
        for (const row of settingRows)
            settings.set(String(row.key), Number(row.value));
        // Shared with `getCartSummary` so the quoted total and the charged total
        // can never disagree. `tax_rate` is a whole percentage, and free delivery is
        // a store-wide promotion rather than a per-order override.
        const totals = (0, pricing_1.computeTotals)({
            subtotal,
            discount,
            taxRatePercent: data.taxOverride ?? settings.get('tax_rate'),
            shippingFee: data.shippingFeeOverride ?? settings.get('shipping_fee'),
            freeShippingThreshold: settings.get('free_shipping_threshold'),
        });
        const { shippingFee: shipping, tax, grandTotal } = totals;
        // ---- order ------------------------------------------------------------
        const orderNumber = (0, jwt_1.randomOrderNumber)();
        const [orderResult] = await connection.execute(`INSERT INTO orders (user_id, order_number, subtotal, discount, shipping_fee, tax, grand_total,
                           payment_method, payment_status, order_status, shipping_address_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            data.userId,
            orderNumber,
            subtotal,
            discount,
            shipping,
            tax,
            grandTotal,
            data.paymentMethod,
            data.paymentStatus,
            data.orderStatus,
            data.shippingAddressId,
            data.notes ?? null,
        ]);
        const orderId = orderResult.insertId;
        for (const line of lineItems) {
            await connection.execute(`INSERT INTO order_items (order_id, product_id, product_name, sku, product_image, quantity, price, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [orderId, line.product_id, line.product_name, line.sku, line.product_image, line.quantity, line.price, line.total]);
        }
        await connection.execute(`INSERT INTO payments (order_id, payment_gateway, amount, currency, status, paid_at)
       VALUES (?, ?, ?, ?, ?, ?)`, [
            orderId,
            data.paymentMethod,
            grandTotal,
            data.currency ?? 'PHP',
            data.paymentStatus,
            data.paymentStatus === 'Paid' ? new Date() : null,
        ]);
        await connection.execute('INSERT INTO order_status_history (order_id, status, note, created_by) VALUES (?, ?, ?, ?)', [orderId, data.orderStatus, 'Order created', data.createdBy ?? null]);
        if (data.couponCode && discount > 0) {
            await connection.execute('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?', [data.couponCode]);
            await connection.execute('INSERT INTO coupon_usages (coupon_id, user_id, order_id, discount_amount) VALUES ((SELECT id FROM coupons WHERE code = ?), ?, ?, ?)', [data.couponCode, data.userId, orderId, discount]);
        }
        // ---- stock ------------------------------------------------------------
        for (const line of lineItems) {
            await connection.execute('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [line.quantity, line.product_id]);
            await connection.execute(`INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by)
         VALUES (?, 'stock_out', ?, ?, 'Order placed', ?)`, [line.product_id, -line.quantity, orderNumber, data.createdBy ?? null]);
        }
        return orderId;
    });
}
const ORDER_FIELDS = [
    'order_status',
    'payment_status',
    'payment_method',
    'shipping_address_id',
    'notes',
    'shipping_fee',
    'tax',
    'discount',
];
async function updateOrder(id, data) {
    const entries = Object.entries(data).filter(([key, value]) => ORDER_FIELDS.includes(key) && value !== undefined);
    if (entries.length === 0)
        return false;
    // Recompute grand_total whenever a money component changes, so the order
    // never stores an internally inconsistent set of totals.
    const touchesTotals = entries.some(([key]) => ['shipping_fee', 'tax', 'discount'].includes(key));
    if (touchesTotals) {
        const current = await (0, database_1.queryOne)('SELECT subtotal, discount, shipping_fee, tax FROM orders WHERE id = ? LIMIT 1', [id]);
        if (current) {
            const pick = (key, fallback) => {
                const override = entries.find(([name]) => name === key)?.[1];
                return override === undefined ? Number(fallback) : Number(override);
            };
            const subtotal = Number(current.subtotal);
            const discount = pick('discount', current.discount);
            const shippingFee = pick('shipping_fee', current.shipping_fee);
            const tax = pick('tax', current.tax);
            entries.push(['grand_total', (0, pricing_1.round2)(Math.max(0, subtotal - discount + shippingFee + tax))]);
        }
    }
    const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const result = await (0, database_1.execute)(`UPDATE orders SET ${setSql} WHERE id = ?`, [
        ...entries.map(([, value]) => value),
        id,
    ]);
    return result.affectedRows > 0;
}
/**
 * Advance an order's status, recording history, syncing the payment row, and
 * reversing stock when an order is cancelled or returned.
 */
async function updateOrderStatus(data) {
    return (0, database_1.transaction)(async (connection) => {
        const [rows] = await connection.execute('SELECT * FROM orders WHERE id = ? FOR UPDATE', [data.orderId]);
        if (rows.length === 0)
            throw new Error('ORDER_NOT_FOUND');
        const previous = rows[0];
        const previousStatus = previous.order_status;
        const nextPaymentStatus = data.paymentStatus ?? previous.payment_status;
        await connection.execute('UPDATE orders SET order_status = ?, payment_status = ? WHERE id = ?', [data.orderStatus, nextPaymentStatus, data.orderId]);
        await connection.execute('INSERT INTO order_status_history (order_id, status, note, created_by) VALUES (?, ?, ?, ?)', [data.orderId, data.orderStatus, data.note ?? `Status changed from ${previousStatus}`, data.userId]);
        await connection.execute('UPDATE payments SET status = ?, paid_at = ? WHERE order_id = ?', [nextPaymentStatus, nextPaymentStatus === 'Paid' ? new Date() : null, data.orderId]);
        // Cancelling or returning puts the units back on the shelf. Moving out of
        // those states takes them out again, so the operation is reversible.
        const wasClosed = previousStatus === 'Cancelled' || previousStatus === 'Returned';
        const isClosed = data.orderStatus === 'Cancelled' || data.orderStatus === 'Returned';
        let restocked = 0;
        if (!wasClosed && isClosed) {
            const [items] = await connection.execute('SELECT product_id, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL', [data.orderId]);
            for (const item of items) {
                await connection.execute('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
                await connection.execute(`INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by)
           VALUES (?, ?, ?, ?, ?, ?)`, [
                    item.product_id,
                    data.orderStatus === 'Returned' ? 'return' : 'adjustment',
                    item.quantity,
                    previous.order_number,
                    `Order ${data.orderStatus.toLowerCase()}`,
                    data.userId,
                ]);
                restocked += 1;
            }
        }
        else if (wasClosed && !isClosed) {
            const [items] = await connection.execute(`SELECT oi.product_id, oi.quantity
           FROM order_items oi
           JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ? AND p.stock_quantity >= oi.quantity`, [data.orderId]);
            for (const item of items) {
                await connection.execute('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
                restocked += 1;
            }
        }
        return { order: previous, restocked };
    });
}
async function deleteOrder(id) {
    return (0, database_1.transaction)(async (connection) => {
        // Put stock back before the order (and its items) disappear.
        const [items] = await connection.execute('SELECT product_id, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL', [id]);
        const [statusRows] = await connection.execute('SELECT order_status, order_number FROM orders WHERE id = ?', [id]);
        if (statusRows.length === 0)
            return false;
        const orderStatus = String(statusRows[0].order_status);
        if (orderStatus !== 'Cancelled' && orderStatus !== 'Returned') {
            for (const item of items) {
                await connection.execute('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
                await connection.execute(`INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks)
           VALUES (?, 'adjustment', ?, ?, 'Order deleted, stock returned')`, [item.product_id, item.quantity, statusRows[0].order_number]);
            }
        }
        const [result] = await connection.execute('DELETE FROM orders WHERE id = ?', [id]);
        return result.affectedRows > 0;
    });
}
async function orderStats() {
    return ((await (0, database_1.queryOne)(`
      SELECT
        COUNT(*)                                                           AS total_orders,
        COALESCE(SUM(order_status IN ('Pending','Processing')), 0)         AS open_orders,
        COALESCE(SUM(payment_status = 'Paid'), 0)                          AS paid_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'Paid' AND order_status <> 'Cancelled'
                          AND order_status <> 'Returned' THEN grand_total ELSE 0 END), 0) AS total_revenue,
        COALESCE(ROUND(AVG(CASE WHEN payment_status = 'Paid' AND order_status <> 'Cancelled'
                          AND order_status <> 'Returned' THEN grand_total END), 2), 0)       AS average_order_value,
        COALESCE(SUM(payment_status = 'Pending'), 0)                       AS pending_payment,
        COALESCE(SUM(order_status = 'Cancelled'), 0)                       AS cancelled_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'Paid' AND order_status <> 'Cancelled'
                          AND order_status <> 'Returned' THEN grand_total - shipping_fee - tax ELSE 0 END), 0) AS net_revenue
      FROM orders
    `)) ?? {});
}
//# sourceMappingURL=order.model.js.map