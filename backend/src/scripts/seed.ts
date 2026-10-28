import type { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import { pool, closePool, query, execute, transaction } from '../config/database';
import { env } from '../config/env';
import { hashPassword } from '../utils/password';
import { logger } from '../utils/logger';
import { writePlaceholder } from './placeholders';
import {
  ADDRESSES,
  BRANDS,
  CATEGORIES,
  COUPONS,
  FILES,
  NOTIFICATIONS,
  PRODUCTS,
  PASSWORD_ADMIN,
  PASSWORD_CUSTOMER,
  PASSWORD_STAFF,
  REVIEW_BUCKETS,
  SETTINGS,
  USERS,
  type SeedProduct,
} from './seedData';

// ============================================================================
//  Deterministic pseudo-randomness
//  A fixed seed means `db:seed` produces the same demo data every time, which
//  makes screenshots, tests and bug reports reproducible.
// ============================================================================
let seedState = 0x2f6e2b1;
function random(): number {
  // xorshift32
  seedState ^= seedState << 13;
  seedState ^= seedState >>> 17;
  seedState ^= seedState << 5;
  seedState >>>= 0;
  return seedState / 0xffffffff;
}
const randInt = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];

/** Weighted pick: `[[value, weight], ...]`. */
function weighted<T>(entries: ReadonlyArray<readonly [T, number]>): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

const money = (value: number) => Number(value.toFixed(2));

function mysqlDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

const daysAgo = (days: number, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ============================================================================
//  Seed steps
// ============================================================================

async function wipe(connection: PoolConnection): Promise<void> {
  // The migration drops and recreates every table, but `db:seed` can also be
  // run on its own — clear the data in dependency order so a re-run is clean.
  const tables = [
    'notifications',
    'files',
    'user_activities',
    'login_histories',
    'password_resets',
    'sessions',
    'inventory_logs',
    'coupon_usages',
    'coupons',
    'reviews',
    'payments',
    'order_status_history',
    'order_items',
    'orders',
    'wishlists',
    'cart_items',
    'carts',
    'addresses',
    'product_specifications',
    'product_images',
    'products',
    'brands',
    'categories',
    'users',
    'settings',
  ];
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    await connection.query(`TRUNCATE TABLE \`${table}\``);
  }
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function seedSettings(connection: PoolConnection): Promise<void> {
  for (const setting of SETTINGS) {
    await connection.execute(
      'INSERT INTO settings (`key`, `group`, value) VALUES (?, ?, ?)',
      [setting.key, setting.group, setting.value]
    );
  }
  logger.info(`Settings: ${SETTINGS.length}`);
}

async function seedUsers(connection: PoolConnection): Promise<Map<string, number>> {
  // Three bcrypt hashes for the whole seed: hashing 27 users at cost 12 would
  // add ~20s for no benefit, since the same plaintext produces the same hash
  // for every user that shares it.
  const [adminHash, staffHash, customerHash] = await Promise.all([
    hashPassword(PASSWORD_ADMIN),
    hashPassword(PASSWORD_STAFF),
    hashPassword(PASSWORD_CUSTOMER),
  ]);
  const hashFor = (role: string) =>
    role === 'admin' ? adminHash : role === 'staff' ? staffHash : customerHash;

  const ids = new Map<string, number>();
  for (const [index, user] of USERS.entries()) {
    // Spread creation dates over the last 14 months so "new this month" and
    // the customer growth chart have something to show.
    const created = daysAgo(randInt(5, 420), randInt(8, 20), randInt(0, 59));
    const lastLogin =
      user.status === 'active' ? daysAgo(randInt(0, 20), randInt(7, 22), randInt(0, 59)) : null;

    const [result] = await connection.execute(
      `INSERT INTO users
         (full_name, email, password, phone, avatar, role, status, email_verified, last_login_at, last_login_ip, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.full_name,
        user.email,
        hashFor(user.role),
        user.phone,
        writePlaceholder('users', user.full_name, {
          width: 256,
          height: 256,
          label: initials(user.full_name),
          caption: 'lumera',
          shape: 'decor',
          round: true,
        }),
        user.role,
        user.status,
        user.email_verified,
        lastLogin ? mysqlDateTime(lastLogin) : null,
        lastLogin ? `112.${randInt(2, 220)}.${randInt(1, 250)}.${randInt(1, 250)}` : null,
        mysqlDateTime(created),
      ]
    );
    ids.set(user.email, (result as ResultSetHeader).insertId);
    void index;
  }
  logger.info(`Users: ${USERS.length}`);
  return ids;
}

function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter((part) => /^[A-Za-z]/.test(part))
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

async function seedCategories(connection: PoolConnection): Promise<Map<string, number>> {
  const ids = new Map<string, number>();
  // Two passes so a child can reference a parent inserted in the same loop:
  // pass 1 inserts the roots, pass 2 the children.
  for (const pass of ['root', 'child'] as const) {
    for (const category of CATEGORIES) {
      const isRoot = category.parent === null;
      if ((pass === 'root') !== isRoot) continue;

      const [result] = await connection.execute(
        'INSERT INTO categories (parent_id, name, slug, image, description, status) VALUES (?, ?, ?, ?, ?, ?)',
        [
          isRoot ? null : (ids.get(category.parent!) ?? null),
          category.name,
          category.slug,
          writePlaceholder('categories', category.name, {
            width: 640,
            height: 420,
            label: category.name,
            caption: 'collection',
          }),
          category.description,
          category.status,
        ]
      );
      ids.set(category.slug, (result as ResultSetHeader).insertId);
    }
  }
  logger.info(`Categories: ${CATEGORIES.length}`);
  return ids;
}

async function seedBrands(connection: PoolConnection): Promise<Map<string, number>> {
  const ids = new Map<string, number>();
  for (const brand of BRANDS) {
    const [result] = await connection.execute(
      'INSERT INTO brands (name, slug, logo, description, status) VALUES (?, ?, ?, ?, ?)',
      [
        brand.name,
        brand.slug,
        writePlaceholder('brands', brand.name, {
          width: 320,
          height: 320,
          label: initials(brand.name),
          caption: brand.name,
          shape: 'decor',
        }),
        brand.description,
        brand.status,
      ]
    );
    ids.set(brand.name, (result as ResultSetHeader).insertId);
  }
  logger.info(`Brands: ${BRANDS.length}`);
  return ids;
}

interface SeededProduct {
  id: number;
  name: string;
  sku: string;
  slug: string;
  price: number;
  sale_price: number | null;
  categoryId: number;
  primaryImage: string;
  createdAt: Date;
}

function skuFor(product: SeedProduct, index: number): string {
  const base = product.name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 34);
  return `${base}-${String(index + 1).padStart(3, '0')}`;
}

async function seedProducts(
  connection: PoolConnection,
  categoryIds: Map<string, number>,
  brandIds: Map<string, number>
): Promise<SeededProduct[]> {
  const seeded: SeededProduct[] = [];
  const usedSlugs = new Set<string>();
  const usedSkus = new Set<string>();

  for (const [index, product] of PRODUCTS.entries()) {
    let slug = slugify(product.name);
    while (usedSlugs.has(slug)) slug = `${slug}-${index + 1}`;
    usedSlugs.add(slug);

    const baseSku = skuFor(product, index);
    let sku = baseSku;
    let suffix = 1;
    while (usedSkus.has(sku)) {
      suffix += 1;
      sku = `${baseSku}-${suffix}`;
    }
    usedSkus.add(sku);

    // Newer products are more common in the recent window so the storefront
    // "new arrivals" rail is not all two-year-old stock.
    const createdAt = daysAgo(Math.floor(Math.pow(random(), 1.6) * 300), randInt(8, 19), randInt(0, 59));

    const [result] = await connection.execute(
      `INSERT INTO products
         (category_id, brand_id, sku, name, slug, short_description, description, price, sale_price,
          cost_price, weight, dimensions, stock_quantity, minimum_stock, featured, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryIds.get(product.category)!,
        product.brand ? (brandIds.get(product.brand) ?? null) : null,
        sku,
        product.name,
        slug,
        product.short_description,
        product.description,
        money(product.price),
        product.sale_price === null ? null : money(product.sale_price),
        money(product.cost_price),
        product.weight,
        product.dimensions,
        product.stock_quantity,
        product.minimum_stock,
        product.featured,
        product.status,
        mysqlDateTime(createdAt),
      ]
    );
    const id = (result as ResultSetHeader).insertId;

    // Two angles per product: the primary shot plus a detail shot.
    const primaryImage = writePlaceholder('products', product.name, {
      width: 800,
      height: 600,
      label: product.name,
      caption: 'lumera home',
    });
    const detailImage = writePlaceholder('products', `${product.name} detail`, {
      width: 800,
      height: 600,
      label: product.short_description.slice(0, 48),
      caption: 'detail view',
    });

    await connection.execute(
      'INSERT INTO product_images (product_id, image, is_primary, sort_order) VALUES (?, ?, 1, 0), (?, ?, 0, 1)',
      [id, primaryImage, id, detailImage]
    );

    for (const [name, value] of product.specifications) {
      await connection.execute(
        'INSERT INTO product_specifications (product_id, attribute_name, attribute_value) VALUES (?, ?, ?)',
        [id, name, value]
      );
    }

    // Opening stock-in for every product, so the inventory log has a baseline.
    // `inventory_logs.quantity` has a CHECK that forbids zero, so a product
    // seeded as out of stock gets a real intake followed by a write-off that
    // brings the balance back to zero — which is also a more honest log.
    const openingQuantity = product.stock_quantity === 0 ? randInt(4, 12) : product.stock_quantity;
    await connection.execute(
      `INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by, created_at)
       VALUES (?, 'stock_in', ?, 'PO-INITIAL', 'Opening stock intake', 1, ?)`,
      [id, openingQuantity, mysqlDateTime(createdAt)]
    );
    if (product.stock_quantity === 0) {
      const writtenOff = new Date(createdAt.getTime() + 3 * 86400_000);
      await connection.execute(
        `INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by, created_at)
         VALUES (?, 'adjustment', ?, 'STOCK-TAKE', 'Damaged in transit — written off, awaiting supplier claim', 1, ?)`,
        [id, -openingQuantity, mysqlDateTime(writtenOff)]
      );
    }

    seeded.push({
      id,
      name: product.name,
      sku,
      slug,
      price: product.price,
      sale_price: product.sale_price,
      categoryId: categoryIds.get(product.category)!,
      primaryImage,
      createdAt,
    });
  }

  logger.info(`Products: ${seeded.length} (with images and specifications)`);
  return seeded;
}

async function seedAddresses(
  connection: PoolConnection,
  userIds: Map<string, number>
): Promise<Map<string, number>> {
  const ids = new Map<string, number>();
  for (const address of ADDRESSES) {
    const [result] = await connection.execute(
      `INSERT INTO addresses
         (user_id, full_name, phone, address_line_1, address_line_2, city, province, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Philippines', ?)`,
      [
        userIds.get(address.owner)!,
        address.full_name,
        address.phone,
        address.address_line_1,
        address.address_line_2,
        address.city,
        address.province,
        address.postal_code,
        address.is_default,
      ]
    );
    ids.set(address.owner, (result as ResultSetHeader).insertId);
  }
  logger.info(`Addresses: ${ADDRESSES.length}`);
  return ids;
}

interface SeededOrder {
  id: number;
  userId: number | null;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  grandTotal: number;
  createdAt: Date;
}

const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Returned',
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];
const PAYMENT_METHODS = ['cod', 'bank_transfer', 'stripe', 'paypal'] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

async function seedOrders(
  connection: PoolConnection,
  userIds: Map<string, number>,
  addressIds: Map<string, number>,
  products: SeededProduct[],
  adminId: number
): Promise<SeededOrder[]> {
  const customerEmails = USERS.filter((u) => u.role === 'customer' && u.status !== 'blocked').map(
    (u) => u.email
  );
  const withAddresses = customerEmails.filter((email) => addressIds.has(email));
  const orders: SeededOrder[] = [];

  const taxRate = 0.12;
  const shippingFee = 250;
  const freeShippingThreshold = 25000;

  // 66 orders weighted towards recent weeks so the dashboard's 7/30/90-day
  // charts all have a meaningful slope.
  for (let index = 0; index < 66; index += 1) {
    const email = pick(withAddresses);
    const userId = userIds.get(email)!;
    const addressId = addressIds.get(email)!;

    // Days-ago is skewed low: more orders happened recently.
    const daysBack = Math.floor(Math.pow(random(), 1.5) * 118);
    const createdAt = daysAgo(daysBack, randInt(8, 21), randInt(0, 59));

    const status: OrderStatus = weighted([
      ['Delivered', 42],
      ['Shipped', 12],
      ['Processing', 11],
      ['Pending', 13],
      ['Cancelled', 8],
      ['Returned', 6],
    ]);

    const paymentMethod: PaymentMethod = weighted([
      ['cod', 44],
      ['bank_transfer', 24],
      ['stripe', 20],
      ['paypal', 12],
    ]);

    const paymentStatus =
      status === 'Pending' || status === 'Processing'
        ? paymentMethod === 'cod'
          ? 'Pending'
          : weighted([
              ['Paid', 5],
              ['Pending', 3],
            ] as const)
        : status === 'Cancelled'
          ? weighted([
              ['Failed', 4],
              ['Refunded', 3],
            ] as const)
          : status === 'Returned'
            ? 'Refunded'
            : 'Paid';

    // 1-4 distinct products per order.
    const lineCount = randInt(1, 4);
    const chosen = new Map<number, number>();
    for (let i = 0; i < lineCount; i += 1) {
      const product = pick(products);
      chosen.set(product.id, (chosen.get(product.id) ?? 0) + randInt(1, 3));
    }

    const items = [...chosen.entries()].map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId)!;
      const unitPrice = product.sale_price ?? product.price;
      return { product, quantity, unitPrice, total: money(unitPrice * quantity) };
    });

    const subtotal = money(items.reduce((sum, item) => sum + item.total, 0));
    // A third of orders use one of the active coupons.
    const useCoupon = random() < 0.34;
    const coupon = useCoupon ? pick(COUPONS.filter((c) => c.status === 'active')) : null;
    let discount = 0;
    if (coupon && subtotal >= coupon.minimum_order) {
      discount =
        coupon.type === 'percentage'
          ? money(Math.min((subtotal * coupon.value) / 100, coupon.maximum_discount ?? Infinity))
          : money(Math.min(coupon.value, subtotal));
    }
    const shipping = subtotal - discount >= freeShippingThreshold ? 0 : shippingFee;
    const tax = money((subtotal - discount) * taxRate);
    const grandTotal = money(Math.max(0, subtotal - discount + shipping + tax));

    const orderNumber = `LM-${String(240101 + index * 7).slice(-6)}-${String(index + 1).padStart(4, '0')}`;

    const [result] = await connection.execute(
      `INSERT INTO orders
         (user_id, order_number, subtotal, discount, shipping_fee, tax, grand_total,
          payment_method, payment_status, order_status, shipping_address_id, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        orderNumber,
        subtotal,
        discount,
        shipping,
        tax,
        grandTotal,
        paymentMethod,
        paymentStatus,
        status,
        addressId,
        random() < 0.25 ? 'Please call before delivery — gate code required.' : null,
        mysqlDateTime(createdAt),
      ]
    );
    const orderId = (result as ResultSetHeader).insertId;

    for (const item of items) {
      await connection.execute(
        `INSERT INTO order_items
           (order_id, product_id, product_name, sku, product_image, quantity, price, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product.id,
          item.product.name,
          item.product.sku,
          item.product.primaryImage,
          item.quantity,
          money(item.unitPrice),
          item.total,
        ]
      );
      // Stock-out rows, dated at the order time. `created_by` is the customer
      // so the log reads as "this customer took 2".
      await connection.execute(
        `INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by, created_at)
         VALUES (?, 'stock_out', ?, ?, 'Order placed', ?, ?)`,
        [item.product.id, -item.quantity, orderNumber, userId, mysqlDateTime(createdAt)]
      );
    }

    if (coupon && discount > 0) {
      await connection.execute(
        'INSERT INTO coupon_usages (coupon_id, user_id, order_id, discount_amount, created_at) VALUES (?, ?, ?, ?, ?)',
        [
          couponIds.get(coupon.code)!,
          userId,
          orderId,
          discount,
          mysqlDateTime(createdAt),
        ]
      );
    }

    await connection.execute(
      `INSERT INTO payments (order_id, transaction_id, payment_gateway, amount, currency, status, paid_at, created_at)
       VALUES (?, ?, ?, ?, 'PHP', ?, ?, ?)`,
      [
        orderId,
        paymentStatus === 'Paid'
          ? `TXN-${paymentMethod.toUpperCase()}-${String(800000 + index * 137).slice(0, 6)}`
          : null,
        paymentMethod,
        grandTotal,
        paymentStatus,
        paymentStatus === 'Paid' ? mysqlDateTime(createdAt) : null,
        mysqlDateTime(createdAt),
      ]
    );

    // ---------------------------------------------------------- tracking
    const timeline: OrderStatus[] =
      status === 'Delivered'
        ? ['Pending', 'Processing', 'Shipped', 'Delivered']
        : status === 'Shipped'
          ? ['Pending', 'Processing', 'Shipped']
          : status === 'Processing'
            ? ['Pending', 'Processing']
            : status === 'Cancelled' || status === 'Returned' || status === 'Pending'
              ? ['Pending']
              : ['Pending'];

    const notes: Record<OrderStatus, string[]> = {
      Pending: ['Order received and awaiting payment confirmation.'],
      Processing: ['Order confirmed', 'Picked from the warehouse and packed.'],
      Shipped: ['Order confirmed', 'Picked from the warehouse and packed.', 'Handed to the courier.'],
      Delivered: [
        'Order confirmed',
        'Picked from the warehouse and packed.',
        'Handed to the courier.',
        'Delivered to the customer.',
      ],
      Cancelled: ['Order received.', 'Cancelled at customer request.'],
      Returned: ['Order confirmed', 'Picked from the warehouse and packed.', 'Handed to the courier.', 'Returned to the warehouse.'],
    };

    let cursor = new Date(createdAt.getTime());
    for (const [step, stage] of timeline.entries()) {
      if (step > 0) cursor = new Date(cursor.getTime() + randInt(6, 60) * 3600 * 1000);
      if (cursor > new Date()) cursor = new Date();
      await connection.execute(
        `INSERT INTO order_status_history (order_id, status, note, created_by, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, stage, pick(notes[stage]), adminId, mysqlDateTime(cursor)]
      );
    }

    if (status === 'Returned') {
      await connection.execute(
        `INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by, created_at)
         VALUES (?, 'return', ?, ?, 'Return restocked', ?, NOW())`,
        [items[0].product.id, items[0].quantity, orderNumber, adminId]
      );
    }

    orders.push({
      id: orderId,
      userId,
      orderNumber,
      status,
      paymentStatus,
      paymentMethod,
      grandTotal,
      createdAt,
    });
  }

  // Guarantee a "today" and a "yesterday" row so the dashboard counters are not
  // empty on a freshly seeded database. Both are Processing/Paid so the
  // day-over-day revenue comparison is a real ratio, not a divide-by-zero.
  const extraOrders = 2;
  for (let extra = 0; extra < extraOrders; extra += 1) {
    const email = pick(withAddresses);
    const userId = userIds.get(email)!;
    const product = pick(products);
    const unitPrice = product.sale_price ?? product.price;
    // Yesterday's order is kept smaller than today's so the "vs yesterday"
    // arrow on the dashboard has a meaningful positive delta.
    const quantity = extra === 0 ? randInt(1, 2) : 1;
    const subtotal = money(unitPrice * quantity);
    const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
    const tax = money(subtotal * taxRate);
    const grandTotal = money(subtotal + shipping + tax);
    const createdAt =
      extra === 0 ? daysAgo(0, randInt(9, 17), randInt(0, 59)) : daysAgo(1, randInt(9, 20), randInt(0, 59));
    const orderNumber = `LM-2609-${String(extra + 1).padStart(4, '0')}`;
    const paymentMethod = pick(PAYMENT_METHODS);

    const [result] = await connection.execute(
      `INSERT INTO orders
         (user_id, order_number, subtotal, discount, shipping_fee, tax, grand_total,
          payment_method, payment_status, order_status, shipping_address_id, notes, created_at)
       VALUES (?, ?, ?, 0.00, ?, ?, ?, ?, 'Paid', 'Processing', ?, NULL, ?)`,
      [
        userId,
        orderNumber,
        subtotal,
        shipping,
        tax,
        grandTotal,
        paymentMethod,
        addressIds.get(email)!,
        mysqlDateTime(createdAt),
      ]
    );
    const orderId = (result as ResultSetHeader).insertId;

    await connection.execute(
      `INSERT INTO order_items (order_id, product_id, product_name, sku, product_image, quantity, price, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, product.id, product.name, product.sku, product.primaryImage, quantity, money(unitPrice), subtotal]
    );
    await connection.execute(
      `INSERT INTO payments (order_id, transaction_id, payment_gateway, amount, currency, status, paid_at, created_at)
       VALUES (?, ?, ?, ?, 'PHP', 'Paid', ?, ?)`,
      [
        orderId,
        `TXN-${paymentMethod.toUpperCase()}-${String(910000 + extra * 91)}`,
        paymentMethod,
        grandTotal,
        mysqlDateTime(createdAt),
        mysqlDateTime(createdAt),
      ]
    );
    for (const [step, stage] of (['Pending', 'Processing'] as const).entries()) {
      const at = new Date(createdAt.getTime() + step * 5 * 3600 * 1000);
      await connection.execute(
        `INSERT INTO order_status_history (order_id, status, note, created_by, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          stage,
          stage === 'Pending' ? 'Order received and payment confirmed.' : 'Picked from the warehouse and packed.',
          adminId,
          mysqlDateTime(at > new Date() ? new Date() : at),
        ]
      );
    }

    orders.push({
      id: orderId,
      userId,
      orderNumber,
      status: 'Processing',
      paymentStatus: 'Paid',
      paymentMethod,
      grandTotal,
      createdAt,
    });
  }

  logger.info(`Orders: ${orders.length} (with items, payments and tracking)`);
  return orders;
}

// Populated in main() before seedOrders runs; coupon codes are needed for
// coupon_usages rows.
let couponIds = new Map<string, number>();

async function seedCoupons(connection: PoolConnection): Promise<void> {
  couponIds = new Map<string, number>();
  const now = new Date();
  for (const coupon of COUPONS) {
    const start = new Date(now.getTime() + coupon.start_offset_days * 86400_000);
    const end = new Date(now.getTime() + coupon.end_offset_days * 86400_000);
    const [result] = await connection.execute(
      `INSERT INTO coupons
         (code, type, value, minimum_order, maximum_discount, usage_limit, used_count, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        coupon.code,
        coupon.type,
        money(coupon.value),
        money(coupon.minimum_order),
        coupon.maximum_discount === null ? null : money(coupon.maximum_discount),
        coupon.usage_limit,
        coupon.used_count,
        mysqlDateTime(start),
        mysqlDateTime(end),
        coupon.status,
      ]
    );
    couponIds.set(coupon.code, (result as ResultSetHeader).insertId);
  }
  logger.info(`Coupons: ${COUPONS.length}`);
}

async function seedReviews(
  connection: PoolConnection,
  userIds: Map<string, number>,
  orders: SeededOrder[],
  products: SeededProduct[]
): Promise<void> {
  const customers = USERS.filter((u) => u.role === 'customer').map((u) => u.email);
  const seen = new Set<string>();
  let count = 0;

  // One review per (customer, product) — the table has a unique key on that
  // pair, so duplicates would abort the insert.
  const attempts = 260;
  for (let i = 0; i < attempts; i += 1) {
    const email = pick(customers);
    const product = pick(products);
    const key = `${email}|${product.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const userId = userIds.get(email)!;
    const rating = weighted([
      [5, 44],
      [4, 28],
      [3, 14],
      [2, 8],
      [1, 6],
    ]);
    const bucket = REVIEW_BUCKETS[rating];

    // ~78% approved, 15% pending, 7% rejected — the moderation queue needs work in it.
    const status = weighted([
      ['approved', 78],
      ['pending', 15],
      ['rejected', 7],
    ]);

    const bought = orders.find((order) => order.userId === userId);
    const createdAt = bought
      ? new Date(bought.createdAt.getTime() + randInt(2, 30) * 86400_000)
      : daysAgo(randInt(1, 90));

    await connection.execute(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        userId,
        rating,
        pick(bucket.titles),
        pick(bucket.bodies),
        status,
        mysqlDateTime(createdAt > new Date() ? new Date() : createdAt),
      ]
    );
    count += 1;
  }
  logger.info(`Reviews: ${count}`);
}

async function seedEngagement(
  connection: PoolConnection,
  userIds: Map<string, number>,
  products: SeededProduct[],
  orders: SeededOrder[],
  adminId: number
): Promise<void> {
  const customers = [...userIds.keys()].filter((email) => email.endsWith('@example.com'));

  // Wishlists
  let wishlists = 0;
  for (const email of customers) {
    if (random() < 0.25) continue;
    const count = randInt(1, 5);
    const chosen = new Set<number>();
    for (let i = 0; i < count; i += 1) chosen.add(pick(products).id);
    for (const productId of chosen) {
      await connection.execute(
        'INSERT INTO wishlists (user_id, product_id, created_at) VALUES (?, ?, ?)',
        [userIds.get(email)!, productId, mysqlDateTime(daysAgo(randInt(0, 60)))]
      );
      wishlists += 1;
    }
  }

  // One live cart so the admin has a non-empty basket to inspect.
  const cartOwner = customers[0];
  const [cartResult] = await connection.execute(
    'INSERT INTO carts (user_id, created_at) VALUES (?, ?)',
    [userIds.get(cartOwner)!, mysqlDateTime(daysAgo(randInt(0, 5)))]
  );
  const cartId = (cartResult as ResultSetHeader).insertId;
  let cartItems = 0;
  const cartProducts = new Set<number>();
  for (let i = 0; i < 3; i += 1) cartProducts.add(pick(products).id);
  for (const productId of cartProducts) {
    const product = products.find((p) => p.id === productId)!;
    await connection.execute(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [cartId, productId, randInt(1, 2), money(product.sale_price ?? product.price)]
    );
    cartItems += 1;
  }

  // A few stock adjustments so the inventory log is not purely mechanical.
  let adjustments = 0;
  for (let i = 0; i < 14; i += 1) {
    const product = pick(products);
    const quantity = pick([2, 3, 5, -2, -1, 10]);
    await connection.execute(
      `INSERT INTO inventory_logs (product_id, type, quantity, reference, remarks, created_by, created_at)
       VALUES (?, 'adjustment', ?, 'STOCK-TAKE', 'Quarterly stock take correction', ?, ?)`,
      [product.id, quantity, adminId, mysqlDateTime(daysAgo(randInt(1, 80)))]
    );
    adjustments += 1;
  }

  // Login history for the admin, staff and a sample of customers.
  let logins = 0;
  for (const email of ['admin@lumerahome.com', 'staff@lumerahome.com', 'divina.santos@lumerahome.com', ...customers.slice(0, 8)]) {
    const userId = userIds.get(email);
    if (!userId) continue;
    for (let i = 0; i < randInt(2, 6); i += 1) {
      const success = random() < 0.85;
      await connection.execute(
        `INSERT INTO login_histories (user_id, email, success, reason, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          success ? userId : null,
          email,
          success ? 1 : 0,
          success ? null : pick(['bad_password', 'unknown_email']),
          `112.${randInt(2, 220)}.${randInt(1, 250)}.${randInt(1, 250)}`,
          pick([
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Version/17.4 Mobile Safari/604.1',
          ]),
          mysqlDateTime(daysAgo(randInt(0, 45), randInt(7, 22), randInt(0, 59))),
        ]
      );
      logins += 1;
    }
  }
  // A couple of failed attempts against an unknown address, to show the audit trail.
  await connection.execute(
    `INSERT INTO login_histories (user_id, email, success, reason, ip_address, user_agent, created_at)
     VALUES (NULL, 'attacker@example.net', 0, 'unknown_email', '45.132.88.14', 'curl/8.4.0', ?),
            (NULL, 'attacker@example.net', 0, 'unknown_email', '45.132.88.14', 'curl/8.4.0', ?)`,
    [mysqlDateTime(daysAgo(3)), mysqlDateTime(daysAgo(3, 20))]
  );
  logins += 2;

  // Activity log entries
  let activities = 0;
  const actions: Array<[string, string]> = [
    ['login', 'user'],
    ['update', 'product'],
    ['update', 'order'],
    ['create', 'coupon'],
    ['update', 'setting'],
  ];
  for (const email of ['admin@lumerahome.com', 'staff@lumerahome.com', 'divina.santos@lumerahome.com']) {
    for (let i = 0; i < 5; i += 1) {
      const [action, entity] = pick(actions);
      await connection.execute(
        `INSERT INTO user_activities (user_id, action, entity, entity_id, description, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userIds.get(email)!,
          action,
          entity,
          randInt(1, 40),
          `${action} on ${entity}`,
          `112.${randInt(2, 220)}.${randInt(1, 250)}.${randInt(1, 250)}`,
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
          mysqlDateTime(daysAgo(randInt(0, 30), randInt(8, 19), randInt(0, 59))),
        ]
      );
      activities += 1;
    }
  }

  // In-app notifications: staff alerts plus a couple for customers.
  let notifications = 0;
  for (const [index, notification] of NOTIFICATIONS.entries()) {
    await connection.execute(
      `INSERT INTO notifications (user_id, title, message, type, link, read_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userIds.get('admin@lumerahome.com')!,
        notification.title,
        notification.message,
        notification.type,
        index % 2 === 0 ? '/admin/orders' : '/admin/dashboard',
        index < 3 ? mysqlDateTime(daysAgo(0, 9)) : null,
        mysqlDateTime(daysAgo(randInt(0, 12), randInt(8, 20))),
      ]
    );
    notifications += 1;
  }
  for (const order of orders.slice(-4)) {
    if (!order.userId) continue;
    await connection.execute(
      `INSERT INTO notifications (user_id, title, message, type, link, read_at, created_at)
       VALUES (?, ?, ?, 'info', '/account/orders', ?, ?)`,
      [
        order.userId,
        `Order ${order.orderNumber} update`,
        `Your order is currently ${order.status.toLowerCase()}.`,
        order.status === 'Delivered' ? mysqlDateTime(daysAgo(0, 12)) : null,
        mysqlDateTime(order.createdAt),
      ]
    );
    notifications += 1;
  }

  logger.info(
    `Engagement: ${wishlists} wishlist rows, ${cartItems} cart items, ${adjustments} adjustments, ` +
      `${logins} login records, ${activities} activities, ${notifications} notifications`
  );
}

async function seedFiles(connection: PoolConnection, adminId: number): Promise<void> {
  let count = 0;
  for (const file of FILES) {
    const path = writePlaceholder('files', file.name, {
      width: 800,
      height: 600,
      label: file.label,
      caption: file.category,
    });
    await connection.execute(
      `INSERT INTO files (name, original_name, path, mime_type, size, category, uploaded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        file.name,
        file.original_name,
        path,
        file.mime_type,
        file.size,
        file.category,
        adminId,
        mysqlDateTime(daysAgo(randInt(1, 120), randInt(9, 18))),
      ]
    );
    count += 1;
  }
  logger.info(`Files: ${count}`);
}

async function summarise(): Promise<void> {
  const tables = [
    'users',
    'categories',
    'brands',
    'products',
    'product_images',
    'product_specifications',
    'orders',
    'order_items',
    'order_status_history',
    'payments',
    'reviews',
    'coupons',
    'coupon_usages',
    'inventory_logs',
    'addresses',
    'wishlists',
    'settings',
    'notifications',
    'files',
  ];
  const parts: string[] = [];
  for (const table of tables) {
    const rows = await query<RowDataPacket & { total: number }>(`SELECT COUNT(*) AS total FROM \`${table}\``);
    parts.push(`${table}=${rows[0]?.total ?? 0}`);
  }
  logger.info(`Row counts → ${parts.join('  ')}`);
}

async function main(): Promise<void> {
  const poolRef: Pool = pool;
  logger.info('Seeding the demo store…');

  // bcrypt the three shared passwords up front so the wipe is not gated on it.
  const started = Date.now();
  void poolRef;

  await transaction(async (connection) => {
    await wipe(connection);
    await seedSettings(connection);
    const userIds = await seedUsers(connection);
    const categoryIds = await seedCategories(connection);
    const brandIds = await seedBrands(connection);
    const products = await seedProducts(connection, categoryIds, brandIds);
    const addressIds = await seedAddresses(connection, userIds);
    await seedCoupons(connection);
    const adminId = userIds.get('admin@lumerahome.com')!;
    const orders = await seedOrders(connection, userIds, addressIds, products, adminId);
    await seedReviews(connection, userIds, orders, products);
    await seedEngagement(connection, userIds, products, orders, adminId);
    await seedFiles(connection, adminId);
  });

  await summarise();
  logger.info(`Seed complete in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  logger.info('');
  logger.info('  Sign in with:');
  logger.info(`    Admin    admin@lumerahome.com  /  ${PASSWORD_ADMIN}`);
  logger.info(`    Staff    staff@lumerahome.com  /  ${PASSWORD_STAFF}`);
  logger.info(`    Customer maria.reyes@example.com  /  ${PASSWORD_CUSTOMER}`);
  logger.info('');
  logger.info(`  Uploads written to ${env.uploads.dir}`);
}

main()
  .then(async () => {
    await closePool();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error('Seed failed', error);
    await execute('SELECT 1').catch(() => undefined);
    await closePool().catch(() => undefined);
    process.exit(1);
  });
