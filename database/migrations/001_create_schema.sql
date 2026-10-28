-- ============================================================================
--  Home Furniture E-Commerce — Core Schema
--  Database: ecommerce_nextjsDB
--  Engine:   InnoDB / utf8mb4_unicode_ci
--
--  Design rules applied throughout:
--    * Every relationship is a real FOREIGN KEY with an explicit ON DELETE rule
--    * Every FK column is indexed (MySQL auto-creates these, restated here for clarity)
--    * CHECK + ENUM constraints enforce domain rules at the storage layer
--    * Money is DECIMAL(12,2) — never FLOAT/DOUBLE
--    * TIMESTAMP columns use DATETIME with explicit defaults so they are predictable
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `ecommerce_nextjsDB`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ecommerce_nextjsDB`;

-- Drop in reverse-dependency order so re-running migrations is safe.
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `files`;
DROP TABLE IF EXISTS `user_activities`;
DROP TABLE IF EXISTS `login_histories`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `inventory_logs`;
DROP TABLE IF EXISTS `coupon_usages`;
DROP TABLE IF EXISTS `coupons`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `order_status_history`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `wishlists`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `product_specifications`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `brands`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `settings`;


-- ============================================================================
--  users
-- ============================================================================
CREATE TABLE `users` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name`      VARCHAR(120)  NOT NULL,
  `email`          VARCHAR(190)  NOT NULL,
  `password`       VARCHAR(255)  NOT NULL COMMENT 'bcrypt hash, never plaintext',
  `phone`          VARCHAR(32)   DEFAULT NULL,
  `avatar`         VARCHAR(255)  DEFAULT NULL,
  `role`           ENUM('admin','customer','staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `status`         ENUM('active','inactive','blocked') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `email_verified` TINYINT(1)    NOT NULL DEFAULT 0,
  `last_login_at`  DATETIME      DEFAULT NULL,
  `last_login_ip`  VARCHAR(45)   DEFAULT NULL,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role`   (`role`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_created`(`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  sessions  (server-side session registry → real logout / revocation)
-- ============================================================================
CREATE TABLE `sessions` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`           BIGINT UNSIGNED NOT NULL,
  `refresh_token_hash` CHAR(64)     NOT NULL COMMENT 'sha256 of the refresh token',
  `user_agent`        VARCHAR(255) DEFAULT NULL,
  `ip_address`        VARCHAR(45)  DEFAULT NULL,
  `expires_at`        DATETIME     NOT NULL,
  `revoked_at`        DATETIME     DEFAULT NULL,
  `last_used_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                       COMMENT 'Bumped on every refresh-token rotation',
  `created_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sessions_refresh` (`refresh_token_hash`),
  KEY `idx_sessions_user`    (`user_id`),
  KEY `idx_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  password_resets  (forgot / reset password tokens)
-- ============================================================================
CREATE TABLE `password_resets` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `token_hash` CHAR(64)     NOT NULL COMMENT 'sha256 of the one-time reset token',
  `expires_at` DATETIME     NOT NULL,
  `used_at`    DATETIME     DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_password_resets_token` (`token_hash`),
  KEY `idx_password_resets_user` (`user_id`),
  CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  login_histories  (secure-login audit trail)
-- ============================================================================
CREATE TABLE `login_histories` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED DEFAULT NULL COMMENT 'NULL for unknown-email attempts',
  `email`      VARCHAR(190) NOT NULL,
  `success`    TINYINT(1)   NOT NULL DEFAULT 0,
  `reason`     VARCHAR(120) DEFAULT NULL COMMENT 'bad_password | user_inactive | user_blocked',
  `ip_address` VARCHAR(45)  DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_login_histories_user`    (`user_id`),
  KEY `idx_login_histories_email`  (`email`),
  KEY `idx_login_histories_created`(`created_at`),
  CONSTRAINT `fk_login_histories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  user_activities  (activity log shown in the admin User Management module)
-- ============================================================================
CREATE TABLE `user_activities` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `action`      VARCHAR(60)  NOT NULL COMMENT 'login | logout | create | update | delete',
  `entity`      VARCHAR(60)  DEFAULT NULL COMMENT 'product | order | user | ...',
  `entity_id`   BIGINT UNSIGNED DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `ip_address`  VARCHAR(45)  DEFAULT NULL,
  `user_agent`  VARCHAR(255) DEFAULT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_activities_user`    (`user_id`),
  KEY `idx_user_activities_created`(`created_at`),
  CONSTRAINT `fk_user_activities_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  categories  (self-referencing tree via parent_id)
-- ============================================================================
CREATE TABLE `categories` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id`   BIGINT UNSIGNED DEFAULT NULL,
  `name`        VARCHAR(120) NOT NULL,
  `slug`        VARCHAR(140) NOT NULL,
  `image`       VARCHAR(255) DEFAULT NULL,
  `description` TEXT         DEFAULT NULL,
  `status`      ENUM('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`),
  KEY `idx_categories_parent` (`parent_id`),
  KEY `idx_categories_status` (`status`),
  -- MySQL refuses a CHECK on a column that participates in a foreign key with
  -- a referential action, so "a category cannot be its own parent" is enforced
  -- in the service layer (category.service.ts walks the ancestor chain).
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  brands
-- ============================================================================
CREATE TABLE `brands` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(120) NOT NULL,
  `slug`        VARCHAR(140) NOT NULL,
  `logo`        VARCHAR(255) DEFAULT NULL,
  `description` TEXT         DEFAULT NULL,
  `status`      ENUM('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_brands_slug` (`slug`),
  KEY `idx_brands_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  products
-- ============================================================================
CREATE TABLE `products` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id`       BIGINT UNSIGNED NOT NULL,
  `brand_id`          BIGINT UNSIGNED DEFAULT NULL,
  `sku`               VARCHAR(64)  NOT NULL,
  `name`              VARCHAR(200) NOT NULL,
  `slug`              VARCHAR(220) NOT NULL,
  `short_description` VARCHAR(500) DEFAULT NULL,
  `description`       TEXT         DEFAULT NULL,
  `price`             DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `sale_price`        DECIMAL(12,2) DEFAULT NULL,
  `cost_price`        DECIMAL(12,2) DEFAULT NULL,
  `weight`            DECIMAL(10,2) DEFAULT NULL COMMENT 'kg',
  `dimensions`        VARCHAR(120) DEFAULT NULL COMMENT 'LxWxH cm',
  `stock_quantity`    INT          NOT NULL DEFAULT 0,
  `minimum_stock`     INT          NOT NULL DEFAULT 5,
  `featured`          TINYINT(1)   NOT NULL DEFAULT 0,
  `status`            ENUM('active','draft','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_sku`  (`sku`),
  UNIQUE KEY `uq_products_slug` (`slug`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_brand`    (`brand_id`),
  KEY `idx_products_status`   (`status`),
  KEY `idx_products_featured` (`featured`),
  KEY `idx_products_stock`    (`stock_quantity`),
  KEY `idx_products_created`  (`created_at`),
  -- Full listing index: covers the default "newest first" browse
  KEY `idx_products_browse` (`status`, `category_id`, `created_at`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_products_price_non_negative` CHECK (`price` >= 0),
  CONSTRAINT `chk_products_stock_non_negative` CHECK (`stock_quantity` >= 0),
  -- A sale price is meaningless unless it is actually below list price
  CONSTRAINT `chk_products_sale_price` CHECK (`sale_price` IS NULL OR `sale_price` < `price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  product_images
-- ============================================================================
CREATE TABLE `product_images` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `image`      VARCHAR(255) NOT NULL,
  `is_primary` TINYINT(1)   NOT NULL DEFAULT 0,
  `sort_order` INT          NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_product` (`product_id`, `sort_order`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  product_specifications
-- ============================================================================
CREATE TABLE `product_specifications` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`      BIGINT UNSIGNED NOT NULL,
  `attribute_name`  VARCHAR(120) NOT NULL,
  `attribute_value` VARCHAR(255) NOT NULL,
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_spec_product_attr` (`product_id`, `attribute_name`),
  KEY `idx_product_specifications_product` (`product_id`),
  CONSTRAINT `fk_product_specifications_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  addresses
-- ============================================================================
CREATE TABLE `addresses` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `full_name`     VARCHAR(120) NOT NULL,
  `phone`         VARCHAR(32)  NOT NULL,
  `address_line_1` VARCHAR(255) NOT NULL,
  `address_line_2` VARCHAR(255) DEFAULT NULL,
  `city`          VARCHAR(120) NOT NULL,
  `province`      VARCHAR(120) DEFAULT NULL,
  `postal_code`   VARCHAR(20)  DEFAULT NULL,
  `country`       VARCHAR(120) NOT NULL DEFAULT 'Philippines',
  `is_default`    TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_addresses_user`    (`user_id`),
  KEY `idx_addresses_default` (`user_id`, `is_default`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  carts  (one per user)
-- ============================================================================
CREATE TABLE `carts` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_carts_user` (`user_id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  cart_items
-- ============================================================================
CREATE TABLE `cart_items` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cart_id`    BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `quantity`   INT NOT NULL DEFAULT 1,
  `price`      DECIMAL(12,2) NOT NULL COMMENT 'Unit price snapshot at add-to-cart time',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_items_product` (`cart_id`, `product_id`),
  KEY `idx_cart_items_product` (`product_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_cart_items_qty` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  wishlists
-- ============================================================================
CREATE TABLE `wishlists` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlists_user_product` (`user_id`, `product_id`),
  KEY `idx_wishlists_product` (`product_id`),
  CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wishlists_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  orders
-- ============================================================================
CREATE TABLE `orders` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Nullable + ON DELETE SET NULL: the admin "Delete Customer" action must not
  -- erase historical sales. An order that outlives its customer is kept, and the
  -- order number still resolves for reporting.
  `user_id`             BIGINT UNSIGNED DEFAULT NULL,
  `order_number`        VARCHAR(32)  NOT NULL,
  `subtotal`            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount`            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `shipping_fee`        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `tax`                 DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `grand_total`         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method`      ENUM('cod','bank_transfer','stripe','paypal') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cod',
  `payment_status`      ENUM('Pending','Paid','Failed','Refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `order_status`        ENUM('Pending','Processing','Shipped','Delivered','Cancelled','Returned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `shipping_address_id` BIGINT UNSIGNED DEFAULT NULL,
  `notes`               TEXT DEFAULT NULL,
  `created_at`          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_number` (`order_number`),
  KEY `idx_orders_user`         (`user_id`),
  KEY `idx_orders_address`      (`shipping_address_id`),
  KEY `idx_orders_status`       (`order_status`),
  KEY `idx_orders_payment`      (`payment_status`),
  KEY `idx_orders_created`      (`created_at`),
  KEY `idx_orders_user_created` (`user_id`, `created_at`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_address` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_orders_totals_non_negative` CHECK (
    `subtotal` >= 0 AND `discount` >= 0 AND `shipping_fee` >= 0 AND `tax` >= 0 AND `grand_total` >= 0
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  order_items
--    product_name / sku / price are denormalised snapshots on purpose: a
--    historical invoice must not change when the product catalogue changes.
-- ============================================================================
CREATE TABLE `order_items` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`     BIGINT UNSIGNED NOT NULL,
  `product_id`   BIGINT UNSIGNED DEFAULT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `sku`          VARCHAR(64)  NOT NULL,
  `product_image` VARCHAR(255) DEFAULT NULL,
  `quantity`     INT NOT NULL DEFAULT 1,
  `price`        DECIMAL(12,2) NOT NULL,
  `total`        DECIMAL(12,2) NOT NULL,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order`   (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  -- SET NULL: the product may be deleted, but the sales history must survive
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_order_items_qty` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  order_status_history  (order tracking timeline)
-- ============================================================================
CREATE TABLE `order_status_history` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`   BIGINT UNSIGNED NOT NULL,
  `status`     ENUM('Pending','Processing','Shipped','Delivered','Cancelled','Returned') COLLATE utf8mb4_unicode_ci NOT NULL,
  `note`       VARCHAR(255) DEFAULT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_status_history_order` (`order_id`, `created_at`),
  CONSTRAINT `fk_order_status_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_status_history_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  payments
-- ============================================================================
CREATE TABLE `payments` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`        BIGINT UNSIGNED NOT NULL,
  `transaction_id`  VARCHAR(120) DEFAULT NULL,
  `payment_gateway` ENUM('cod','bank_transfer','stripe','paypal') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cod',
  `amount`          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `currency`        VARCHAR(8) NOT NULL DEFAULT 'PHP',
  `status`          ENUM('Pending','Paid','Failed','Refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `paid_at`         DATETIME DEFAULT NULL,
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_order`  (`order_id`),
  KEY `idx_payments_status` (`status`),
  KEY `idx_payments_txn`    (`transaction_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_payments_amount_non_negative` CHECK (`amount` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  reviews
-- ============================================================================
CREATE TABLE `reviews` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `rating`     TINYINT UNSIGNED NOT NULL,
  `title`      VARCHAR(160) DEFAULT NULL,
  `comment`    TEXT         DEFAULT NULL,
  `status`     ENUM('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reviews_user_product` (`user_id`, `product_id`),
  KEY `idx_reviews_product` (`product_id`),
  KEY `idx_reviews_status`  (`status`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_reviews_rating_range` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  coupons
-- ============================================================================
CREATE TABLE `coupons` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code`             VARCHAR(40)  NOT NULL,
  `type`             ENUM('percentage','fixed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `value`            DECIMAL(12,2) NOT NULL,
  `minimum_order`    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `maximum_discount` DECIMAL(12,2) DEFAULT NULL COMMENT 'cap for percentage coupons',
  `usage_limit`      INT          DEFAULT NULL COMMENT 'NULL = unlimited',
  `used_count`       INT          NOT NULL DEFAULT 0,
  `start_date`       DATETIME     NOT NULL,
  `end_date`         DATETIME     NOT NULL,
  `status`           ENUM('active','inactive','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_coupons_code` (`code`),
  KEY `idx_coupons_status` (`status`),
  KEY `idx_coupons_window` (`start_date`, `end_date`),
  CONSTRAINT `chk_coupons_value_positive` CHECK (`value` > 0),
  CONSTRAINT `chk_coupons_date_order`     CHECK (`end_date` >= `start_date`),
  -- A percentage coupon can never be worth more than 100%
  CONSTRAINT `chk_coupons_percentage` CHECK (`type` <> 'percentage' OR `value` <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  coupon_usages
-- ============================================================================
CREATE TABLE `coupon_usages` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `coupon_id`       BIGINT UNSIGNED NOT NULL,
  `user_id`         BIGINT UNSIGNED NOT NULL,
  `order_id`        BIGINT UNSIGNED DEFAULT NULL,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_coupon_usages_coupon` (`coupon_id`),
  KEY `idx_coupon_usages_user`   (`user_id`),
  KEY `idx_coupon_usages_order`  (`order_id`),
  CONSTRAINT `fk_coupon_usages_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_coupon_usages_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_coupon_usages_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  inventory_logs
-- ============================================================================
CREATE TABLE `inventory_logs` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `type`       ENUM('stock_in','stock_out','adjustment','return') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity`   INT NOT NULL COMMENT 'signed: +in / -out',
  `reference`  VARCHAR(64)  DEFAULT NULL COMMENT 'order number or PO reference',
  `remarks`    VARCHAR(255) DEFAULT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inventory_logs_product` (`product_id`, `created_at`),
  KEY `idx_inventory_logs_type`    (`type`),
  CONSTRAINT `fk_inventory_logs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_inventory_logs_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_inventory_logs_qty` CHECK (`quantity` <> 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  files  (File Manager: documents, images, contracts, invoices, customer files)
-- ============================================================================
CREATE TABLE `files` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `path`         VARCHAR(500) NOT NULL,
  `mime_type`    VARCHAR(120) NOT NULL,
  `size`         BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'bytes',
  `category`     ENUM('image','document','contract','invoice','customer','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `uploaded_by`  BIGINT UNSIGNED DEFAULT NULL,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_files_category` (`category`),
  KEY `idx_files_created`  (`created_at`),
  KEY `idx_files_uploader` (`uploaded_by`),
  CONSTRAINT `fk_files_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  notifications  (in-app notification centre)
-- ============================================================================
CREATE TABLE `notifications` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED DEFAULT NULL COMMENT 'NULL = broadcast to staff/admin',
  `title`      VARCHAR(160) NOT NULL,
  `message`    VARCHAR(500) NOT NULL,
  `type`       ENUM('info','success','warning','error') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `link`       VARCHAR(255) DEFAULT NULL,
  `read_at`    DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user`   (`user_id`),
  KEY `idx_notifications_unread` (`read_at`, `created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
--  settings  (key/value store with a `group` column)
-- ============================================================================
CREATE TABLE `settings` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key`        VARCHAR(120) NOT NULL,
  `group`      VARCHAR(60)  NOT NULL DEFAULT 'general',
  `value`      TEXT         DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_settings_key` (`key`),
  KEY `idx_settings_group` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
