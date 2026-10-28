-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Oct 28, 2026 at 11:09 AM
-- Server version: 5.7.39
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `ip_address`, `created_at`) VALUES
(1, 1, 'seeded', 'Created admin account', '127.0.0.1', '2026-09-14 02:55:34'),
(2, 2, 'seeded', 'Staff account created', '127.0.0.1', '2026-09-14 02:55:34'),
(3, 3, 'seeded', 'Staff account created', '127.0.0.1', '2026-09-14 02:55:34'),
(4, 4, 'seeded', 'Staff account created', '127.0.0.1', '2026-09-14 02:55:34'),
(5, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 10:55:40'),
(6, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 10:59:01'),
(7, 1, 'auth.logout', 'Admin User signed out.', '::1', '2026-09-14 11:00:22'),
(8, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 12:01:28'),
(9, 2, 'auth.login', 'Jessica Ramos signed in.', '::1', '2026-09-14 12:02:32'),
(10, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 12:02:33'),
(11, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 12:23:38'),
(12, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 12:29:10'),
(13, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 12:30:37'),
(14, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 20:07:29'),
(15, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 20:14:08'),
(16, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 20:20:11'),
(17, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 20:32:43'),
(18, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 20:37:16'),
(19, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-14 20:43:25'),
(20, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-15 07:50:01'),
(21, 1, 'product.updated', 'Updated product Atelier Media Console', '::1', '2026-09-15 07:52:05'),
(22, 1, 'product.updated', 'Updated product Atelier Media Console', '::1', '2026-09-15 07:52:43'),
(23, 1, 'product.updated', 'Updated product Atelier Media Console', '::1', '2026-09-15 07:52:51'),
(24, 1, 'product.updated', 'Updated product Atelier Media Console', '::1', '2026-09-15 07:53:15'),
(25, 1, 'product.updated', 'Updated product Atelier Media Console', '::1', '2026-09-15 07:53:21'),
(26, 1, 'product.updated', 'Updated product Atelier Media Console', '::1', '2026-09-15 07:54:46'),
(27, 1, 'product.created', 'Created product tess', '::1', '2026-09-15 08:14:39'),
(28, 1, 'product.updated', 'Updated product tess', '::1', '2026-09-15 08:15:13'),
(29, 1, 'product.updated', 'Updated product tess', '::1', '2026-09-15 08:15:38'),
(30, 1, 'product.status', 'Changed status of tess to inactive', '::1', '2026-09-15 08:22:59'),
(31, 1, 'product.status', 'Changed status of tess to draft', '::1', '2026-09-15 08:23:05'),
(32, 1, 'product.deleted', 'Deleted product tess', '::1', '2026-09-15 08:23:26'),
(33, 1, 'product.updated', 'Updated product OakHaven Round Coffee Table', '::1', '2026-09-15 08:26:11'),
(34, 1, 'auth.logout', 'Admin User signed out.', '::1', '2026-09-15 08:26:28'),
(35, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-15 17:00:45'),
(36, 1, 'product.updated', 'Updated product Atelier Media Console', '::1', '2026-09-15 17:03:10'),
(37, 1, 'product.updated', 'Updated product Atelier Media Console', '::1', '2026-09-15 17:03:44'),
(38, 1, 'product.created', 'Created product Office Computer Desk with Drawers Black Home & Office Furniture', '::1', '2026-09-15 17:10:36'),
(39, 1, 'product.updated', 'Updated product Office Computer Desk with Drawers Black Home & Office Furniture', '::1', '2026-09-15 17:11:04'),
(40, 1, 'product.updated', 'Updated product Nordic Compact Living Set', '::1', '2026-09-15 17:12:04'),
(41, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-16 09:59:31'),
(42, 1, 'product.updated', 'Updated product ComfortCraft Full Living Room Set', '::1', '2026-09-16 11:06:36'),
(43, 1, 'product.updated', 'Updated product UrbanNest Gaming Bean Chair', '::1', '2026-09-16 11:08:24'),
(44, 1, 'product.updated', 'Updated product Casa Verde Floor Pouf', '::1', '2026-09-16 11:09:19'),
(45, 1, 'product.updated', 'Updated product ComfortCraft Bean Bag XL', '::1', '2026-09-16 11:10:19'),
(46, 1, 'product.updated', 'Updated product Rustica Patio Bench', '::1', '2026-09-16 11:11:15'),
(47, 1, 'product.updated', 'Updated product UrbanNest Daybed Lounger', '::1', '2026-09-16 11:12:23'),
(48, 1, 'product.updated', 'Updated product Casa Verde Rattan Outdoor Set', '::1', '2026-09-16 11:13:25'),
(49, 1, 'product.updated', 'Updated product Atelier Writer Desk', '::1', '2026-09-16 11:14:33'),
(50, 1, 'product.updated', 'Updated product Nordic Standing Desk', '::1', '2026-09-16 11:25:31'),
(51, 1, 'product.updated', 'Updated product UrbanNest Ergonomic Office Chair', '::1', '2026-09-16 11:26:53'),
(52, 1, 'product.updated', 'Updated product OakHaven Executive Desk', '::1', '2026-09-16 11:27:35'),
(53, 1, 'product.updated', 'Updated product Nordic TV Console Stand', '::1', '2026-09-16 11:28:33'),
(54, 1, 'product.updated', 'Updated product Rustica Industrial Cabinet', '::1', '2026-09-16 11:29:41'),
(55, 1, 'product.updated', 'Updated product UrbanNest Floating Shelf Set', '::1', '2026-09-16 11:30:40'),
(56, 1, 'product.updated', 'Updated product OakHaven Bookshelf 5-Tier', '::1', '2026-09-16 11:31:39'),
(57, 1, 'product.updated', 'Updated product Nordic Wardrobe Sliding Doors', '::1', '2026-09-16 11:32:34'),
(58, 1, 'product.updated', 'Updated product Casa Verde Armoire Closet', '::1', '2026-09-16 11:33:26'),
(59, 1, 'product.updated', 'Updated product OakHaven 4-Door Wardrobe', '::1', '2026-09-16 11:34:51'),
(60, 1, 'product.updated', 'Updated product Atelier Upholstered Twin Bed', '::1', '2026-09-16 11:35:58'),
(61, 1, 'product.updated', 'Updated product The Ligne Adjustable Bed Set', '::1', '2026-09-16 11:36:43'),
(62, 1, 'product.updated', 'Updated product Nordic Platform Bed', '::1', '2026-09-16 11:37:29'),
(63, 1, 'product.updated', 'Updated product Rustica King Solid Wood Bed', '::1', '2026-09-16 11:39:42'),
(64, 1, 'product.updated', 'Updated product UrbanNest Queen Bed Frame', '::1', '2026-09-16 11:40:47'),
(65, 1, 'product.updated', 'Updated product Nordic Wooden Dining Chair', '::1', '2026-09-16 11:41:50'),
(66, 1, 'product.updated', 'Updated product UrbanNest Velvet Dining Chair', '::1', '2026-09-16 11:42:52'),
(67, 1, 'product.updated', 'Updated product OakHaven Upholstered Dining Chair', '::1', '2026-09-16 11:43:53'),
(68, 1, 'product.updated', 'Updated product Casa Verde Teak Dining Table', '::1', '2026-09-16 11:45:21'),
(69, 1, 'product.updated', 'Updated product Atelier Bistro Table', '::1', '2026-09-16 11:48:51'),
(70, 1, 'product.updated', 'Updated product Rustica Farmhouse Table', '::1', '2026-09-16 11:49:46'),
(71, 1, 'product.updated', 'Updated product Nordic Extendable Table', '::1', '2026-09-16 11:50:32'),
(72, 1, 'product.updated', 'Updated product UrbanNest Round Marble Table', '::1', '2026-09-16 11:51:27'),
(73, 1, 'product.updated', 'Updated product OakHaven 6-Seater Dining Table', '::1', '2026-09-16 11:52:11'),
(74, 1, 'product.updated', 'Updated product OakHaven Windsor Rocking Chair', '::1', '2026-09-16 11:53:00'),
(75, 1, 'product.updated', 'Updated product Atelier Lounge Recliner', '::1', '2026-09-16 11:54:15'),
(76, 1, 'product.updated', 'Updated product The Ligne Velvet Club Chair', '::1', '2026-09-16 11:55:19'),
(77, 1, 'product.updated', 'Updated product Casa Verde Rattan Chair', '::1', '2026-09-16 11:56:13'),
(78, 1, 'product.updated', 'Updated product Rustica Power Recliner', '::1', '2026-09-16 11:57:04'),
(79, 1, 'product.updated', 'Updated product Nordic Accent Armchair', '::1', '2026-09-16 11:57:47'),
(80, 1, 'product.updated', 'Updated product Eames Style Lounge Chair', '::1', '2026-09-16 11:58:56'),
(81, 1, 'product.updated', 'Updated product Atelier Mid-Century Wood Sofa', '::1', '2026-09-16 12:00:31'),
(82, 1, 'product.updated', 'Updated product The Ligne Leather Chesterfield', '::1', '2026-09-16 12:01:34'),
(83, 1, 'product.updated', 'Updated product Casa Verde Compact Sofa', '::1', '2026-09-16 12:02:27'),
(84, 1, 'product.updated', 'Updated product Rustica Reclining Couch', '::1', '2026-09-16 12:03:22'),
(85, 1, 'product.updated', 'Updated product Nordic Sleeper Sofa', '::1', '2026-09-16 12:06:56'),
(86, 1, 'product.updated', 'Updated product UrbanNest L-Shape Sectional', '::1', '2026-09-16 12:07:56'),
(87, 1, 'product.updated', 'Updated product Haven 3-Seater Fabric Sofa', '::1', '2026-09-16 12:09:03'),
(88, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-16 20:16:12'),
(89, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-17 06:59:33'),
(90, 1, 'order.updated', 'Updated order FUR-20260617-1045', '::1', '2026-09-17 07:53:00'),
(91, 1, 'order.updated', 'Updated order FUR-20260617-1045', '::1', '2026-09-17 10:23:53'),
(92, 1, 'customer.updated', 'Updated customer gabriel.po@example.com', '::1', '2026-09-17 10:25:22'),
(93, 1, 'customer.created', 'Created customer account for clydey@test.com', '::1', '2026-09-17 10:25:58'),
(94, 1, 'customer.updated', 'Updated customer clydey@test.com', '::1', '2026-09-17 10:26:07'),
(95, 1, 'user.created', 'Created user catlin@test.com', '::1', '2026-09-17 10:29:21'),
(96, 1, 'user.updated', 'Updated user gabriel.po@example.com', '::1', '2026-09-17 10:29:59'),
(97, 1, 'category.created', 'Created category test', '::1', '2026-09-17 10:46:05'),
(98, 1, 'category.updated', 'Updated category test', '::1', '2026-09-17 10:46:16'),
(99, 1, 'category.deleted', 'Deleted category test', '::1', '2026-09-17 10:46:20'),
(100, 1, 'category.updated', 'Updated category Bookshelves', '::1', '2026-09-17 10:47:44'),
(101, 1, 'category.updated', 'Updated category King Beds', '::1', '2026-09-17 10:48:26'),
(102, 1, 'category.updated', 'Updated category Queen Beds', '::1', '2026-09-17 10:49:16'),
(103, 1, 'category.updated', 'Updated category Rectangular Tables', '::1', '2026-09-17 10:50:06'),
(104, 1, 'category.updated', 'Updated category Round Tables', '::1', '2026-09-17 10:51:05'),
(105, 1, 'category.updated', 'Updated category Recliners', '::1', '2026-09-17 10:53:11'),
(106, 1, 'category.updated', 'Updated category Armchairs', '::1', '2026-09-17 10:53:49'),
(107, 1, 'category.updated', 'Updated category Sleeper Sofas', '::1', '2026-09-17 10:54:21'),
(108, 1, 'category.updated', 'Updated category Sectionals', '::1', '2026-09-17 10:55:05'),
(109, 1, 'category.updated', 'Updated category 3-Seater Sofas', '::1', '2026-09-17 10:55:54'),
(110, 1, 'category.updated', 'Updated category Bean Bags & Seats', '::1', '2026-09-17 10:56:42'),
(111, 1, 'category.updated', 'Updated category Lounge & Outdoor', '::1', '2026-09-17 10:57:20'),
(112, 1, 'category.updated', 'Updated category Office Furniture', '::1', '2026-09-17 10:58:08'),
(113, 1, 'category.updated', 'Updated category Storage & Shelves', '::1', '2026-09-17 10:58:42'),
(114, 1, 'category.updated', 'Updated category Wardrobes', '::1', '2026-09-17 10:59:21'),
(115, 1, 'category.updated', 'Updated category Beds', '::1', '2026-09-17 11:00:03'),
(116, 1, 'category.updated', 'Updated category Dining Chairs', '::1', '2026-09-17 11:00:49'),
(117, 1, 'category.updated', 'Updated category Dining Tables', '::1', '2026-09-17 11:01:34'),
(118, 1, 'category.updated', 'Updated category Accent Chairs', '::1', '2026-09-17 11:02:13'),
(119, 1, 'category.updated', 'Updated category Living Room Sets', '::1', '2026-09-17 11:02:54'),
(120, 1, 'category.updated', 'Updated category Sofas & Couches', '::1', '2026-09-17 11:03:26'),
(121, 1, 'brand.created', 'Created brand test', '::1', '2026-09-17 11:04:37'),
(122, 1, 'brand.updated', 'Updated brand test', '::1', '2026-09-17 11:04:44'),
(123, 1, 'brand.deleted', 'Deleted brand test', '::1', '2026-09-17 11:04:51'),
(124, 1, 'brand.updated', 'Updated brand Atelier Wood', '::1', '2026-09-17 11:05:38'),
(125, 1, 'brand.updated', 'Updated brand Casa Verde', '::1', '2026-09-17 11:06:27'),
(126, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-17 20:11:56'),
(127, 1, 'brand.updated', 'Updated brand The Ligne', '::1', '2026-09-17 20:14:18'),
(128, 1, 'brand.updated', 'Updated brand NordicHome', '::1', '2026-09-17 20:15:48'),
(129, 1, 'brand.updated', 'Updated brand Rustica', '::1', '2026-09-17 20:16:28'),
(130, 1, 'brand.updated', 'Updated brand UrbanNest', '::1', '2026-09-17 20:17:03'),
(131, 1, 'brand.updated', 'Updated brand OakHaven', '::1', '2026-09-17 20:18:46'),
(132, 1, 'brand.updated', 'Updated brand ComfortCraft', '::1', '2026-09-17 20:19:23'),
(133, 1, 'coupon.created', 'Created coupon FURNWFKPRMLF', '::1', '2026-09-17 20:31:54'),
(134, 1, 'coupon.updated', 'Updated coupon FURNWFKPRMLF', '::1', '2026-09-17 20:32:08'),
(135, 1, 'coupon.deleted', 'Deleted coupon FURNWFKPRMLF', '::1', '2026-09-17 20:32:13'),
(136, 1, 'coupon.created', 'Created coupon FURN5JF2G7EN', '::1', '2026-09-17 20:32:49'),
(137, 1, 'coupon.updated', 'Updated coupon FURN5JF2G7EN', '::1', '2026-09-17 20:32:55'),
(138, 1, 'coupon.deleted', 'Deleted coupon FURN5JF2G7EN', '::1', '2026-09-17 20:32:59'),
(139, 1, 'review.updated', 'Updated review #28 to approved', '::1', '2026-09-17 20:33:57'),
(140, 1, 'review.updated', 'Updated review #28 to rejected', '::1', '2026-09-17 20:34:11'),
(141, 1, 'review.updated', 'Updated review #22 to approved', '::1', '2026-09-17 20:34:25'),
(142, 1, 'file.uploaded', 'Uploaded file products_2026-09-14_202756.csv', '::1', '2026-09-17 20:35:20'),
(143, 1, 'file.uploaded', 'Uploaded file revenue_report.csv', '::1', '2026-09-17 20:35:33'),
(144, 1, 'file.uploaded', 'Uploaded file 555555.webp', '::1', '2026-09-17 20:35:43'),
(145, 1, 'settings.updated', 'Updated general settings', '::1', '2026-09-17 20:36:09'),
(146, 1, 'profile.update', 'Updated profile information.', '::1', '2026-09-17 20:36:36'),
(147, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-18 08:53:29'),
(148, 1, 'auth.logout', 'Admin User signed out.', '::1', '2026-09-18 13:05:20'),
(149, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-18 13:06:36'),
(150, 1, 'auth.logout', 'Admin User signed out.', '::1', '2026-09-18 13:08:42'),
(151, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-22 17:27:23'),
(152, 1, 'auth.logout', 'Admin User signed out.', '::1', '2026-09-22 17:27:29'),
(153, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-22 17:27:59'),
(154, 1, 'order.updated', 'Updated order FUR-20260922-1001', '::1', '2026-09-22 17:28:23'),
(155, 1, 'order.updated', 'Updated order FUR-20260922-1001', '::1', '2026-09-22 17:31:02'),
(156, 1, 'order.updated', 'Updated order FUR-20260922-1001', '::1', '2026-09-22 17:31:27'),
(157, 1, 'order.updated', 'Updated order FUR-20260922-1002', '::1', '2026-09-22 18:15:16'),
(158, 1, 'product.updated', 'Updated product Office Computer Desk with Drawers Black Home & Office Furniture', '::1', '2026-09-22 18:32:27'),
(159, 1, 'order.updated', 'Updated order FUR-20260922-1002', '::1', '2026-09-22 18:46:45'),
(160, 1, 'auth.logout', 'Admin User signed out.', '::1', '2026-09-23 11:13:14'),
(161, 1, 'auth.login', 'Admin User signed in.', '::1', '2026-09-23 11:13:49'),
(162, 1, 'product.updated', 'Updated product Office Computer Desk with Drawers Black Home & Office Furniture', '::1', '2026-09-23 11:15:19'),
(163, 1, 'order.updated', 'Updated order FUR-20260923-1001', '::1', '2026-09-23 11:17:46'),
(164, 1, 'order.updated', 'Updated order FUR-20260923-1001', '::1', '2026-09-23 11:18:19'),
(165, 1, 'order.updated', 'Updated order FUR-20260923-1001', '::1', '2026-09-23 11:18:47'),
(166, 1, 'order.updated', 'Updated order FUR-20260923-1002', '::1', '2026-09-23 11:25:03'),
(167, 1, 'order.updated', 'Updated order FUR-20260923-1003', '::1', '2026-09-23 11:29:28'),
(168, 1, 'order.updated', 'Updated order FUR-20260923-1003', '::1', '2026-09-23 11:30:29'),
(169, 1, 'order.updated', 'Updated order FUR-20260923-1003', '::1', '2026-09-23 11:30:51'),
(170, 1, 'auth.logout', 'Admin User signed out.', '::1', '2026-09-23 11:33:07');

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line_1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line_2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Philippines',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `full_name`, `phone`, `address_line_1`, `address_line_2`, `city`, `province`, `postal_code`, `country`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 6, 'Rico Bautista', '+63 923 789 0123', '498 Sunshine Ave', 'Unit 5', 'Davao City', 'Metro', '1350', 'Philippines', 1, '2026-09-13 12:55:35', '2026-09-13 12:55:35'),
(2, 7, 'Diana Cruz', '+63 924 890 1234', '153 Sunshine Ave', 'Unit 89', 'Manila', 'Metro', '9472', 'Philippines', 1, '2026-09-10 12:55:35', '2026-09-10 12:55:35'),
(3, 8, 'Leo Manalo', '+63 925 901 2345', '222 Sunshine Ave', 'Unit 79', 'Quezon City', 'Metro', '5333', 'Philippines', 1, '2026-09-08 12:55:35', '2026-09-08 12:55:35'),
(4, 9, 'Sophia Lim', '+63 926 012 3456', '141 Sunshine Ave', 'Unit 65', 'Makati', 'Metro', '1822', 'Philippines', 1, '2026-09-07 12:55:35', '2026-09-07 12:55:35'),
(5, 10, 'Ian Torres', '+63 927 123 4568', '10 Sunshine Ave', 'Unit 75', 'Pasig', 'Metro', '6628', 'Philippines', 1, '2026-09-04 12:55:35', '2026-09-04 12:55:35'),
(6, 11, 'Grace Navarro', '+63 928 234 5679', '308 Sunshine Ave', 'Unit 72', 'Cebu City', 'Metro', '1573', 'Philippines', 1, '2026-09-03 12:55:35', '2026-09-03 12:55:35'),
(7, 12, 'Miguel Ocampo', '+63 929 345 6780', '353 Sunshine Ave', 'Unit 85', 'Davao City', 'Metro', '5667', 'Philippines', 1, '2026-09-01 12:55:35', '2026-09-01 12:55:35'),
(8, 13, 'Alyanna Flores', '+63 930 456 7891', '270 Sunshine Ave', 'Unit 64', 'Taguig', 'Metro', '8385', 'Philippines', 1, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(9, 14, 'Gabriel Po', '+63 931 567 8902', '120 Sunshine Ave', 'Unit 65', 'Manila', 'Metro', '6042', 'Philippines', 1, '2026-08-27 12:55:35', '2026-08-27 12:55:35'),
(10, 15, 'Juan Santos', '+63 917 123 4567', '345 Sunshine Ave', 'Unit 53', 'Manila', 'Metro', '6274', 'Philippines', 1, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(11, 16, 'Maria Garcia', '+63 918 234 5678', '310 Sunshine Ave', 'Unit 23', 'Quezon City', 'Metro', '9431', 'Philippines', 1, '2026-08-23 12:55:35', '2026-08-23 12:55:35'),
(12, 17, 'John Reyes', '+63 919 345 6789', '167 Sunshine Ave', 'Unit 30', 'Makati', 'Metro', '9879', 'Philippines', 1, '2026-08-22 12:55:35', '2026-08-22 12:55:35'),
(13, 18, 'Kaye Mendoza', '+63 920 456 7890', '28 Sunshine Ave', 'Unit 77', 'Taguig', 'Metro', '8595', 'Philippines', 1, '2026-08-20 12:55:35', '2026-08-20 12:55:35'),
(14, 19, 'Paolo Aquino', '+63 921 567 8901', '196 Sunshine Ave', 'Unit 5', 'Pasig', 'Metro', '2565', 'Philippines', 1, '2026-08-17 12:55:35', '2026-08-17 12:55:35'),
(15, 5, 'Claire Tan', '+63 922 678 9012', '3 Sunshine Ave', 'Unit 4', 'Cebu City', 'Metro', '2651', 'Philippines', 1, '2026-08-16 12:55:35', '2026-08-16 12:55:35'),
(16, 6, 'Rico Bautista', '+63 923 789 0123', '194 Sunshine Ave', 'Unit 18', 'Davao City', 'Metro', '9858', 'Philippines', 1, '2026-08-14 12:55:35', '2026-08-14 12:55:35'),
(17, 7, 'Diana Cruz', '+63 924 890 1234', '183 Sunshine Ave', 'Unit 53', 'Manila', 'Metro', '9434', 'Philippines', 1, '2026-08-11 12:55:35', '2026-08-11 12:55:35'),
(18, 8, 'Leo Manalo', '+63 925 901 2345', '181 Sunshine Ave', 'Unit 18', 'Quezon City', 'Metro', '5423', 'Philippines', 1, '2026-08-09 12:55:35', '2026-08-09 12:55:35'),
(19, 9, 'Sophia Lim', '+63 926 012 3456', '435 Sunshine Ave', 'Unit 65', 'Makati', 'Metro', '1129', 'Philippines', 1, '2026-08-08 12:55:35', '2026-08-08 12:55:35'),
(20, 10, 'Ian Torres', '+63 927 123 4568', '301 Sunshine Ave', 'Unit 5', 'Pasig', 'Metro', '5648', 'Philippines', 1, '2026-08-06 12:55:35', '2026-08-06 12:55:35'),
(21, 11, 'Grace Navarro', '+63 928 234 5679', '401 Sunshine Ave', 'Unit 3', 'Cebu City', 'Metro', '8377', 'Philippines', 1, '2026-08-04 12:55:35', '2026-08-04 12:55:35'),
(22, 12, 'Miguel Ocampo', '+63 929 345 6780', '19 Sunshine Ave', 'Unit 32', 'Davao City', 'Metro', '2246', 'Philippines', 1, '2026-08-01 12:55:35', '2026-08-01 12:55:35'),
(23, 13, 'Alyanna Flores', '+63 930 456 7891', '384 Sunshine Ave', 'Unit 83', 'Taguig', 'Metro', '4739', 'Philippines', 1, '2026-07-30 12:55:35', '2026-07-30 12:55:35'),
(24, 14, 'Gabriel Po', '+63 931 567 8902', '32 Sunshine Ave', 'Unit 27', 'Manila', 'Metro', '9633', 'Philippines', 1, '2026-07-29 12:55:35', '2026-07-29 12:55:35'),
(25, 15, 'Juan Santos', '+63 917 123 4567', '413 Sunshine Ave', 'Unit 4', 'Manila', 'Metro', '8190', 'Philippines', 1, '2026-07-27 12:55:35', '2026-07-27 12:55:35'),
(26, 16, 'Maria Garcia', '+63 918 234 5678', '197 Sunshine Ave', 'Unit 42', 'Quezon City', 'Metro', '3362', 'Philippines', 1, '2026-07-25 12:55:35', '2026-07-25 12:55:35'),
(27, 17, 'John Reyes', '+63 919 345 6789', '475 Sunshine Ave', 'Unit 5', 'Makati', 'Metro', '1151', 'Philippines', 1, '2026-07-22 12:55:35', '2026-07-22 12:55:35'),
(28, 18, 'Kaye Mendoza', '+63 920 456 7890', '432 Sunshine Ave', 'Unit 34', 'Taguig', 'Metro', '8775', 'Philippines', 1, '2026-07-21 12:55:35', '2026-07-21 12:55:35'),
(29, 19, 'Paolo Aquino', '+63 921 567 8901', '282 Sunshine Ave', 'Unit 57', 'Pasig', 'Metro', '8751', 'Philippines', 1, '2026-07-18 12:55:35', '2026-07-18 12:55:35'),
(30, 5, 'Claire Tan', '+63 922 678 9012', '134 Sunshine Ave', 'Unit 54', 'Cebu City', 'Metro', '9794', 'Philippines', 1, '2026-07-16 12:55:35', '2026-07-16 12:55:35'),
(31, 6, 'Maria Garcia', '+63 918 234 5678', '500 Sunshine Ave', '', 'Quezon City', 'Metro', '1100', 'Philippines', 1, '2026-07-15 12:55:35', '2026-09-22 16:38:50'),
(32, 7, 'Diana Cruz', '+63 924 890 1234', '481 Sunshine Ave', 'Unit 66', 'Manila', 'Metro', '9932', 'Philippines', 1, '2026-07-12 12:55:35', '2026-07-12 12:55:35'),
(33, 8, 'Leo Manalo', '+63 925 901 2345', '349 Sunshine Ave', 'Unit 38', 'Quezon City', 'Metro', '6317', 'Philippines', 1, '2026-07-10 12:55:35', '2026-07-10 12:55:35'),
(34, 9, 'Sophia Lim', '+63 926 012 3456', '168 Sunshine Ave', 'Unit 14', 'Makati', 'Metro', '6970', 'Philippines', 1, '2026-07-09 12:55:35', '2026-07-09 12:55:35'),
(35, 10, 'Ian Torres', '+63 927 123 4568', '499 Sunshine Ave', 'Unit 1', 'Pasig', 'Metro', '6557', 'Philippines', 1, '2026-07-06 12:55:35', '2026-07-06 12:55:35'),
(36, 11, 'Grace Navarro', '+63 928 234 5679', '135 Sunshine Ave', 'Unit 27', 'Cebu City', 'Metro', '5806', 'Philippines', 1, '2026-07-05 12:55:35', '2026-07-05 12:55:35'),
(37, 12, 'Miguel Ocampo', '+63 929 345 6780', '493 Sunshine Ave', 'Unit 56', 'Davao City', 'Metro', '6259', 'Philippines', 1, '2026-07-03 12:55:35', '2026-07-03 12:55:35'),
(38, 13, 'Alyanna Flores', '+63 930 456 7891', '365 Sunshine Ave', 'Unit 53', 'Taguig', 'Metro', '2896', 'Philippines', 1, '2026-06-30 12:55:35', '2026-06-30 12:55:35'),
(39, 14, 'Gabriel Po', '+63 931 567 8902', '308 Sunshine Ave', 'Unit 42', 'Manila', 'Metro', '4323', 'Philippines', 1, '2026-06-28 12:55:35', '2026-06-28 12:55:35'),
(40, 15, 'Juan Santos', '+63 917 123 4567', '246 Sunshine Ave', 'Unit 59', 'Manila', 'Metro', '9044', 'Philippines', 1, '2026-06-27 12:55:35', '2026-06-27 12:55:35'),
(41, 16, 'Maria Garcia', '+63 918 234 5678', '234 Sunshine Ave', 'Unit 25', 'Quezon City', 'Metro', '4007', 'Philippines', 1, '2026-06-25 12:55:35', '2026-06-25 12:55:35'),
(42, 17, 'John Reyes', '+63 919 345 6789', '26 Sunshine Ave', 'Unit 17', 'Makati', 'Metro', '9465', 'Philippines', 1, '2026-06-23 12:55:35', '2026-06-23 12:55:35'),
(43, 18, 'Kaye Mendoza', '+63 920 456 7890', '210 Sunshine Ave', 'Unit 67', 'Taguig', 'Metro', '3558', 'Philippines', 1, '2026-06-21 12:55:35', '2026-06-21 12:55:35'),
(44, 19, 'Paolo Aquino', '+63 921 567 8901', '112 Sunshine Ave', 'Unit 83', 'Pasig', 'Metro', '4579', 'Philippines', 1, '2026-06-18 12:55:35', '2026-06-18 12:55:35'),
(45, 5, 'Claire Tan', '+63 922 678 9012', '90 Sunshine Ave', 'Unit 1', 'Cebu City', 'Metro', '5719', 'Philippines', 1, '2026-06-17 12:55:35', '2026-06-17 12:55:35'),
(46, 20, 'Clydey Ednalan', '34234234', 'New Cabalan', '', 'Olongapo City', 'Zambales', '2200', 'Philippines', 1, '2026-09-22 16:56:02', '2026-09-22 16:56:02'),
(49, 20, 'Clydey Ednalan', '34234234', 'New Cabalan', '', 'Olongapo City', 'Zambales', '2200', 'Philippines', 0, '2026-09-22 17:25:31', '2026-09-22 17:25:31'),
(51, 18, 'Kaye Mendoza', '+63 920 456 7890', '210 Sunshine Ave', 'Unit 67', 'Taguig', 'Metro', '3558', 'Philippines', 0, '2026-09-22 18:11:49', '2026-09-22 18:11:49'),
(54, 18, 'Kaye Mendoza', '+63 920 456 7890', '210 Sunshine Ave', 'Unit 67', 'Taguig', 'Metro', '3558', 'Philippines', 0, '2026-09-22 18:28:16', '2026-09-22 18:28:16'),
(55, 18, 'Kaye Mendoza', '+63 920 456 7890', '210 Sunshine Ave', 'Unit 67', 'Taguig', 'Metro', '3558', 'Philippines', 0, '2026-09-22 18:33:15', '2026-09-22 18:33:15'),
(56, 18, 'Kaye Mendoza', '+63 920 456 7890', '210 Sunshine Ave', 'Unit 67', 'Taguig', 'Metro', '3558', 'Philippines', 0, '2026-09-22 18:35:11', '2026-09-22 18:35:11'),
(58, 18, 'Kaye Mendoza', '+63 920 456 7890', '210 Sunshine Ave', 'Unit 67', 'Taguig', 'Metro', '3558', 'Philippines', 0, '2026-09-22 18:44:03', '2026-09-22 18:44:03'),
(59, 20, 'Clydey Ednalan', '34234234', 'New Cabalan', '', 'Olongapo City', 'Zambales', '2200', 'Philippines', 0, '2026-09-23 11:12:20', '2026-09-23 11:12:20'),
(60, 20, 'Clydey Ednalan', '34234234', 'New Cabalan', '', 'Olongapo City', 'Zambales', '2200', 'Philippines', 0, '2026-09-23 11:23:20', '2026-09-23 11:23:20'),
(61, 20, 'Clydey Ednalan', '34234234', 'New Cabalan', '', 'Olongapo City', 'Zambales', '2200', 'Philippines', 0, '2026-09-23 11:28:38', '2026-09-23 11:28:38');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `slug`, `logo`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'ComfortCraft', 'comfortcraft', 'brands/66666_45eecad9f2b8.webp', 'Premium comfort furniture.', 'inactive', '2026-05-27 12:55:35', '2026-09-17 20:19:23'),
(2, 'OakHaven', 'oakhaven', 'brands/555555_d4391cfabf5c.webp', 'Solid oak wood furniture.', 'active', '2026-05-28 12:55:35', '2026-09-17 20:18:46'),
(3, 'UrbanNest', 'urbannest', 'brands/44444_de278e7cebf7.webp', 'Modern urban living furniture.', 'active', '2026-05-29 12:55:35', '2026-09-17 20:17:03'),
(4, 'Rustica', 'rustica', 'brands/33333_df4f56a8ca4b.webp', 'Rustic and farmhouse style.', 'active', '2026-05-30 12:55:35', '2026-09-17 20:16:28'),
(5, 'NordicHome', 'nordichome', 'brands/22222_2720d9ff208f.png', 'Scandinavian minimalist designs.', 'inactive', '2026-05-31 12:55:35', '2026-09-17 20:15:48'),
(6, 'The Ligne', 'the-ligne', 'brands/33333_b6d48ef9ee09.png', 'Luxury contemporary pieces.', 'active', '2026-06-01 12:55:35', '2026-09-17 20:14:18'),
(7, 'Casa Verde', 'casa-verde', 'brands/2222_05058de6ec30.jpeg', 'Eco friendly sustainable furniture.', 'active', '2026-06-02 12:55:35', '2026-09-17 11:06:27'),
(8, 'Atelier Wood', 'atelier-wood', 'brands/1111_55c3868c75f3.png', 'Handcrafted artisan woodwork.', 'active', '2026-06-03 12:55:35', '2026-09-17 11:05:38');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 5, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(2, 6, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(3, 7, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(4, 8, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(5, 9, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(6, 10, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(7, 11, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(8, 12, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(9, 13, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(10, 14, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(11, 15, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(12, 16, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(13, 17, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(14, 18, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(15, 19, '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(17, 20, '2026-09-18 13:14:05', '2026-09-18 13:14:05');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `cart_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `image`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Sofas & Couches', 'sofas-couches', 'categories/88888_c7b23470a3c8.png', 'Sofas and couches for living rooms.', 'active', '2026-06-06 12:55:35', '2026-09-17 11:03:26'),
(2, NULL, 'Living Room Sets', 'living-room-sets', 'categories/77777_265e75825992.png', 'Complete living room furniture sets.', 'active', '2026-06-07 12:55:35', '2026-09-17 11:02:54'),
(3, NULL, 'Accent Chairs', 'accent-chairs', 'categories/66666_3b7a4ff2a61b.jpg', 'Comfortable accent chairs.', 'active', '2026-06-08 12:55:35', '2026-09-17 11:02:13'),
(4, NULL, 'Dining Tables', 'dining-tables', 'categories/55555_2df65be11da1.png', 'Dining tables in all sizes.', 'active', '2026-06-09 12:55:35', '2026-09-17 11:01:34'),
(5, NULL, 'Dining Chairs', 'dining-chairs', 'categories/4444_4d2555ff0757.jpg', 'Chairs for your dining area.', 'active', '2026-06-10 12:55:35', '2026-09-17 11:00:49'),
(6, NULL, 'Beds', 'beds', 'categories/4444_9f97106e9575.png', 'Beds, bed frames and headboards.', 'active', '2026-06-11 12:55:35', '2026-09-17 11:00:03'),
(7, NULL, 'Wardrobes', 'wardrobes', 'categories/33333_46fc2db135c6.png', 'Wardrobes and dressers.', 'active', '2026-06-12 12:55:35', '2026-09-17 10:59:21'),
(8, NULL, 'Storage & Shelves', 'storage-shelves', 'categories/22222_64f58b02e44b.png', 'Bookcases, cabinets and shelves.', 'active', '2026-06-13 12:55:35', '2026-09-17 10:58:42'),
(9, NULL, 'Office Furniture', 'office-furniture', 'categories/111_5d4febf389af.png', 'Desks and office chairs.', 'active', '2026-06-14 12:55:35', '2026-09-17 10:58:08'),
(10, NULL, 'Lounge & Outdoor', 'lounge-outdoor', 'categories/8888_40f9ed238220.png', 'Outdoor and lounge furniture.', 'active', '2026-06-15 12:55:35', '2026-09-17 10:57:20'),
(11, NULL, 'Bean Bags & Seats', 'bean-bags-seats', 'categories/77777_8220209344f9.webp', 'Casual and flexible seating.', 'active', '2026-06-16 12:55:35', '2026-09-17 10:56:42'),
(12, 1, '3-Seater Sofas', '3-seater-sofas', 'categories/66666_3534af097072.webp', '3-Seater Sofas — Sofas & Couches.', 'active', '2026-06-11 12:55:35', '2026-09-17 10:55:54'),
(13, 1, 'Sectionals', 'sectionals', 'categories/5555_0fa78ba6179c.jpg', 'Sectionals — Sofas & Couches.', 'active', '2026-06-11 12:55:35', '2026-09-17 10:55:05'),
(14, 1, 'Sleeper Sofas', 'sleeper-sofas', 'categories/4444_672300be7ba9.png', 'Sleeper Sofas — Sofas & Couches.', 'active', '2026-06-11 12:55:35', '2026-09-17 10:54:21'),
(15, 3, 'Armchairs', 'armchairs', 'categories/3333_a0e2badf0385.png', 'Armchairs — Accent Chairs.', 'active', '2026-06-11 12:55:35', '2026-09-17 10:53:49'),
(16, 3, 'Recliners', 'recliners', 'categories/2222_cfa006e51337.png', 'Recliners — Accent Chairs.', 'active', '2026-06-11 12:55:35', '2026-09-17 10:53:11'),
(17, 4, 'Round Tables', 'round-tables', 'categories/1111_e78df5dd7c7b.png', 'Round Tables — Dining Tables.', 'active', '2026-06-11 12:55:35', '2026-09-17 10:51:05'),
(18, 4, 'Rectangular Tables', 'rectangular-tables', 'categories/4444_27c9533f6c8f.jpeg', 'Rectangular Tables — Dining Tables.', 'active', '2026-06-11 12:55:35', '2026-09-17 10:50:06'),
(19, 6, 'Queen Beds', 'queen-beds', 'categories/3333_2e30561d3daf.jpg', 'Queen Beds — Beds.', 'active', '2026-06-11 12:55:35', '2026-09-17 10:49:16'),
(20, 6, 'King Beds', 'king-beds', 'categories/2222_1e031af5d93c.webp', 'King Beds — Beds.', 'active', '2026-06-11 12:55:35', '2026-09-17 10:48:26'),
(21, 8, 'Bookshelves', 'bookshelves', 'categories/1111_e954aa57b011.png', 'Bookshelves — Storage & Shelves.', 'active', '2026-06-11 12:55:35', '2026-09-17 10:47:44');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','read','replied','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('percentage','fixed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'percentage',
  `value` decimal(12,2) NOT NULL DEFAULT '0.00',
  `minimum_order` decimal(12,2) NOT NULL DEFAULT '0.00',
  `maximum_discount` decimal(12,2) DEFAULT NULL,
  `usage_limit` int(11) NOT NULL DEFAULT '0',
  `used_count` int(11) NOT NULL DEFAULT '0',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `type`, `value`, `minimum_order`, `maximum_discount`, `usage_limit`, `used_count`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'percentage', '10.00', '1000.00', '500.00', 500, 0, '2026-02-26 12:55:35', '2026-05-17 12:55:35', 'active', '2026-05-17 12:55:35', '2026-06-06 12:55:35'),
(2, 'SAVE20', 'percentage', '20.00', '3000.00', '2000.00', 100, 3, '2026-04-17 12:55:35', '2026-08-15 12:55:35', 'active', '2026-05-17 12:55:35', '2026-09-14 10:55:35'),
(3, 'FLAT500', 'fixed', '500.00', '2000.00', NULL, 200, 0, '2026-06-16 12:55:35', '2026-07-16 12:55:35', 'active', '2026-05-17 12:55:35', '2026-06-06 12:55:35'),
(4, 'SUMMER15', 'percentage', '15.00', '2500.00', '1500.00', 150, 0, '2026-07-16 12:55:35', '2026-08-30 12:55:35', 'active', '2026-05-17 12:55:35', '2026-06-06 12:55:35'),
(5, 'FURNITURE50', 'fixed', '50.00', '100.00', NULL, 1000, 0, '2026-06-06 12:55:35', '2026-06-16 12:55:35', 'inactive', '2026-05-17 12:55:35', '2026-06-06 12:55:35'),
(6, 'VIP25', 'percentage', '25.00', '10000.00', '5000.00', 25, 0, '2026-07-31 12:55:35', '2026-08-25 12:55:35', 'active', '2026-05-17 12:55:35', '2026-06-06 12:55:35');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usages`
--

CREATE TABLE `coupon_usages` (
  `id` int(10) UNSIGNED NOT NULL,
  `coupon_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupon_usages`
--

INSERT INTO `coupon_usages` (`id`, `coupon_id`, `user_id`, `order_id`, `discount_amount`, `created_at`) VALUES
(1, 2, 5, 15, '3199.90', '2026-08-16 12:55:35'),
(2, 2, 5, 30, '11799.90', '2026-07-16 12:55:35'),
(3, 2, 5, 45, '14199.70', '2026-06-17 12:55:35');

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `group` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'files',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `user_id`, `original_name`, `path`, `mime`, `size`, `group`, `created_at`) VALUES
(1, 1, 'products_2026-09-14_202756.csv', 'files/products-2026-09-14-202756_f10806c697eb.csv', 'text/csv', 9320, 'files', '2026-09-17 20:35:20'),
(2, 1, 'revenue_report.csv', 'files/revenue-report_355469ce0a73.csv', 'text/csv', 432, 'files', '2026-09-17 20:35:33'),
(3, 1, '555555.webp', 'files/555555_4d98f9b6ac55.webp', 'image/webp', 32618, 'files', '2026-09-17 20:35:43');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_logs`
--

CREATE TABLE `inventory_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `type` enum('stock_in','stock_out','adjustment','return') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'adjustment',
  `quantity` int(11) NOT NULL DEFAULT '0',
  `reference` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_logs`
--

INSERT INTO `inventory_logs` (`id`, `product_id`, `type`, `quantity`, `reference`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 1, 'stock_in', 33, 'INV-0000', 'Initial stock setup', '2026-07-01 12:55:35', '2026-09-14 10:55:35'),
(2, 2, 'stock_in', 18, 'INV-0001', 'Initial stock setup', '2026-07-02 12:55:35', '2026-09-14 10:55:35'),
(3, 3, 'stock_in', 15, 'INV-0002', 'Initial stock setup', '2026-07-03 12:55:35', '2026-09-14 10:55:35'),
(4, 4, 'stock_in', 14, 'INV-0003', 'Initial stock setup', '2026-07-04 12:55:35', '2026-09-14 10:55:35'),
(5, 5, 'stock_in', 29, 'INV-0004', 'Initial stock setup', '2026-07-05 12:55:35', '2026-09-14 10:55:35'),
(6, 6, 'stock_in', 15, 'INV-0005', 'Initial stock setup', '2026-07-06 12:55:35', '2026-09-14 10:55:35'),
(7, 7, 'stock_in', 21, 'INV-0006', 'Initial stock setup', '2026-07-07 12:55:35', '2026-09-14 10:55:35'),
(8, 8, 'stock_in', 56, 'INV-0007', 'Initial stock setup', '2026-07-08 12:55:35', '2026-09-14 10:55:35'),
(9, 9, 'stock_in', 52, 'INV-0008', 'Initial stock setup', '2026-07-09 12:55:35', '2026-09-14 10:55:35'),
(10, 10, 'stock_in', 32, 'INV-0009', 'Initial stock setup', '2026-07-10 12:55:35', '2026-09-14 10:55:35'),
(11, 11, 'stock_in', 76, 'INV-0010', 'Initial stock setup', '2026-07-11 12:55:35', '2026-09-14 10:55:35'),
(12, 12, 'stock_in', 47, 'INV-0011', 'Initial stock setup', '2026-07-12 12:55:35', '2026-09-14 10:55:35'),
(13, 13, 'stock_in', 39, 'INV-0012', 'Initial stock setup', '2026-07-13 12:55:35', '2026-09-14 10:55:35'),
(14, 14, 'stock_in', 56, 'INV-0013', 'Initial stock setup', '2026-07-14 12:55:35', '2026-09-14 10:55:35'),
(15, 15, 'stock_in', 47, 'INV-0014', 'Initial stock setup', '2026-07-15 12:55:35', '2026-09-14 10:55:35'),
(16, 16, 'stock_in', 42, 'INV-0015', 'Initial stock setup', '2026-07-16 12:55:35', '2026-09-14 10:55:35'),
(17, 17, 'stock_in', 41, 'INV-0016', 'Initial stock setup', '2026-07-17 12:55:35', '2026-09-14 10:55:35'),
(18, 18, 'stock_in', 41, 'INV-0017', 'Initial stock setup', '2026-07-18 12:55:35', '2026-09-14 10:55:35'),
(19, 19, 'stock_in', 82, 'INV-0018', 'Initial stock setup', '2026-07-19 12:55:35', '2026-09-14 10:55:35'),
(20, 20, 'stock_in', 56, 'INV-0019', 'Initial stock setup', '2026-07-20 12:55:35', '2026-09-14 10:55:35'),
(21, 21, 'stock_in', 107, 'INV-0020', 'Initial stock setup', '2026-07-21 12:55:35', '2026-09-14 10:55:35'),
(22, 22, 'stock_in', 92, 'INV-0021', 'Initial stock setup', '2026-07-22 12:55:35', '2026-09-14 10:55:35'),
(23, 23, 'stock_in', 128, 'INV-0022', 'Initial stock setup', '2026-07-23 12:55:35', '2026-09-14 10:55:35'),
(24, 24, 'stock_in', 60, 'INV-0023', 'Initial stock setup', '2026-07-24 12:55:35', '2026-09-14 10:55:35'),
(25, 25, 'stock_in', 56, 'INV-0024', 'Initial stock setup', '2026-07-25 12:55:35', '2026-09-14 10:55:35'),
(26, 26, 'stock_in', 72, 'INV-0025', 'Initial stock setup', '2026-07-26 12:55:35', '2026-09-14 10:55:35'),
(27, 27, 'stock_in', 56, 'INV-0026', 'Initial stock setup', '2026-07-27 12:55:35', '2026-09-14 10:55:35'),
(28, 28, 'stock_in', 82, 'INV-0027', 'Initial stock setup', '2026-07-28 12:55:35', '2026-09-14 10:55:35'),
(29, 29, 'stock_in', 67, 'INV-0028', 'Initial stock setup', '2026-07-29 12:55:35', '2026-09-14 10:55:35'),
(30, 30, 'stock_in', 74, 'INV-0029', 'Initial stock setup', '2026-07-30 12:55:35', '2026-09-14 10:55:35'),
(31, 31, 'stock_in', 72, 'INV-0030', 'Initial stock setup', '2026-07-31 12:55:35', '2026-09-14 10:55:35'),
(32, 32, 'stock_in', 101, 'INV-0031', 'Initial stock setup', '2026-08-01 12:55:35', '2026-09-14 10:55:35'),
(33, 33, 'stock_in', 125, 'INV-0032', 'Initial stock setup', '2026-08-02 12:55:35', '2026-09-14 10:55:35'),
(34, 34, 'stock_in', 89, 'INV-0033', 'Initial stock setup', '2026-08-03 12:55:35', '2026-09-14 10:55:35'),
(35, 35, 'stock_in', 97, 'INV-0034', 'Initial stock setup', '2026-08-04 12:55:35', '2026-09-14 10:55:35'),
(36, 36, 'stock_in', 86, 'INV-0035', 'Initial stock setup', '2026-08-05 12:55:35', '2026-09-14 10:55:35'),
(37, 37, 'stock_in', 125, 'INV-0036', 'Initial stock setup', '2026-08-06 12:55:35', '2026-09-14 10:55:35'),
(38, 38, 'stock_in', 100, 'INV-0037', 'Initial stock setup', '2026-08-07 12:55:35', '2026-09-14 10:55:35'),
(39, 39, 'stock_in', 109, 'INV-0038', 'Initial stock setup', '2026-08-08 12:55:35', '2026-09-14 10:55:35'),
(40, 40, 'stock_in', 93, 'INV-0039', 'Initial stock setup', '2026-08-09 12:55:35', '2026-09-14 10:55:35'),
(41, 41, 'stock_in', 102, 'INV-0040', 'Initial stock setup', '2026-08-10 12:55:35', '2026-09-14 10:55:35'),
(42, 42, 'stock_in', 119, 'INV-0041', 'Initial stock setup', '2026-08-11 12:55:35', '2026-09-14 10:55:35'),
(43, 43, 'stock_in', 154, 'INV-0042', 'Initial stock setup', '2026-08-12 12:55:35', '2026-09-14 10:55:35'),
(44, 44, 'stock_in', 170, 'INV-0043', 'Initial stock setup', '2026-08-13 12:55:35', '2026-09-14 10:55:35'),
(45, 45, 'stock_in', 137, 'INV-0044', 'Initial stock setup', '2026-08-14 12:55:35', '2026-09-14 10:55:35'),
(46, 46, 'stock_in', 97, 'INV-0045', 'Initial stock setup', '2026-08-15 12:55:35', '2026-09-14 10:55:35'),
(47, 47, 'stock_in', 103, 'INV-0046', 'Initial stock setup', '2026-08-16 12:55:35', '2026-09-14 10:55:35'),
(48, 48, 'stock_in', 138, 'INV-0047', 'Initial stock setup', '2026-08-17 12:55:35', '2026-09-14 10:55:35'),
(49, 49, 'stock_in', 117, 'INV-0048', 'Initial stock setup', '2026-08-18 12:55:35', '2026-09-14 10:55:35'),
(51, 51, 'stock_in', 5, 'INIT', 'Initial stock', '2026-09-15 17:10:36', '2026-09-15 17:10:36');

-- --------------------------------------------------------

--
-- Table structure for table `login_history`
--

CREATE TABLE `login_history` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('success','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'success',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_history`
--

INSERT INTO `login_history` (`id`, `user_id`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES
(1, 1, '::1', 'curl/8.7.1', 'success', '2026-09-14 10:55:40'),
(2, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success', '2026-09-14 10:59:01'),
(3, 1, '::1', 'curl/8.7.1', 'success', '2026-09-14 12:01:28'),
(4, 2, '::1', 'curl/8.7.1', 'success', '2026-09-14 12:02:32'),
(5, 1, '::1', 'curl/8.7.1', 'success', '2026-09-14 12:02:33'),
(6, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success', '2026-09-14 12:23:38'),
(7, 1, '::1', 'curl/8.7.1', 'success', '2026-09-14 12:29:10'),
(8, 1, '::1', 'curl/8.7.1', 'success', '2026-09-14 12:30:37'),
(9, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success', '2026-09-14 20:07:29'),
(10, 1, '::1', 'curl/8.7.1', 'success', '2026-09-14 20:14:08'),
(11, 1, '::1', 'curl/8.7.1', 'success', '2026-09-14 20:20:11'),
(13, 1, '::1', 'curl/8.7.1', 'success', '2026-09-14 20:37:16'),
(15, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'failed', '2026-09-15 07:49:28'),
(16, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success', '2026-09-15 07:50:01'),
(17, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success', '2026-09-15 17:00:45'),
(19, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success', '2026-09-16 20:16:12'),
(20, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success', '2026-09-17 06:59:33'),
(21, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success', '2026-09-17 20:11:56'),
(22, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success', '2026-09-18 08:53:29'),
(23, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'success', '2026-09-18 13:06:36'),
(24, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'success', '2026-09-22 17:27:23'),
(25, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'success', '2026-09-22 17:27:59'),
(26, 1, '::1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'success', '2026-09-23 11:13:49');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `type` enum('info','success','warning','danger') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `link`, `is_read`, `created_at`) VALUES
(1, 1, 'success', 'Welcome to FurniShop', 'Your admin account has been created successfully.', NULL, 1, '2026-09-14 02:55:34'),
(2, 1, 'info', 'New orders to review', 'You have new customer orders awaiting processing.', NULL, 1, '2026-09-13 12:55:35'),
(7, 20, 'success', 'Order placed successfully', 'Order FUR-20260922-1001 has been received. We will notify you once it ships.', 'http://localhost:8888/devproject/ecommerce/my-account/orders/50', 1, '2026-09-22 17:25:31'),
(9, 18, 'success', 'Payment received', 'Your payment for order FUR-20260922-1002 was confirmed. We will notify you once it ships.', 'http://localhost:8888/devproject/ecommerce/my-account/orders/52', 0, '2026-09-22 18:13:15'),
(11, 18, 'success', 'Payment received', 'Your payment for order FUR-20260922-1006 was confirmed. We will notify you once it ships.', 'http://localhost:8888/devproject/ecommerce/my-account/orders/59', 0, '2026-09-22 18:44:16'),
(12, 20, 'success', 'Order placed successfully', 'Order FUR-20260923-1001 has been received. We will notify you once it ships.', 'http://localhost:8888/devproject/ecommerce/my-account/orders/60', 0, '2026-09-23 11:12:20'),
(13, 20, 'success', 'Payment received', 'Your payment for order FUR-20260923-1002 was confirmed. We will notify you once it ships.', 'http://localhost:8888/devproject/ecommerce/my-account/orders/61', 0, '2026-09-23 11:24:21'),
(14, 20, 'success', 'Payment received', 'Your payment for order FUR-20260923-1003 was confirmed. We will notify you once it ships.', 'http://localhost:8888/devproject/ecommerce/my-account/orders/62', 0, '2026-09-23 11:28:51');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `order_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `shipping_fee` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(12,2) NOT NULL DEFAULT '0.00',
  `grand_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'cash_on_delivery',
  `payment_status` enum('pending','paid','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `order_status` enum('pending','processing','shipped','delivered','cancelled','returned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `shipping_address_id` int(10) UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_number`, `subtotal`, `discount`, `shipping_fee`, `tax`, `grand_total`, `payment_method`, `payment_status`, `order_status`, `shipping_address_id`, `notes`, `created_at`, `updated_at`) VALUES
(1, 6, 'FUR-20260913-1001', '23998.00', '0.00', '150.00', '2879.76', '27027.76', 'stripe', 'refunded', 'shipped', 1, 'Please deliver between 9am and 6pm.', '2026-09-13 12:55:35', '2026-09-14 10:55:35'),
(2, 7, 'FUR-20260910-1002', '16999.00', '0.00', '150.00', '2039.88', '19188.88', 'paypal', 'paid', 'delivered', 2, 'Please deliver between 9am and 6pm.', '2026-09-10 12:55:35', '2026-09-14 10:55:35'),
(3, 8, 'FUR-20260908-1003', '100799.00', '0.00', '150.00', '12095.88', '113044.88', 'stripe', 'paid', 'pending', 3, 'Please deliver between 9am and 6pm.', '2026-09-08 12:55:35', '2026-09-14 10:55:35'),
(4, 9, 'FUR-20260907-1004', '103997.00', '0.00', '150.00', '12479.64', '116626.64', 'cash_on_delivery', 'paid', 'returned', 4, 'Please deliver between 9am and 6pm.', '2026-09-07 12:55:35', '2026-09-14 10:55:35'),
(5, 10, 'FUR-20260904-1005', '65998.00', '6599.80', '150.00', '7127.78', '66675.98', 'paypal', 'paid', 'returned', 5, 'Please deliver between 9am and 6pm.', '2026-09-04 12:55:35', '2026-09-14 10:55:35'),
(6, 11, 'FUR-20260903-1006', '30499.00', '0.00', '150.00', '3659.88', '34308.88', 'paypal', 'pending', 'processing', 6, 'Please deliver between 9am and 6pm.', '2026-09-03 12:55:35', '2026-09-14 10:55:35'),
(7, 12, 'FUR-20260901-1007', '135998.00', '0.00', '150.00', '16319.76', '152467.76', 'paypal', 'failed', 'returned', 7, 'Please deliver between 9am and 6pm.', '2026-09-01 12:55:35', '2026-09-14 10:55:35'),
(8, 13, 'FUR-20260830-1008', '439999.00', '0.00', '150.00', '52799.88', '492948.88', 'cash_on_delivery', 'failed', 'pending', 8, 'Please deliver between 9am and 6pm.', '2026-08-30 12:55:35', '2026-09-14 10:55:35'),
(9, 14, 'FUR-20260827-1009', '81996.00', '0.00', '150.00', '9839.52', '91985.52', 'stripe', 'paid', 'returned', 9, 'Please deliver between 9am and 6pm.', '2026-08-27 12:55:35', '2026-09-14 10:55:35'),
(10, 15, 'FUR-20260825-1010', '139996.00', '13999.60', '150.00', '15119.57', '141265.97', 'stripe', 'paid', 'processing', 10, 'Please deliver between 9am and 6pm.', '2026-08-25 12:55:35', '2026-09-14 10:55:35'),
(11, 16, 'FUR-20260823-1011', '74900.00', '0.00', '150.00', '8988.00', '84038.00', 'paypal', 'refunded', 'returned', 11, 'Please deliver between 9am and 6pm.', '2026-08-23 12:55:35', '2026-09-14 10:55:35'),
(12, 17, 'FUR-20260822-1012', '167497.00', '0.00', '150.00', '20099.64', '187746.64', 'stripe', 'paid', 'shipped', 12, 'Please deliver between 9am and 6pm.', '2026-08-22 12:55:35', '2026-09-14 10:55:35'),
(13, 18, 'FUR-20260820-1013', '355797.00', '0.00', '150.00', '42695.64', '398642.64', 'cash_on_delivery', 'failed', 'pending', 13, 'Please deliver between 9am and 6pm.', '2026-08-20 12:55:35', '2026-09-14 10:55:35'),
(14, 19, 'FUR-20260817-1014', '10999.00', '0.00', '150.00', '1319.88', '12468.88', 'cash_on_delivery', 'paid', 'shipped', 14, 'Please deliver between 9am and 6pm.', '2026-08-17 12:55:35', '2026-09-14 10:55:35'),
(15, 5, 'FUR-20260816-1015', '31999.00', '3199.90', '150.00', '3455.89', '32404.99', 'stripe', 'paid', 'delivered', 15, 'Please deliver between 9am and 6pm.', '2026-08-16 12:55:35', '2026-09-14 10:55:35'),
(16, 6, 'FUR-20260814-1016', '144898.00', '0.00', '150.00', '17387.76', '162435.76', 'cash_on_delivery', 'paid', 'cancelled', 16, 'Please deliver between 9am and 6pm.', '2026-08-14 12:55:35', '2026-09-14 10:55:35'),
(17, 7, 'FUR-20260811-1017', '111798.00', '0.00', '150.00', '13415.76', '125363.76', 'stripe', 'failed', 'delivered', 17, 'Please deliver between 9am and 6pm.', '2026-08-11 12:55:35', '2026-09-14 10:55:35'),
(18, 8, 'FUR-20260809-1018', '48996.00', '0.00', '150.00', '5879.52', '55025.52', 'cash_on_delivery', 'pending', 'pending', 18, 'Please deliver between 9am and 6pm.', '2026-08-09 12:55:35', '2026-09-14 10:55:35'),
(19, 9, 'FUR-20260808-1019', '177996.00', '0.00', '150.00', '21359.52', '199505.52', 'paypal', 'pending', 'delivered', 19, 'Please deliver between 9am and 6pm.', '2026-08-08 12:55:35', '2026-09-14 10:55:35'),
(20, 10, 'FUR-20260806-1020', '194898.00', '19489.80', '150.00', '21048.98', '196607.18', 'cash_on_delivery', 'paid', 'processing', 20, 'Please deliver between 9am and 6pm.', '2026-08-06 12:55:35', '2026-09-14 10:55:35'),
(21, 11, 'FUR-20260804-1021', '96799.00', '0.00', '150.00', '11615.88', '108564.88', 'paypal', 'refunded', 'returned', 21, 'Please deliver between 9am and 6pm.', '2026-08-04 12:55:35', '2026-09-14 10:55:35'),
(22, 12, 'FUR-20260801-1022', '577998.00', '0.00', '150.00', '69359.76', '647507.76', 'cash_on_delivery', 'paid', 'pending', 22, 'Please deliver between 9am and 6pm.', '2026-08-01 12:55:35', '2026-09-14 10:55:35'),
(23, 13, 'FUR-20260730-1023', '121898.00', '0.00', '150.00', '14627.76', '136675.76', 'cash_on_delivery', 'failed', 'delivered', 23, 'Please deliver between 9am and 6pm.', '2026-07-30 12:55:35', '2026-09-14 10:55:35'),
(24, 14, 'FUR-20260729-1024', '31999.00', '0.00', '150.00', '3839.88', '35988.88', 'cash_on_delivery', 'paid', 'processing', 24, 'Please deliver between 9am and 6pm.', '2026-07-29 12:55:35', '2026-09-14 10:55:35'),
(25, 15, 'FUR-20260727-1025', '200798.00', '20079.80', '150.00', '21686.18', '202554.38', 'stripe', 'paid', 'shipped', 25, 'Please deliver between 9am and 6pm.', '2026-07-27 12:55:35', '2026-09-14 10:55:35'),
(26, 16, 'FUR-20260725-1026', '138996.00', '0.00', '150.00', '16679.52', '155825.52', 'cash_on_delivery', 'refunded', 'returned', 26, 'Please deliver between 9am and 6pm.', '2026-07-25 12:55:35', '2026-09-14 10:55:35'),
(27, 17, 'FUR-20260722-1027', '29900.00', '0.00', '150.00', '3588.00', '33638.00', 'cash_on_delivery', 'pending', 'delivered', 27, 'Please deliver between 9am and 6pm.', '2026-07-22 12:55:35', '2026-09-14 10:55:35'),
(28, 18, 'FUR-20260721-1028', '61499.00', '0.00', '150.00', '7379.88', '69028.88', 'stripe', 'failed', 'processing', 28, 'Please deliver between 9am and 6pm.', '2026-07-21 12:55:35', '2026-09-14 10:55:35'),
(29, 19, 'FUR-20260718-1029', '101994.00', '0.00', '150.00', '12239.28', '114383.28', 'stripe', 'pending', 'processing', 29, 'Please deliver between 9am and 6pm.', '2026-07-18 12:55:35', '2026-09-14 10:55:35'),
(30, 5, 'FUR-20260716-1030', '117999.00', '11799.90', '150.00', '12743.89', '119092.99', 'paypal', 'paid', 'shipped', 30, 'Please deliver between 9am and 6pm.', '2026-07-16 12:55:35', '2026-09-14 10:55:35'),
(31, 6, 'FUR-20260715-1031', '79998.00', '0.00', '150.00', '9599.76', '89747.76', 'paypal', 'paid', 'shipped', 31, 'Please deliver between 9am and 6pm.', '2026-07-15 12:55:35', '2026-09-14 10:55:35'),
(32, 7, 'FUR-20260712-1032', '87998.00', '0.00', '150.00', '10559.76', '98707.76', 'cash_on_delivery', 'paid', 'processing', 32, 'Please deliver between 9am and 6pm.', '2026-07-12 12:55:35', '2026-09-14 10:55:35'),
(33, 8, 'FUR-20260710-1033', '130996.00', '0.00', '150.00', '15719.52', '146865.52', 'stripe', 'pending', 'cancelled', 33, 'Please deliver between 9am and 6pm.', '2026-07-10 12:55:35', '2026-09-14 10:55:35'),
(34, 9, 'FUR-20260709-1034', '258800.00', '0.00', '150.00', '31056.00', '290006.00', 'stripe', 'refunded', 'delivered', 34, 'Please deliver between 9am and 6pm.', '2026-07-09 12:55:35', '2026-09-14 10:55:35'),
(35, 10, 'FUR-20260706-1035', '103900.00', '10390.00', '150.00', '11221.20', '104881.20', 'paypal', 'pending', 'delivered', 35, 'Please deliver between 9am and 6pm.', '2026-07-06 12:55:35', '2026-09-14 10:55:35'),
(36, 11, 'FUR-20260705-1036', '243796.00', '0.00', '150.00', '29255.52', '273201.52', 'paypal', 'paid', 'delivered', 36, 'Please deliver between 9am and 6pm.', '2026-07-05 12:55:35', '2026-09-14 10:55:35'),
(37, 12, 'FUR-20260703-1037', '149800.00', '0.00', '150.00', '17976.00', '167926.00', 'stripe', 'paid', 'delivered', 37, 'Please deliver between 9am and 6pm.', '2026-07-03 12:55:35', '2026-09-14 10:55:35'),
(38, 13, 'FUR-20260630-1038', '214699.00', '0.00', '150.00', '25763.88', '240612.88', 'stripe', 'paid', 'returned', 38, 'Please deliver between 9am and 6pm.', '2026-06-30 12:55:35', '2026-09-14 10:55:35'),
(39, 14, 'FUR-20260628-1039', '68898.00', '0.00', '150.00', '8267.76', '77315.76', 'paypal', 'refunded', 'delivered', 39, 'Please deliver between 9am and 6pm.', '2026-06-28 12:55:35', '2026-09-14 10:55:35'),
(40, 15, 'FUR-20260627-1040', '82995.00', '8299.50', '150.00', '8963.46', '83808.96', 'paypal', 'paid', 'cancelled', 40, 'Please deliver between 9am and 6pm.', '2026-06-27 12:55:35', '2026-09-14 10:55:35'),
(41, 16, 'FUR-20260625-1041', '302599.00', '0.00', '150.00', '36311.88', '339060.88', 'paypal', 'paid', 'shipped', 41, 'Please deliver between 9am and 6pm.', '2026-06-25 12:55:35', '2026-09-14 10:55:35'),
(42, 17, 'FUR-20260623-1042', '189997.00', '0.00', '150.00', '22799.64', '212946.64', 'cash_on_delivery', 'refunded', 'delivered', 42, 'Please deliver between 9am and 6pm.', '2026-06-23 12:55:35', '2026-09-14 10:55:35'),
(43, 18, 'FUR-20260621-1043', '48399.00', '0.00', '150.00', '5807.88', '54356.88', 'cash_on_delivery', 'paid', 'returned', 43, 'Please deliver between 9am and 6pm.', '2026-06-21 12:55:35', '2026-09-14 10:55:35'),
(44, 19, 'FUR-20260618-1044', '82999.00', '0.00', '150.00', '9959.88', '93108.88', 'stripe', 'paid', 'shipped', 44, 'Please deliver between 9am and 6pm.', '2026-06-18 12:55:35', '2026-09-14 10:55:35'),
(45, 5, 'FUR-20260617-1045', '141997.00', '14199.70', '150.00', '15335.68', '143282.98', 'cod', 'paid', 'delivered', 45, 'Please deliver between 9am and 6pm.', '2026-06-17 12:55:35', '2026-09-17 10:23:53'),
(50, 20, 'FUR-20260922-1001', '230799.00', '0.00', '150.00', '27695.88', '258644.88', 'cod', 'paid', 'delivered', 49, '', '2026-09-22 17:25:31', '2026-09-22 17:31:27'),
(52, 18, 'FUR-20260922-1002', '41900.00', '0.00', '150.00', '5028.00', '47078.00', 'cod', 'paid', 'delivered', 51, '', '2026-09-22 18:11:49', '2026-09-22 18:46:45'),
(55, 18, 'FUR-20260922-1003', '1199.00', '0.00', '150.00', '143.88', '1492.88', 'paypal', 'pending', 'pending', 54, '', '2026-09-22 18:28:16', '2026-09-22 18:28:16'),
(56, 18, 'FUR-20260922-1004', '20.00', '0.00', '150.00', '2.40', '172.40', 'paypal', 'pending', 'pending', 55, 'paypal option', '2026-09-22 18:33:15', '2026-09-22 18:33:15'),
(57, 18, 'FUR-20260922-1005', '20.00', '0.00', '150.00', '2.40', '172.40', 'paypal', 'pending', 'pending', 56, '', '2026-09-22 18:35:11', '2026-09-22 18:35:11'),
(59, 18, 'FUR-20260922-1006', '20.00', '0.00', '150.00', '2.40', '172.40', 'paypal', 'paid', 'pending', 58, '', '2026-09-22 18:44:03', '2026-09-22 18:44:16'),
(60, 20, 'FUR-20260923-1001', '414500.00', '0.00', '150.00', '49740.00', '464390.00', 'cod', 'paid', 'delivered', 59, '', '2026-09-23 11:12:20', '2026-09-23 11:18:47'),
(61, 20, 'FUR-20260923-1002', '11498.00', '0.00', '150.00', '1379.76', '13027.76', 'cod', 'paid', 'processing', 60, 'stripe payment', '2026-09-23 11:23:20', '2026-09-23 11:25:03'),
(62, 20, 'FUR-20260923-1003', '20.00', '0.00', '150.00', '2.40', '172.40', 'paypal', 'paid', 'delivered', 61, 'paypal payment', '2026-09-23 11:28:38', '2026-09-23 11:30:51');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `sku`, `quantity`, `price`, `total`, `created_at`, `updated_at`) VALUES
(1, 1, 11, 'Casa Verde Rattan Chair', 'SKU-CHR-004', 1, '10999.00', '10999.00', '2026-09-13 12:55:35', '2026-09-13 12:55:35'),
(2, 1, 43, 'ComfortCraft Bean Bag XL', 'SKU-BB-001', 1, '12999.00', '12999.00', '2026-09-13 12:55:35', '2026-09-13 12:55:35'),
(3, 2, 42, 'Rustica Patio Bench', 'SKU-OUT-003', 1, '16999.00', '16999.00', '2026-09-10 12:55:35', '2026-09-10 12:55:35'),
(4, 3, 26, 'Nordic Platform Bed', 'SKU-BED-003', 2, '41900.00', '83800.00', '2026-09-08 12:55:35', '2026-09-08 12:55:35'),
(5, 3, 42, 'Rustica Patio Bench', 'SKU-OUT-003', 1, '16999.00', '16999.00', '2026-09-08 12:55:35', '2026-09-08 12:55:35'),
(6, 4, 11, 'Casa Verde Rattan Chair', 'SKU-CHR-004', 1, '10999.00', '10999.00', '2026-09-07 12:55:35', '2026-09-07 12:55:35'),
(7, 4, 14, 'OakHaven Windsor Rocking Chair', 'SKU-CHR-007', 2, '14500.00', '29000.00', '2026-09-07 12:55:35', '2026-09-07 12:55:35'),
(8, 4, 41, 'UrbanNest Daybed Lounger', 'SKU-OUT-002', 2, '31999.00', '63998.00', '2026-09-07 12:55:35', '2026-09-07 12:55:35'),
(9, 5, 9, 'Nordic Accent Armchair', 'SKU-CHR-002', 1, '15999.00', '15999.00', '2026-09-04 12:55:35', '2026-09-04 12:55:35'),
(10, 5, 10, 'Rustica Power Recliner', 'SKU-CHR-003', 1, '49999.00', '49999.00', '2026-09-04 12:55:35', '2026-09-04 12:55:35'),
(11, 6, 14, 'OakHaven Windsor Rocking Chair', 'SKU-CHR-007', 1, '14500.00', '14500.00', '2026-09-03 12:55:35', '2026-09-03 12:55:35'),
(12, 6, 48, 'OakHaven Round Coffee Table', 'SKU-TBL-100', 1, '15999.00', '15999.00', '2026-09-03 12:55:35', '2026-09-03 12:55:35'),
(13, 7, 24, 'UrbanNest Queen Bed Frame', 'SKU-BED-001', 2, '67999.00', '135998.00', '2026-09-01 12:55:35', '2026-09-01 12:55:35'),
(14, 8, 6, 'The Ligne Leather Chesterfield', 'SKU-SOF-006', 2, '189000.00', '378000.00', '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(15, 8, 16, 'UrbanNest Round Marble Table', 'SKU-TBL-002', 1, '61999.00', '61999.00', '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(16, 9, 19, 'Atelier Bistro Table', 'SKU-TBL-005', 2, '18999.00', '37998.00', '2026-08-27 12:55:35', '2026-08-27 12:55:35'),
(17, 9, 37, 'UrbanNest Ergonomic Office Chair', 'SKU-OFF-002', 2, '21999.00', '43998.00', '2026-08-27 12:55:35', '2026-08-27 12:55:35'),
(18, 10, 11, 'Casa Verde Rattan Chair', 'SKU-CHR-004', 2, '10999.00', '21998.00', '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(19, 10, 30, 'Casa Verde Armoire Closet', 'SKU-WRD-002', 2, '58999.00', '117998.00', '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(20, 11, 31, 'Nordic Wardrobe Sliding Doors', 'SKU-WRD-003', 1, '74900.00', '74900.00', '2026-08-23 12:55:35', '2026-08-23 12:55:35'),
(21, 12, 21, 'OakHaven Upholstered Dining Chair', 'SKU-DCH-001', 1, '7499.00', '7499.00', '2026-08-22 12:55:35', '2026-08-22 12:55:35'),
(22, 12, 29, 'OakHaven 4-Door Wardrobe', 'SKU-WRD-001', 2, '79999.00', '159998.00', '2026-08-22 12:55:35', '2026-08-22 12:55:35'),
(23, 13, 28, 'Atelier Upholstered Twin Bed', 'SKU-BED-005', 1, '31999.00', '31999.00', '2026-08-20 12:55:35', '2026-08-20 12:55:35'),
(24, 13, 34, 'Rustica Industrial Cabinet', 'SKU-STR-003', 2, '46999.00', '93998.00', '2026-08-20 12:55:35', '2026-08-20 12:55:35'),
(25, 13, 47, 'Nordic Compact Living Set', 'SKU-LVS-002', 2, '114900.00', '229800.00', '2026-08-20 12:55:35', '2026-08-20 12:55:35'),
(26, 14, 22, 'UrbanNest Velvet Dining Chair', 'SKU-DCH-002', 1, '10999.00', '10999.00', '2026-08-17 12:55:35', '2026-08-17 12:55:35'),
(27, 15, 28, 'Atelier Upholstered Twin Bed', 'SKU-BED-005', 1, '31999.00', '31999.00', '2026-08-16 12:55:35', '2026-08-16 12:55:35'),
(28, 16, 2, 'UrbanNest L-Shape Sectional', 'SKU-SOF-002', 1, '84999.00', '84999.00', '2026-08-14 12:55:35', '2026-08-14 12:55:35'),
(29, 16, 8, 'Eames Style Lounge Chair', 'SKU-CHR-001', 1, '24999.00', '24999.00', '2026-08-14 12:55:35', '2026-08-14 12:55:35'),
(30, 16, 13, 'Atelier Lounge Recliner', 'SKU-CHR-006', 1, '34900.00', '34900.00', '2026-08-14 12:55:35', '2026-08-14 12:55:35'),
(31, 17, 42, 'Rustica Patio Bench', 'SKU-OUT-003', 2, '16999.00', '33998.00', '2026-08-11 12:55:35', '2026-08-11 12:55:35'),
(32, 17, 49, 'Atelier Media Console', 'SKU-STR-100', 2, '38900.00', '77800.00', '2026-08-11 12:55:35', '2026-08-11 12:55:35'),
(33, 18, 19, 'Atelier Bistro Table', 'SKU-TBL-005', 2, '18999.00', '37998.00', '2026-08-09 12:55:35', '2026-08-09 12:55:35'),
(34, 18, 44, 'Casa Verde Floor Pouf', 'SKU-BB-002', 2, '5499.00', '10998.00', '2026-08-09 12:55:35', '2026-08-09 12:55:35'),
(35, 19, 7, 'Atelier Mid-Century Wood Sofa', 'SKU-SOF-007', 2, '75999.00', '151998.00', '2026-08-08 12:55:35', '2026-08-08 12:55:35'),
(36, 19, 43, 'ComfortCraft Bean Bag XL', 'SKU-BB-001', 2, '12999.00', '25998.00', '2026-08-08 12:55:35', '2026-08-08 12:55:35'),
(37, 20, 13, 'Atelier Lounge Recliner', 'SKU-CHR-006', 1, '34900.00', '34900.00', '2026-08-06 12:55:35', '2026-08-06 12:55:35'),
(38, 20, 36, 'OakHaven Executive Desk', 'SKU-OFF-001', 2, '79999.00', '159998.00', '2026-08-06 12:55:35', '2026-08-06 12:55:35'),
(39, 21, 32, 'OakHaven Bookshelf 5-Tier', 'SKU-STR-001', 2, '24900.00', '49800.00', '2026-08-04 12:55:35', '2026-08-04 12:55:35'),
(40, 21, 34, 'Rustica Industrial Cabinet', 'SKU-STR-003', 1, '46999.00', '46999.00', '2026-08-04 12:55:35', '2026-08-04 12:55:35'),
(41, 22, 6, 'The Ligne Leather Chesterfield', 'SKU-SOF-006', 1, '189000.00', '189000.00', '2026-08-01 12:55:35', '2026-08-01 12:55:35'),
(42, 22, 27, 'The Ligne Adjustable Bed Set', 'SKU-BED-004', 1, '229000.00', '229000.00', '2026-08-01 12:55:35', '2026-08-01 12:55:35'),
(43, 22, 29, 'OakHaven 4-Door Wardrobe', 'SKU-WRD-001', 2, '79999.00', '159998.00', '2026-08-01 12:55:35', '2026-08-01 12:55:35'),
(44, 23, 11, 'Casa Verde Rattan Chair', 'SKU-CHR-004', 1, '10999.00', '10999.00', '2026-07-30 12:55:35', '2026-07-30 12:55:35'),
(45, 23, 26, 'Nordic Platform Bed', 'SKU-BED-003', 1, '41900.00', '41900.00', '2026-07-30 12:55:35', '2026-07-30 12:55:35'),
(46, 23, 40, 'Casa Verde Rattan Outdoor Set', 'SKU-OUT-001', 1, '68999.00', '68999.00', '2026-07-30 12:55:35', '2026-07-30 12:55:35'),
(47, 24, 28, 'Atelier Upholstered Twin Bed', 'SKU-BED-005', 1, '31999.00', '31999.00', '2026-07-29 12:55:35', '2026-07-29 12:55:35'),
(48, 25, 1, 'Haven 3-Seater Fabric Sofa', 'SKU-SOF-001', 1, '54999.00', '54999.00', '2026-07-27 12:55:35', '2026-07-27 12:55:35'),
(49, 25, 16, 'UrbanNest Round Marble Table', 'SKU-TBL-002', 1, '61999.00', '61999.00', '2026-07-27 12:55:35', '2026-07-27 12:55:35'),
(50, 25, 26, 'Nordic Platform Bed', 'SKU-BED-003', 2, '41900.00', '83800.00', '2026-07-27 12:55:35', '2026-07-27 12:55:35'),
(51, 26, 1, 'Haven 3-Seater Fabric Sofa', 'SKU-SOF-001', 1, '54999.00', '54999.00', '2026-07-25 12:55:35', '2026-07-25 12:55:35'),
(52, 26, 21, 'OakHaven Upholstered Dining Chair', 'SKU-DCH-001', 2, '7499.00', '14998.00', '2026-07-25 12:55:35', '2026-07-25 12:55:35'),
(53, 26, 40, 'Casa Verde Rattan Outdoor Set', 'SKU-OUT-001', 1, '68999.00', '68999.00', '2026-07-25 12:55:35', '2026-07-25 12:55:35'),
(54, 27, 12, 'The Ligne Velvet Club Chair', 'SKU-CHR-005', 1, '29900.00', '29900.00', '2026-07-22 12:55:35', '2026-07-22 12:55:35'),
(55, 28, 39, 'Atelier Writer Desk', 'SKU-OFF-004', 1, '29500.00', '29500.00', '2026-07-21 12:55:35', '2026-07-21 12:55:35'),
(56, 28, 41, 'UrbanNest Daybed Lounger', 'SKU-OUT-002', 1, '31999.00', '31999.00', '2026-07-21 12:55:35', '2026-07-21 12:55:35'),
(57, 29, 37, 'UrbanNest Ergonomic Office Chair', 'SKU-OFF-002', 2, '21999.00', '43998.00', '2026-07-18 12:55:35', '2026-07-18 12:55:35'),
(58, 29, 43, 'ComfortCraft Bean Bag XL', 'SKU-BB-001', 2, '12999.00', '25998.00', '2026-07-18 12:55:35', '2026-07-18 12:55:35'),
(59, 29, 48, 'OakHaven Round Coffee Table', 'SKU-TBL-100', 2, '15999.00', '31998.00', '2026-07-18 12:55:35', '2026-07-18 12:55:35'),
(60, 30, 30, 'Casa Verde Armoire Closet', 'SKU-WRD-002', 1, '58999.00', '58999.00', '2026-07-16 12:55:35', '2026-07-16 12:55:35'),
(61, 30, 39, 'Atelier Writer Desk', 'SKU-OFF-004', 2, '29500.00', '59000.00', '2026-07-16 12:55:35', '2026-07-16 12:55:35'),
(62, 31, 5, 'Casa Verde Compact Sofa', 'SKU-SOF-005', 2, '39999.00', '79998.00', '2026-07-15 12:55:35', '2026-07-15 12:55:35'),
(63, 32, 17, 'Nordic Extendable Table', 'SKU-TBL-003', 1, '74999.00', '74999.00', '2026-07-12 12:55:35', '2026-07-12 12:55:35'),
(64, 32, 43, 'ComfortCraft Bean Bag XL', 'SKU-BB-001', 1, '12999.00', '12999.00', '2026-07-12 12:55:35', '2026-07-12 12:55:35'),
(65, 33, 30, 'Casa Verde Armoire Closet', 'SKU-WRD-002', 2, '58999.00', '117998.00', '2026-07-10 12:55:35', '2026-07-10 12:55:35'),
(66, 33, 33, 'UrbanNest Floating Shelf Set', 'SKU-STR-002', 2, '6499.00', '12998.00', '2026-07-10 12:55:35', '2026-07-10 12:55:35'),
(67, 34, 6, 'The Ligne Leather Chesterfield', 'SKU-SOF-006', 1, '189000.00', '189000.00', '2026-07-09 12:55:35', '2026-07-09 12:55:35'),
(68, 34, 35, 'Nordic TV Console Stand', 'SKU-STR-004', 2, '34900.00', '69800.00', '2026-07-09 12:55:35', '2026-07-09 12:55:35'),
(69, 35, 14, 'OakHaven Windsor Rocking Chair', 'SKU-CHR-007', 2, '14500.00', '29000.00', '2026-07-06 12:55:35', '2026-07-06 12:55:35'),
(70, 35, 31, 'Nordic Wardrobe Sliding Doors', 'SKU-WRD-003', 1, '74900.00', '74900.00', '2026-07-06 12:55:35', '2026-07-06 12:55:35'),
(71, 36, 22, 'UrbanNest Velvet Dining Chair', 'SKU-DCH-002', 2, '10999.00', '21998.00', '2026-07-05 12:55:35', '2026-07-05 12:55:35'),
(72, 36, 26, 'Nordic Platform Bed', 'SKU-BED-003', 2, '41900.00', '83800.00', '2026-07-05 12:55:35', '2026-07-05 12:55:35'),
(73, 36, 40, 'Casa Verde Rattan Outdoor Set', 'SKU-OUT-001', 2, '68999.00', '137998.00', '2026-07-05 12:55:35', '2026-07-05 12:55:35'),
(74, 37, 31, 'Nordic Wardrobe Sliding Doors', 'SKU-WRD-003', 2, '74900.00', '149800.00', '2026-07-03 12:55:35', '2026-07-03 12:55:35'),
(75, 38, 12, 'The Ligne Velvet Club Chair', 'SKU-CHR-005', 2, '29900.00', '59800.00', '2026-06-30 12:55:35', '2026-06-30 12:55:35'),
(76, 38, 31, 'Nordic Wardrobe Sliding Doors', 'SKU-WRD-003', 1, '74900.00', '74900.00', '2026-06-30 12:55:35', '2026-06-30 12:55:35'),
(77, 38, 36, 'OakHaven Executive Desk', 'SKU-OFF-001', 1, '79999.00', '79999.00', '2026-06-30 12:55:35', '2026-06-30 12:55:35'),
(78, 39, 9, 'Nordic Accent Armchair', 'SKU-CHR-002', 1, '15999.00', '15999.00', '2026-06-28 12:55:35', '2026-06-28 12:55:35'),
(79, 39, 22, 'UrbanNest Velvet Dining Chair', 'SKU-DCH-002', 1, '10999.00', '10999.00', '2026-06-28 12:55:35', '2026-06-28 12:55:35'),
(80, 39, 26, 'Nordic Platform Bed', 'SKU-BED-003', 1, '41900.00', '41900.00', '2026-06-28 12:55:35', '2026-06-28 12:55:35'),
(81, 40, 10, 'Rustica Power Recliner', 'SKU-CHR-003', 1, '49999.00', '49999.00', '2026-06-27 12:55:35', '2026-06-27 12:55:35'),
(82, 40, 11, 'Casa Verde Rattan Chair', 'SKU-CHR-004', 2, '10999.00', '21998.00', '2026-06-27 12:55:35', '2026-06-27 12:55:35'),
(83, 40, 44, 'Casa Verde Floor Pouf', 'SKU-BB-002', 2, '5499.00', '10998.00', '2026-06-27 12:55:35', '2026-06-27 12:55:35'),
(84, 41, 17, 'Nordic Extendable Table', 'SKU-TBL-003', 1, '74999.00', '74999.00', '2026-06-25 12:55:35', '2026-06-25 12:55:35'),
(85, 41, 31, 'Nordic Wardrobe Sliding Doors', 'SKU-WRD-003', 2, '74900.00', '149800.00', '2026-06-25 12:55:35', '2026-06-25 12:55:35'),
(86, 41, 49, 'Atelier Media Console', 'SKU-STR-100', 2, '38900.00', '77800.00', '2026-06-25 12:55:35', '2026-06-25 12:55:35'),
(87, 42, 3, 'Nordic Sleeper Sofa', 'SKU-SOF-003', 1, '65999.00', '65999.00', '2026-06-23 12:55:35', '2026-06-23 12:55:35'),
(88, 42, 16, 'UrbanNest Round Marble Table', 'SKU-TBL-002', 2, '61999.00', '123998.00', '2026-06-23 12:55:35', '2026-06-23 12:55:35'),
(89, 43, 26, 'Nordic Platform Bed', 'SKU-BED-003', 1, '41900.00', '41900.00', '2026-06-21 12:55:35', '2026-06-21 12:55:35'),
(90, 43, 33, 'UrbanNest Floating Shelf Set', 'SKU-STR-002', 1, '6499.00', '6499.00', '2026-06-21 12:55:35', '2026-06-21 12:55:35'),
(91, 44, 18, 'Rustica Farmhouse Table', 'SKU-TBL-004', 1, '82999.00', '82999.00', '2026-06-18 12:55:35', '2026-06-18 12:55:35'),
(92, 45, 1, 'Haven 3-Seater Fabric Sofa', 'SKU-SOF-001', 2, '54999.00', '109998.00', '2026-06-17 12:55:35', '2026-06-17 12:55:35'),
(93, 45, 41, 'UrbanNest Daybed Lounger', 'SKU-OUT-002', 1, '31999.00', '31999.00', '2026-06-17 12:55:35', '2026-06-17 12:55:35'),
(96, 50, 4, 'Rustica Reclining Couch', 'SKU-SOF-004', 1, '99900.00', '99900.00', '2026-09-22 17:25:31', '2026-09-22 17:25:31'),
(97, 50, 48, 'OakHaven Round Coffee Table', 'SKU-TBL-100', 1, '15999.00', '15999.00', '2026-09-22 17:25:31', '2026-09-22 17:25:31'),
(98, 50, 47, 'Nordic Compact Living Set', 'SKU-LVS-002', 1, '114900.00', '114900.00', '2026-09-22 17:25:31', '2026-09-22 17:25:31'),
(100, 52, 26, 'Nordic Platform Bed', 'SKU-BED-003', 1, '41900.00', '41900.00', '2026-09-22 18:11:49', '2026-09-22 18:11:49'),
(103, 55, 51, 'Office Computer Desk with Drawers Black Home & Office Furniture', 'SKU-ZYXXRAKM', 1, '1199.00', '1199.00', '2026-09-22 18:28:16', '2026-09-22 18:28:16'),
(104, 56, 51, 'Office Computer Desk with Drawers Black Home & Office Furniture', 'SKU-ZYXXRAKM', 1, '20.00', '20.00', '2026-09-22 18:33:15', '2026-09-22 18:33:15'),
(105, 57, 51, 'Office Computer Desk with Drawers Black Home & Office Furniture', 'SKU-ZYXXRAKM', 1, '20.00', '20.00', '2026-09-22 18:35:11', '2026-09-22 18:35:11'),
(107, 59, 51, 'Office Computer Desk with Drawers Black Home & Office Furniture', 'SKU-ZYXXRAKM', 1, '20.00', '20.00', '2026-09-22 18:44:03', '2026-09-22 18:44:03'),
(108, 60, 46, 'ComfortCraft Full Living Room Set', 'SKU-LVS-001', 2, '199000.00', '398000.00', '2026-09-23 11:12:20', '2026-09-23 11:12:20'),
(109, 60, 45, 'UrbanNest Gaming Bean Chair', 'SKU-BB-003', 1, '16500.00', '16500.00', '2026-09-23 11:12:20', '2026-09-23 11:12:20'),
(110, 61, 23, 'Nordic Wooden Dining Chair', 'SKU-DCH-003', 1, '5999.00', '5999.00', '2026-09-23 11:23:20', '2026-09-23 11:23:20'),
(111, 61, 44, 'Casa Verde Floor Pouf', 'SKU-BB-002', 1, '5499.00', '5499.00', '2026-09-23 11:23:20', '2026-09-23 11:23:20'),
(112, 62, 51, 'Office Computer Desk with Drawers Black Home & Office Furniture', 'SKU-ZYXXRAKM', 1, '20.00', '20.00', '2026-09-23 11:28:38', '2026-09-23 11:28:38');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_logs`
--

CREATE TABLE `order_status_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('order','payment') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'order',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actor_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_status_logs`
--

INSERT INTO `order_status_logs` (`id`, `order_id`, `status`, `type`, `note`, `actor_id`, `created_at`) VALUES
(1, 45, 'delivered', 'order', 'Updated from admin panel', 1, '2026-09-17 07:53:00'),
(2, 45, 'delivered', 'order', 'Updated from admin panel', 1, '2026-09-17 10:23:53'),
(7, 50, 'pending', 'order', 'Order placed by customer.', 20, '2026-09-22 17:25:31'),
(8, 50, 'processing', 'order', 'Updated from admin panel', 1, '2026-09-22 17:28:23'),
(9, 50, 'shipped', 'order', 'Updated from admin panel', 1, '2026-09-22 17:31:02'),
(10, 50, 'delivered', 'order', 'Updated from admin panel', 1, '2026-09-22 17:31:27'),
(11, 50, 'paid', 'payment', 'Payment status updated', 1, '2026-09-22 17:31:27'),
(13, 52, 'pending', 'order', 'Order placed by customer.', 18, '2026-09-22 18:11:49'),
(14, 52, 'pending', 'payment', 'Payment received via Stripe (pi_3UIQhICXbPPKAWay1CjZ2bI3).', 18, '2026-09-22 18:13:15'),
(15, 52, 'processing', 'order', 'Updated from admin panel', 1, '2026-09-22 18:15:16'),
(18, 55, 'pending', 'order', 'Order placed by customer.', 18, '2026-09-22 18:28:16'),
(19, 56, 'pending', 'order', 'Order placed by customer.', 18, '2026-09-22 18:33:15'),
(20, 57, 'pending', 'order', 'Order placed by customer.', 18, '2026-09-22 18:35:11'),
(22, 59, 'pending', 'order', 'Order placed by customer.', 18, '2026-09-22 18:44:03'),
(23, 59, 'pending', 'payment', 'Payment received via PayPal (89G32790C26754529).', 18, '2026-09-22 18:44:16'),
(24, 52, 'delivered', 'order', 'Updated from admin panel', 1, '2026-09-22 18:46:45'),
(25, 60, 'pending', 'order', 'Order placed by customer.', 20, '2026-09-23 11:12:20'),
(26, 60, 'processing', 'order', 'Updated from admin panel', 1, '2026-09-23 11:17:46'),
(27, 60, 'shipped', 'order', 'Updated from admin panel', 1, '2026-09-23 11:18:19'),
(28, 60, 'delivered', 'order', 'Updated from admin panel', 1, '2026-09-23 11:18:47'),
(29, 60, 'paid', 'payment', 'Payment status updated', 1, '2026-09-23 11:18:47'),
(30, 61, 'pending', 'order', 'Order placed by customer.', 20, '2026-09-23 11:23:20'),
(31, 61, 'pending', 'payment', 'Payment received via Stripe (pi_3UIgn7CXbPPKAWay1L5w89Nq).', 20, '2026-09-23 11:24:21'),
(32, 61, 'processing', 'order', 'Updated from admin panel', 1, '2026-09-23 11:25:03'),
(33, 62, 'pending', 'order', 'Order placed by customer.', 20, '2026-09-23 11:28:38'),
(34, 62, 'pending', 'payment', 'Payment received via PayPal (17J877025U4360238).', 20, '2026-09-23 11:28:51'),
(35, 62, 'processing', 'order', 'Updated from admin panel', 1, '2026-09-23 11:29:28'),
(36, 62, 'shipped', 'order', 'Updated from admin panel', 1, '2026-09-23 11:30:29'),
(37, 62, 'delivered', 'order', 'Updated from admin panel', 1, '2026-09-23 11:30:51');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `transaction_id` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_gateway` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'PHP',
  `status` enum('pending','completed','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `transaction_id`, `payment_gateway`, `amount`, `currency`, `status`, `paid_at`, `created_at`, `updated_at`) VALUES
(1, 2, 'PAYID-69vexmsWF7tU', 'paypal', '19188.88', 'PHP', 'completed', '2026-09-10 12:55:35', '2026-09-10 12:55:35', '2026-09-10 12:55:35'),
(2, 3, 'ch_yaPTZpq8FSdBn4ubmDMK', 'stripe', '113044.88', 'PHP', 'completed', '2026-09-08 12:55:35', '2026-09-08 12:55:35', '2026-09-08 12:55:35'),
(3, 4, 'PAYID-4JCmXg8cUbtd', 'paypal', '116626.64', 'PHP', 'completed', '2026-09-07 12:55:35', '2026-09-07 12:55:35', '2026-09-07 12:55:35'),
(4, 5, 'PAYID-3FVrD5zvq49G', 'paypal', '66675.98', 'PHP', 'completed', '2026-09-04 12:55:35', '2026-09-04 12:55:35', '2026-09-04 12:55:35'),
(5, 9, 'PAYID-93AErVYU85Ww', 'paypal', '91985.52', 'PHP', 'completed', '2026-08-27 12:55:35', '2026-08-27 12:55:35', '2026-08-27 12:55:35'),
(6, 10, 'TXNqYxKAyNTQHtskV', 'cash_on_delivery', '141265.97', 'PHP', 'completed', '2026-08-25 12:55:35', '2026-08-25 12:55:35', '2026-08-25 12:55:35'),
(7, 12, 'TXN6EndMWj9qz3CvZ', 'cash_on_delivery', '187746.64', 'PHP', 'completed', '2026-08-22 12:55:35', '2026-08-22 12:55:35', '2026-08-22 12:55:35'),
(8, 14, 'PAYID-PNFMAq8avXkR', 'paypal', '12468.88', 'PHP', 'completed', '2026-08-17 12:55:35', '2026-08-17 12:55:35', '2026-08-17 12:55:35'),
(9, 15, 'TXNzVH4C78UFfewPJ', 'cash_on_delivery', '32404.99', 'PHP', 'completed', '2026-08-16 12:55:35', '2026-08-16 12:55:35', '2026-08-16 12:55:35'),
(10, 16, 'PAYID-WejCmtYvHndq', 'paypal', '162435.76', 'PHP', 'completed', '2026-08-14 12:55:35', '2026-08-14 12:55:35', '2026-08-14 12:55:35'),
(11, 20, 'TXNT7PCXNHasUhcy4', 'cash_on_delivery', '196607.18', 'PHP', 'completed', '2026-08-06 12:55:35', '2026-08-06 12:55:35', '2026-08-06 12:55:35'),
(12, 22, 'TXNfnMsPXC5zxjGDq', 'cash_on_delivery', '647507.76', 'PHP', 'completed', '2026-08-01 12:55:35', '2026-08-01 12:55:35', '2026-08-01 12:55:35'),
(13, 24, 'TXNfs5A2StF8RzgQD', 'cash_on_delivery', '35988.88', 'PHP', 'completed', '2026-07-29 12:55:35', '2026-07-29 12:55:35', '2026-07-29 12:55:35'),
(14, 25, 'ch_84bqf5BcG3PKYTuzSQWr', 'stripe', '202554.38', 'PHP', 'completed', '2026-07-27 12:55:35', '2026-07-27 12:55:35', '2026-07-27 12:55:35'),
(15, 30, 'ch_REPbgVay68Jtzeh5fMmF', 'stripe', '119092.99', 'PHP', 'completed', '2026-07-16 12:55:35', '2026-07-16 12:55:35', '2026-07-16 12:55:35'),
(16, 31, 'ch_v37qkKr8PMCJnEe9ygVc', 'stripe', '89747.76', 'PHP', 'completed', '2026-07-15 12:55:35', '2026-07-15 12:55:35', '2026-07-15 12:55:35'),
(17, 32, 'TXNJu6mWCMhAztkBD', 'cash_on_delivery', '98707.76', 'PHP', 'completed', '2026-07-12 12:55:35', '2026-07-12 12:55:35', '2026-07-12 12:55:35'),
(18, 36, 'TXNmCkpbwgr2PD685', 'cash_on_delivery', '273201.52', 'PHP', 'completed', '2026-07-05 12:55:35', '2026-07-05 12:55:35', '2026-07-05 12:55:35'),
(19, 37, 'ch_kdrKGJ85BauxjhXUSnAM', 'stripe', '167926.00', 'PHP', 'completed', '2026-07-03 12:55:35', '2026-07-03 12:55:35', '2026-07-03 12:55:35'),
(20, 38, 'PAYID-KdtrAZRBhfFG', 'paypal', '240612.88', 'PHP', 'completed', '2026-06-30 12:55:35', '2026-06-30 12:55:35', '2026-06-30 12:55:35'),
(21, 40, 'PAYID-9enSgHGCYtyA', 'paypal', '83808.96', 'PHP', 'completed', '2026-06-27 12:55:35', '2026-06-27 12:55:35', '2026-06-27 12:55:35'),
(22, 41, 'TXNtsTZndQjXyBkUm', 'cash_on_delivery', '339060.88', 'PHP', 'completed', '2026-06-25 12:55:35', '2026-06-25 12:55:35', '2026-06-25 12:55:35'),
(23, 43, 'ch_KCg6zZVvjJmDqS2r7kQR', 'stripe', '54356.88', 'PHP', 'completed', '2026-06-21 12:55:35', '2026-06-21 12:55:35', '2026-06-21 12:55:35'),
(24, 44, 'ch_y6R9wCYgMq5DmznWbpZs', 'stripe', '93108.88', 'PHP', 'completed', '2026-06-18 12:55:35', '2026-06-18 12:55:35', '2026-06-18 12:55:35'),
(25, 45, 'ch_qh2DSuwmM3TQ9zEZvrck', 'stripe', '143282.98', 'PHP', 'completed', '2026-06-17 12:55:35', '2026-06-17 12:55:35', '2026-06-17 12:55:35'),
(28, 50, NULL, 'cash_on_delivery', '258644.88', 'PHP', 'pending', NULL, '2026-09-22 17:25:31', '2026-09-22 17:25:31'),
(30, 52, 'pi_3UIQhICXbPPKAWay1CjZ2bI3', 'stripe', '47078.00', 'PHP', 'completed', '2026-09-22 18:13:15', '2026-09-22 18:11:49', '2026-09-22 18:13:15'),
(33, 55, '98P01470G8743545K', 'paypal', '1492.88', 'PHP', 'pending', NULL, '2026-09-22 18:28:16', '2026-09-22 18:28:16'),
(34, 56, '6FJ27165SP746964W', 'paypal', '172.40', 'PHP', 'pending', NULL, '2026-09-22 18:33:15', '2026-09-22 18:33:15'),
(35, 57, '3R2964447J7076056', 'paypal', '172.40', 'PHP', 'pending', NULL, '2026-09-22 18:35:11', '2026-09-22 18:35:11'),
(37, 59, '89G32790C26754529', 'paypal', '172.40', 'PHP', 'completed', '2026-09-22 18:44:16', '2026-09-22 18:44:03', '2026-09-22 18:44:16'),
(38, 60, NULL, 'cash_on_delivery', '464390.00', 'PHP', 'pending', NULL, '2026-09-23 11:12:20', '2026-09-23 11:12:20'),
(39, 61, 'pi_3UIgn7CXbPPKAWay1L5w89Nq', 'stripe', '13027.76', 'PHP', 'completed', '2026-09-23 11:24:21', '2026-09-23 11:23:20', '2026-09-23 11:24:21'),
(40, 62, '17J877025U4360238', 'paypal', '172.40', 'PHP', 'completed', '2026-09-23 11:28:51', '2026-09-23 11:28:38', '2026-09-23 11:28:51');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `brand_id` int(10) UNSIGNED DEFAULT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(220) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(12,2) DEFAULT NULL,
  `cost_price` decimal(12,2) DEFAULT NULL,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT '0',
  `minimum_stock` int(11) NOT NULL DEFAULT '10',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','inactive','draft') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `brand_id`, `sku`, `name`, `slug`, `short_description`, `description`, `price`, `sale_price`, `cost_price`, `weight`, `dimensions`, `stock_quantity`, `minimum_stock`, `featured`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'SKU-SOF-001', 'Haven 3-Seater Fabric Sofa', 'haven-3-seater-fabric-sofa-001', 'Plush cushions with durable linen fabric and solid wood frame.', 'Plush cushions with durable linen fabric and solid wood frame. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '64999.00', '54999.00', '42000.00', '42.50', '210 x 88 x 84 cm', 24, 5, 1, 'active', '2026-06-26 12:55:35', '2026-09-16 12:09:03'),
(2, 1, 3, 'SKU-SOF-002', 'UrbanNest L-Shape Sectional', 'urbannest-l-shape-sectional-002', 'Modern L-shape sectional with chaise lounge and reclining ends.', 'Modern L-shape sectional with chaise lounge and reclining ends. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '98999.00', '84999.00', '71000.00', '88.00', '280 x 168 x 85 cm', 12, 5, 1, 'active', '2026-06-27 12:55:35', '2026-09-16 12:07:56'),
(3, 1, 5, 'SKU-SOF-003', 'Nordic Sleeper Sofa', 'nordic-sleeper-sofa-003', 'Convertible sofa bed with memory foam mattress.', 'Convertible sofa bed with memory foam mattress. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '72999.00', '65999.00', '49000.00', '55.00', '205 x 90 x 80 cm', 8, 3, 0, 'active', '2026-06-28 12:55:35', '2026-09-16 12:06:56'),
(4, 1, 4, 'SKU-SOF-004', 'Rustica Reclining Couch', 'rustica-reclining-couch-004', 'Leather reclining sofa with cup holders and USB ports.', 'Leather reclining sofa with cup holders and USB ports. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '115000.00', '99900.00', '82000.00', '96.00', '230 x 95 x 105 cm', 6, 3, 0, 'active', '2026-06-29 12:55:35', '2026-09-16 12:03:22'),
(5, 1, 7, 'SKU-SOF-005', 'Casa Verde Compact Sofa', 'casa-verde-compact-sofa-005', 'Compact 2-seater sofa made from sustainable eucalyptus wood.', 'Compact 2-seater sofa made from sustainable eucalyptus wood. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '45999.00', '39999.00', '31000.00', '33.00', '170 x 82 x 82 cm', 15, 4, 0, 'active', '2026-06-30 12:55:35', '2026-09-16 12:02:27'),
(6, 1, 6, 'SKU-SOF-006', 'The Ligne Leather Chesterfield', 'the-ligne-leather-chesterfield-006', 'Classic chesterfield sofa in premium full grain leather.', 'Classic chesterfield sofa in premium full grain leather. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '189000.00', NULL, '142000.00', '110.00', '235 x 100 x 80 cm', 4, 2, 1, 'active', '2026-07-01 12:55:35', '2026-09-16 12:01:34'),
(7, 1, 8, 'SKU-SOF-007', 'Atelier Mid-Century Wood Sofa', 'atelier-mid-century-wood-sofa-007', 'Mid-century style sofa with solid teak frame and linen cushions.', 'Mid-century style sofa with solid teak frame and linen cushions. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '82999.00', '75999.00', '58000.00', '62.00', '200 x 85 x 78 cm', 7, 3, 0, 'active', '2026-07-02 12:55:35', '2026-09-16 12:00:31'),
(8, 3, 3, 'SKU-CHR-001', 'Eames Style Lounge Chair', 'eames-style-lounge-chair-001', 'Iconic lounge chair with leather seat and molded shell.', 'Iconic lounge chair with leather seat and molded shell. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '28500.00', '24999.00', '18000.00', '12.00', '85 x 68 x 62 cm', 30, 8, 1, 'active', '2026-07-03 12:55:35', '2026-09-16 11:58:56'),
(9, 3, 5, 'SKU-CHR-002', 'Nordic Accent Armchair', 'nordic-accent-armchair-002', 'Warm oak armchair with woven seat.', 'Warm oak armchair with woven seat. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '18999.00', '15999.00', '12000.00', '9.80', '72 x 60 x 78 cm', 26, 6, 0, 'active', '2026-07-04 12:55:35', '2026-09-16 11:57:47'),
(10, 3, 4, 'SKU-CHR-003', 'Rustica Power Recliner', 'rustica-power-recliner-003', 'Massaging power recliner with heated back support.', 'Massaging power recliner with heated back support. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '54999.00', '49999.00', '36000.00', '28.00', '98 x 88 x 105 cm', 10, 3, 0, 'active', '2026-07-05 12:55:35', '2026-09-16 11:57:04'),
(11, 3, 7, 'SKU-CHR-004', 'Casa Verde Rattan Chair', 'casa-verde-rattan-chair-004', 'Handwoven rattan lounge chair, resilient and stylish.', 'Handwoven rattan lounge chair, resilient and stylish. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '12500.00', '10999.00', '8200.00', '6.20', '70 x 75 x 88 cm', 40, 10, 0, 'active', '2026-07-06 12:55:35', '2026-09-16 11:56:13'),
(12, 3, 6, 'SKU-CHR-005', 'The Ligne Velvet Club Chair', 'the-ligne-velvet-club-chair-005', 'Crushed velvet club chair with gold tipped legs.', 'Crushed velvet club chair with gold tipped legs. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '32500.00', '29900.00', '22500.00', '14.00', '78 x 72 x 80 cm', 18, 5, 1, 'active', '2026-07-07 12:55:35', '2026-09-16 11:55:19'),
(13, 3, 8, 'SKU-CHR-006', 'Atelier Lounge Recliner', 'atelier-lounge-recliner-006', 'Handcrafted recliner with natural wool cushion.', 'Handcrafted recliner with natural wool cushion. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '38900.00', '34900.00', '27000.00', '19.00', '90 x 80 x 98 cm', 11, 3, 0, 'active', '2026-07-08 12:55:35', '2026-09-16 11:54:15'),
(14, 3, 2, 'SKU-CHR-007', 'OakHaven Windsor Rocking Chair', 'oakhaven-windsor-rocking-chair-007', 'Solid oak rocking chair, smooth gliding motion.', 'Solid oak rocking chair, smooth gliding motion. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '16999.00', '14500.00', '10800.00', '11.00', '64 x 62 x 98 cm', 22, 5, 0, 'active', '2026-07-09 12:55:35', '2026-09-16 11:53:00'),
(15, 4, 2, 'SKU-TBL-001', 'OakHaven 6-Seater Dining Table', 'oakhaven-6-seater-dining-table-001', 'Solid acacia wood dining table seats six comfortably.', 'Solid acacia wood dining table seats six comfortably. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '55999.00', '49900.00', '38000.00', '55.00', '180 x 90 x 75 cm', 14, 4, 0, 'active', '2026-07-10 12:55:35', '2026-09-16 11:52:11'),
(16, 4, 3, 'SKU-TBL-002', 'UrbanNest Round Marble Table', 'urbannest-round-marble-table-002', 'Round marble top table with gold metal base.', 'Round marble top table with gold metal base. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '68999.00', '61999.00', '46000.00', '51.00', '110 diameter x 75 cm', 9, 3, 0, 'active', '2026-07-11 12:55:35', '2026-09-16 11:51:27'),
(17, 4, 5, 'SKU-TBL-003', 'Nordic Extendable Table', 'nordic-extendable-table-003', 'Extendable oak table that seats 4 to 8 people.', 'Extendable oak table that seats 4 to 8 people. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '74999.00', NULL, '53000.00', '60.00', '120–220 x 90 x 74 cm', 7, 3, 0, 'active', '2026-07-12 12:55:35', '2026-09-16 11:50:32'),
(18, 4, 4, 'SKU-TBL-004', 'Rustica Farmhouse Table', 'rustica-farmhouse-table-004', 'Reclaimed wood farmhouse table with steel legs.', 'Reclaimed wood farmhouse table with steel legs. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '92000.00', '82999.00', '68000.00', '74.00', '200 x 100 x 76 cm', 5, 2, 0, 'active', '2026-07-13 12:55:35', '2026-09-16 11:49:46'),
(19, 4, 8, 'SKU-TBL-005', 'Atelier Bistro Table', 'atelier-bistro-table-005', 'Compact bistro table for two with foldable leaves.', 'Compact bistro table for two with foldable leaves. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '21999.00', '18999.00', '14000.00', '18.00', '75 x 75 x 74 cm', 33, 8, 0, 'active', '2026-07-14 12:55:35', '2026-09-16 11:48:51'),
(20, 4, 7, 'SKU-TBL-006', 'Casa Verde Teak Dining Table', 'casa-verde-teak-dining-table-006', 'Natural teak dining table with butterfly extension.', 'Natural teak dining table with butterfly extension. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '64999.00', '58000.00', '44000.00', '48.00', '170 x 95 x 75 cm', 13, 4, 1, 'active', '2026-07-15 12:55:35', '2026-09-16 11:45:21'),
(21, 5, 2, 'SKU-DCH-001', 'OakHaven Upholstered Dining Chair', 'oakhaven-upholstered-dining-chair-001', 'Comfortable cushioned dining chair with oak legs.', 'Comfortable cushioned dining chair with oak legs. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '8999.00', '7499.00', '5600.00', '5.50', '48 x 54 x 90 cm', 48, 12, 0, 'active', '2026-07-16 12:55:35', '2026-09-16 11:43:53'),
(22, 5, 3, 'SKU-DCH-002', 'UrbanNest Velvet Dining Chair', 'urbannest-velvet-dining-chair-002', 'Velvet upholstered chair with brushed brass frame.', 'Velvet upholstered chair with brushed brass frame. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '12999.00', '10999.00', '8600.00', '4.80', '46 x 55 x 88 cm', 36, 10, 0, 'active', '2026-07-17 12:55:35', '2026-09-16 11:42:52'),
(23, 5, 5, 'SKU-DCH-003', 'Nordic Wooden Dining Chair', 'nordic-wooden-dining-chair-003', 'Simple solid beech wood dining chair.', 'Simple solid beech wood dining chair. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '6999.00', '5999.00', '4300.00', '4.10', '45 x 52 x 86 cm', 60, 15, 0, 'active', '2026-07-18 12:55:35', '2026-09-16 11:41:50'),
(24, 6, 3, 'SKU-BED-001', 'UrbanNest Queen Bed Frame', 'urbannest-queen-bed-frame-001', 'Upholstered queen bed with headboard and storage drawers.', 'Upholstered queen bed with headboard and storage drawers. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '74999.00', '67999.00', '51000.00', '78.00', '160 x 200 x 110 cm', 10, 3, 1, 'active', '2026-07-19 12:55:35', '2026-09-16 11:40:47'),
(25, 6, 4, 'SKU-BED-002', 'Rustica King Solid Wood Bed', 'rustica-king-solid-wood-bed-002', 'Solid wood king bed frame with built-in nightstands.', 'Solid wood king bed frame with built-in nightstands. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '115000.00', '104900.00', '84000.00', '120.00', '200 x 210 x 95 cm', 6, 2, 0, 'active', '2026-07-20 12:55:35', '2026-09-16 11:39:42'),
(26, 6, 5, 'SKU-BED-003', 'Nordic Platform Bed', 'nordic-platform-bed-003', 'Low profile platform bed in white oak.', 'Low profile platform bed in white oak. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '46800.00', '41900.00', '32000.00', '52.00', '180 x 200 x 35 cm', 16, 4, 0, 'active', '2026-07-21 12:55:35', '2026-09-16 11:37:29'),
(27, 6, 6, 'SKU-BED-004', 'The Ligne Adjustable Bed Set', 'the-ligne-adjustable-bed-set-004', 'Adjustable base with massage and zero gravity positions.', 'Adjustable base with massage and zero gravity positions. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '249000.00', '229000.00', '180000.00', '150.00', '190 x 210 x 40 cm', 3, 1, 0, 'active', '2026-07-22 12:55:35', '2026-09-16 11:36:43'),
(28, 6, 8, 'SKU-BED-005', 'Atelier Upholstered Twin Bed', 'atelier-upholstered-twin-bed-005', 'Tufted upholstered bed for kids rooms.', 'Tufted upholstered bed for kids rooms. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '35999.00', '31999.00', '24000.00', '38.00', '110 x 200 x 95 cm', 20, 5, 0, 'active', '2026-07-23 12:55:35', '2026-09-16 11:35:58'),
(29, 7, 2, 'SKU-WRD-001', 'OakHaven 4-Door Wardrobe', 'oakhaven-4-door-wardrobe-001', 'Spacious wardrobe with 4 doors and sliding mirrors.', 'Spacious wardrobe with 4 doors and sliding mirrors. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '87999.00', '79999.00', '62000.00', '95.00', '160 x 60 x 210 cm', 8, 2, 0, 'active', '2026-07-24 12:55:35', '2026-09-16 11:34:51'),
(30, 7, 7, 'SKU-WRD-002', 'Casa Verde Armoire Closet', 'casa-verde-armoire-closet-002', 'Two-door armoire with drawers and hanging rails.', 'Two-door armoire with drawers and hanging rails. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '64999.00', '58999.00', '43000.00', '70.00', '120 x 58 x 200 cm', 12, 3, 0, 'active', '2026-07-25 12:55:35', '2026-09-16 11:33:26'),
(31, 7, 5, 'SKU-WRD-003', 'Nordic Wardrobe Sliding Doors', 'nordic-wardrobe-sliding-doors-003', 'Minimalist wardrobe with matte sliding doors.', 'Minimalist wardrobe with matte sliding doors. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '74900.00', NULL, '54000.00', '88.00', '150 x 62 x 210 cm', 9, 3, 0, 'active', '2026-07-26 12:55:35', '2026-09-16 11:32:34'),
(32, 8, 2, 'SKU-STR-001', 'OakHaven Bookshelf 5-Tier', 'oakhaven-bookshelf-5-tier-001', 'Five tier solid wood bookshelf, extra storage.', 'Five tier solid wood bookshelf, extra storage. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '28500.00', '24900.00', '19500.00', '31.00', '80 x 32 x 190 cm', 28, 6, 0, 'active', '2026-07-27 12:55:35', '2026-09-16 11:31:39'),
(33, 8, 3, 'SKU-STR-002', 'UrbanNest Floating Shelf Set', 'urbannest-floating-shelf-set-002', 'Set of 3 wall mounted walnut shelves.', 'Set of 3 wall mounted walnut shelves. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '7499.00', '6499.00', '4800.00', '7.00', '60 x 22 x 4 cm', 44, 10, 0, 'active', '2026-07-28 12:55:35', '2026-09-16 11:30:40'),
(34, 8, 4, 'SKU-STR-003', 'Rustica Industrial Cabinet', 'rustica-industrial-cabinet-003', 'Steel and wood storage cabinet with barn doors.', 'Steel and wood storage cabinet with barn doors. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '51999.00', '46999.00', '36000.00', '45.00', '90 x 40 x 155 cm', 17, 4, 0, 'active', '2026-07-29 12:55:35', '2026-09-16 11:29:41'),
(35, 8, 5, 'SKU-STR-004', 'Nordic TV Console Stand', 'nordic-tv-console-stand-004', 'Clean line TV stand with cable management.', 'Clean line TV stand with cable management. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '38900.00', '34900.00', '26000.00', '35.00', '160 x 40 x 48 cm', 21, 5, 0, 'active', '2026-07-30 12:55:35', '2026-09-16 11:28:33'),
(36, 9, 2, 'SKU-OFF-001', 'OakHaven Executive Desk', 'oakhaven-executive-desk-001', 'Solid oak executive desk with drawer pedestals.', 'Solid oak executive desk with drawer pedestals. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '88999.00', '79999.00', '61000.00', '68.00', '180 x 75 x 76 cm', 12, 3, 0, 'active', '2026-07-31 12:55:35', '2026-09-16 11:27:35'),
(37, 9, 3, 'SKU-OFF-002', 'UrbanNest Ergonomic Office Chair', 'urbannest-ergonomic-office-chair-002', 'Mesh ergonomic chair with lumbar support.', 'Mesh ergonomic chair with lumbar support. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '24999.00', '21999.00', '16000.00', '16.00', '70 x 70 x 120 cm', 38, 8, 1, 'active', '2026-08-01 12:55:35', '2026-09-16 11:26:53'),
(38, 9, 5, 'SKU-OFF-003', 'Nordic Standing Desk', 'nordic-standing-desk-003', 'Electric height adjustable standing desk.', 'Electric height adjustable standing desk. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '46900.00', '41900.00', '33000.00', '40.00', '140 x 70 x 75–125 cm', 19, 4, 0, 'active', '2026-08-02 12:55:35', '2026-09-16 11:25:31'),
(39, 9, 8, 'SKU-OFF-004', 'Atelier Writer Desk', 'atelier-writer-desk-004', 'Compact handcrafted writing desk with drawer.', 'Compact handcrafted writing desk with drawer. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '32999.00', '29500.00', '22500.00', '26.00', '110 x 55 x 76 cm', 24, 5, 0, 'active', '2026-08-03 12:55:35', '2026-09-16 11:14:33'),
(40, 10, 7, 'SKU-OUT-001', 'Casa Verde Rattan Outdoor Set', 'casa-verde-rattan-outdoor-set-001', 'Rattan outdoor lounge set with two chairs and table.', 'Rattan outdoor lounge set with two chairs and table. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '75999.00', '68999.00', '52000.00', '64.00', '2-piece set', 11, 3, 1, 'active', '2026-08-04 12:55:35', '2026-09-16 11:13:25'),
(41, 10, 3, 'SKU-OUT-002', 'UrbanNest Daybed Lounger', 'urbannest-daybed-lounger-002', 'Sun lounger daybed with adjustable back.', 'Sun lounger daybed with adjustable back. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '35999.00', '31999.00', '24000.00', '22.00', '190 x 75 x 30 cm', 16, 4, 0, 'active', '2026-08-05 12:55:35', '2026-09-16 11:12:23'),
(42, 10, 4, 'SKU-OUT-003', 'Rustica Patio Bench', 'rustica-patio-bench-003', 'Weather resistant outdoor bench seating three.', 'Weather resistant outdoor bench seating three. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '18999.00', '16999.00', '12000.00', '24.00', '150 x 55 x 80 cm', 27, 6, 0, 'active', '2026-08-06 12:55:35', '2026-09-16 11:11:15'),
(43, 11, 1, 'SKU-BB-001', 'ComfortCraft Bean Bag XL', 'comfortcraft-bean-bag-xl-001', 'Extra large bean bag with memory foam fill.', 'Extra large bean bag with memory foam fill. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '14999.00', '12999.00', '9000.00', '9.00', '110 x 95 cm', 50, 12, 1, 'active', '2026-08-07 12:55:35', '2026-09-16 11:10:19'),
(44, 11, 7, 'SKU-BB-002', 'Casa Verde Floor Pouf', 'casa-verde-floor-pouf-002', 'Square woven cotton floor pouf.', 'Square woven cotton floor pouf. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '6499.00', '5499.00', '3800.00', '4.50', '55 x 55 x 25 cm', 60, 15, 0, 'active', '2026-08-08 12:55:35', '2026-09-16 11:09:19'),
(45, 11, 3, 'SKU-BB-003', 'UrbanNest Gaming Bean Chair', 'urbannest-gaming-bean-chair-003', 'Bucket shaped bean bag chair for gamers.', 'Bucket shaped bean bag chair for gamers. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '18999.00', '16500.00', '12000.00', '10.00', '100 x 90 cm', 35, 8, 0, 'active', '2026-08-09 12:55:35', '2026-09-16 11:08:24'),
(46, 2, 1, 'SKU-LVS-001', 'ComfortCraft Full Living Room Set', 'comfortcraft-full-living-room-set-001', 'Complete sofa, loveseat, accent chair and coffee table set.', 'Complete sofa, loveseat, accent chair and coffee table set. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '229000.00', '199000.00', '160000.00', '210.00', '4-piece set', 5, 2, 1, 'active', '2026-08-10 12:55:35', '2026-09-16 11:06:36'),
(47, 2, 5, 'SKU-LVS-002', 'Nordic Compact Living Set', 'nordic-compact-living-set-002', 'Sofa bed with coffee table and shelf combo.', 'Sofa bed with coffee table and shelf combo. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '129999.00', '114900.00', '88000.00', '130.00', '3-piece set', 8, 2, 0, 'active', '2026-08-11 12:55:35', '2026-09-15 17:12:04'),
(48, 1, 2, 'SKU-TBL-100', 'OakHaven Round Coffee Table', 'oakhaven-round-coffee-table-100', 'Solid wood round coffee table with lower shelf.', 'Solid wood round coffee table with lower shelf. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '18500.00', '15999.00', '12500.00', '16.00', '90 diameter x 45 cm', 32, 8, 0, 'active', '2026-08-12 12:55:35', '2026-09-15 08:26:11'),
(49, 8, 8, 'SKU-STR-100', 'Atelier Media Console', 'atelier-media-console-100', 'Solid wood media console for living room electronics.', 'Solid wood media console for living room electronics. Crafted with premium materials for lasting comfort and style. Perfect for modern homes.', '43500.00', '38900.00', '30000.00', '38.00', '150 x 40 x 50 cm', 15, 4, 0, 'active', '2026-08-13 12:55:35', '2026-09-15 17:03:44'),
(51, 3, 7, 'SKU-ZYXXRAKM', 'Office Computer Desk with Drawers Black Home & Office Furniture', 'office-computer-desk-with-drawers-black-home-office-furniture', 'Transform your workspace with this 59\" black office desk, featuring a durable pinewood top and modern geometric metal base. With three spacious drawers and ample desktop space (59.1\"L x 27.6\"W), it keeps essentials organised while providing room for multiple monitors. The stylish abstract base design adds contemporary flair to any home office or workspace. Easy to assemble and maintain - just wipe clean.', 'Transform your workspace with this 59\" black office desk, featuring a durable pinewood top and modern geometric metal base. With three spacious drawers and ample desktop space (59.1\"L x 27.6\"W), it keeps essentials organised while providing room for multiple monitors. The stylish abstract base design adds contemporary flair to any home office or workspace. Easy to assemble and maintain - just wipe clean.\r\nSpacious 59-Inch Worksurface: Generous desktop area comfortably accommodates dual monitors, laptops, and work materials.\r\n\r\nThree Functional Drawers: Ample storage for office supplies, files, and tech accessories to maintain a clutter-free workspace.\r\n\r\nModern Geometric Base: Abstract metal legs provide stability while adding artistic contemporary style to your office.\r\n\r\nPremium Pinewood Construction: Natural wood desktop offers lasting durability with a smooth, professional work surface.\r\n\r\nSleek Black Finish: Timeless colour scheme blends seamlessly with both modern and traditional office decor.\r\n\r\nEasy Assembly & Maintenance: Simple setup process with all hardware included, plus wipe-clean surfaces.', '20.00', '20.00', '20.00', '10.00', ' 59.1\"L x 27.6\"W x 29.5\"H', 5, 10, 0, 'active', '2026-09-15 17:10:36', '2026-09-23 11:15:19');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image`, `is_primary`, `sort_order`, `created_at`, `updated_at`) VALUES
(98, 49, 'products/81owdzh-vwl-ac-sx569_a4281af79baf.jpg', 0, 0, '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(100, 48, 'products/2222_9026cec6f2e9.webp', 1, 0, '2026-09-15 08:26:11', '2026-09-15 08:26:11'),
(101, 51, 'products/22222_f089e47c1baa.webp', 1, 0, '2026-09-15 17:10:36', '2026-09-15 17:10:36'),
(102, 47, 'products/33333_aa7a95e29046.jpeg', 1, 0, '2026-09-15 17:12:04', '2026-09-15 17:12:04'),
(103, 46, 'products/4444_b0d3c6d1b7ae.jpeg', 1, 0, '2026-09-16 11:06:36', '2026-09-16 11:06:36'),
(104, 45, 'products/11111_160b439d68a5.jpeg', 1, 0, '2026-09-16 11:08:24', '2026-09-16 11:08:24'),
(105, 44, 'products/22222_ef01bab67a78.jpeg', 1, 0, '2026-09-16 11:09:19', '2026-09-16 11:09:19'),
(106, 43, 'products/3333_ab856a93f1d9.webp', 1, 0, '2026-09-16 11:10:19', '2026-09-16 11:10:19'),
(107, 42, 'products/3333_85c6cef3061d.jpeg', 1, 0, '2026-09-16 11:11:15', '2026-09-16 11:11:15'),
(108, 41, 'products/444444_9f495d8debbf.jpeg', 1, 0, '2026-09-16 11:12:23', '2026-09-16 11:12:23'),
(109, 40, 'products/55555_a74296f8eda7.jpeg', 1, 0, '2026-09-16 11:13:25', '2026-09-16 11:13:25'),
(110, 39, 'products/66666_8217e37b91d5.jpeg', 1, 0, '2026-09-16 11:14:33', '2026-09-16 11:14:33'),
(111, 38, 'products/7777777_8e5b354f841c.webp', 1, 0, '2026-09-16 11:25:31', '2026-09-16 11:25:31'),
(112, 37, 'products/11111_47074b1b92af.jpeg', 1, 0, '2026-09-16 11:26:53', '2026-09-16 11:26:53'),
(113, 36, 'products/22222_3830aedb4d3d.jpeg', 1, 0, '2026-09-16 11:27:35', '2026-09-16 11:27:35'),
(114, 35, 'products/3333_ac9d26020c64.jpg', 1, 0, '2026-09-16 11:28:33', '2026-09-16 11:28:33'),
(115, 34, 'products/3333_f531f1a1fca3.jpeg', 1, 0, '2026-09-16 11:29:41', '2026-09-16 11:29:41'),
(116, 33, 'products/4444_3fc058ec7caa.jpeg', 1, 0, '2026-09-16 11:30:40', '2026-09-16 11:30:40'),
(117, 32, 'products/555555_024b46fabdb3.jpeg', 1, 0, '2026-09-16 11:31:39', '2026-09-16 11:31:39'),
(118, 31, 'products/66666_1c8bb432ef97.jpeg', 1, 0, '2026-09-16 11:32:34', '2026-09-16 11:32:34'),
(119, 30, 'products/77777_cad690f25b68.jpeg', 1, 0, '2026-09-16 11:33:26', '2026-09-16 11:33:26'),
(120, 29, 'products/88888_cb36e55ddbdc.jpeg', 1, 0, '2026-09-16 11:34:51', '2026-09-16 11:34:51'),
(121, 28, 'products/111_8be910cf4c83.jpeg', 1, 0, '2026-09-16 11:35:58', '2026-09-16 11:35:58'),
(122, 27, 'products/22222_421a46fde1e4.jpeg', 1, 0, '2026-09-16 11:36:43', '2026-09-16 11:36:43'),
(123, 26, 'products/3333_f177fbc5c915.jpeg', 1, 0, '2026-09-16 11:37:29', '2026-09-16 11:37:29'),
(124, 25, 'products/33335555_dacdeb2c59f8.jpeg', 1, 0, '2026-09-16 11:39:42', '2026-09-16 11:39:42'),
(125, 24, 'products/44444_cbeff34638c5.webp', 1, 0, '2026-09-16 11:40:47', '2026-09-16 11:40:47'),
(126, 23, 'products/55555_1a740bd0ea3c.jpeg', 1, 0, '2026-09-16 11:41:50', '2026-09-16 11:41:50'),
(127, 22, 'products/666666_ed9477edf3c7.jpeg', 1, 0, '2026-09-16 11:42:52', '2026-09-16 11:42:52'),
(128, 21, 'products/1111_d5ea6438eb72.jpeg', 1, 0, '2026-09-16 11:43:53', '2026-09-16 11:43:53'),
(129, 20, 'products/2222_2043abd47aa5.jpeg', 1, 0, '2026-09-16 11:45:21', '2026-09-16 11:45:21'),
(130, 19, 'products/3333_5a7c9fb06709.jpeg', 1, 0, '2026-09-16 11:48:51', '2026-09-16 11:48:51'),
(131, 18, 'products/4444_4d6e2cd3a997.jpeg', 1, 0, '2026-09-16 11:49:46', '2026-09-16 11:49:46'),
(132, 17, 'products/5555_91c193240f0c.jpeg', 1, 0, '2026-09-16 11:50:32', '2026-09-16 11:50:32'),
(133, 16, 'products/66666_1a15e6f063c7.jpeg', 1, 0, '2026-09-16 11:51:27', '2026-09-16 11:51:27'),
(134, 15, 'products/7777_86ac12d8421d.jpeg', 1, 0, '2026-09-16 11:52:11', '2026-09-16 11:52:11'),
(135, 14, 'products/88888_317c9064d21f.jpeg', 1, 0, '2026-09-16 11:53:00', '2026-09-16 11:53:00'),
(136, 13, 'products/1111_61bdbf1ef8c6.jpeg', 1, 0, '2026-09-16 11:54:15', '2026-09-16 11:54:15'),
(137, 12, 'products/2222_9138922e416e.jpeg', 1, 0, '2026-09-16 11:55:19', '2026-09-16 11:55:19'),
(138, 11, 'products/3333_fa5581f12c93.jpeg', 1, 0, '2026-09-16 11:56:13', '2026-09-16 11:56:13'),
(139, 10, 'products/4444_39aec2e70888.jpeg', 1, 0, '2026-09-16 11:57:04', '2026-09-16 11:57:04'),
(140, 9, 'products/55555_9a70661057e3.jpeg', 1, 0, '2026-09-16 11:57:47', '2026-09-16 11:57:47'),
(141, 8, 'products/66666_9b9d3c2c18ae.webp', 1, 0, '2026-09-16 11:58:56', '2026-09-16 11:58:56'),
(142, 7, 'products/1111_805df322276d.jpeg', 1, 0, '2026-09-16 12:00:31', '2026-09-16 12:00:31'),
(143, 6, 'products/222222_df43f9f5e4a6.jpeg', 1, 0, '2026-09-16 12:01:34', '2026-09-16 12:01:34'),
(144, 5, 'products/33333_028077f39967.jpeg', 1, 0, '2026-09-16 12:02:27', '2026-09-16 12:02:27'),
(145, 4, 'products/444444_f66619e24066.jpeg', 1, 0, '2026-09-16 12:03:22', '2026-09-16 12:03:22'),
(146, 3, 'products/55555_6082520502c1.jpeg', 1, 0, '2026-09-16 12:06:56', '2026-09-16 12:06:56'),
(147, 2, 'products/77777_dad830365735.jpeg', 1, 0, '2026-09-16 12:07:56', '2026-09-16 12:07:56'),
(148, 1, 'products/9999_ad92122af8c2.jpeg', 1, 0, '2026-09-16 12:09:03', '2026-09-16 12:09:03');

-- --------------------------------------------------------

--
-- Table structure for table `product_specifications`
--

CREATE TABLE `product_specifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `attribute_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attribute_value` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_specifications`
--

INSERT INTO `product_specifications` (`id`, `product_id`, `attribute_name`, `attribute_value`, `created_at`, `updated_at`) VALUES
(1, 1, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(2, 1, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(3, 1, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(4, 1, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(5, 1, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(6, 2, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(7, 2, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(8, 2, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(9, 2, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(10, 2, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(11, 3, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(12, 3, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(13, 3, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(14, 3, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(15, 3, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(16, 4, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(17, 4, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(18, 4, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(19, 4, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(20, 4, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(21, 5, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(22, 5, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(23, 5, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(24, 5, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(25, 5, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(26, 6, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(27, 6, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(28, 6, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(29, 6, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(30, 6, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(31, 7, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(32, 7, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(33, 7, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(34, 7, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(35, 7, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(36, 8, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(37, 8, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(38, 8, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(39, 8, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(40, 8, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(41, 9, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(42, 9, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(43, 9, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(44, 9, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(45, 9, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(46, 10, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(47, 10, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(48, 10, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(49, 10, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(50, 10, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(51, 11, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(52, 11, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(53, 11, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(54, 11, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(55, 11, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(56, 12, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(57, 12, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(58, 12, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(59, 12, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(60, 12, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(61, 13, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(62, 13, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(63, 13, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(64, 13, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(65, 13, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(66, 14, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(67, 14, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(68, 14, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(69, 14, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(70, 14, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(71, 15, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(72, 15, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(73, 15, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(74, 15, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(75, 15, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(76, 16, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(77, 16, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(78, 16, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(79, 16, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(80, 16, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(81, 17, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(82, 17, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(83, 17, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(84, 17, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(85, 17, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(86, 18, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(87, 18, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(88, 18, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(89, 18, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(90, 18, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(91, 19, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(92, 19, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(93, 19, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(94, 19, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(95, 19, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(96, 20, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(97, 20, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(98, 20, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(99, 20, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(100, 20, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(101, 21, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(102, 21, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(103, 21, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(104, 21, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(105, 21, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(106, 22, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(107, 22, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(108, 22, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(109, 22, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(110, 22, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(111, 23, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(112, 23, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(113, 23, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(114, 23, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(115, 23, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(116, 24, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(117, 24, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(118, 24, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(119, 24, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(120, 24, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(121, 25, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(122, 25, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(123, 25, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(124, 25, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(125, 25, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(126, 26, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(127, 26, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(128, 26, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(129, 26, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(130, 26, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(131, 27, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(132, 27, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(133, 27, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(134, 27, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(135, 27, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(136, 28, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(137, 28, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(138, 28, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(139, 28, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(140, 28, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(141, 29, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(142, 29, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(143, 29, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(144, 29, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(145, 29, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(146, 30, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(147, 30, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(148, 30, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(149, 30, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(150, 30, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(151, 31, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(152, 31, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(153, 31, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(154, 31, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(155, 31, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(156, 32, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(157, 32, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(158, 32, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(159, 32, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(160, 32, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(161, 33, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(162, 33, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(163, 33, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(164, 33, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(165, 33, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(166, 34, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(167, 34, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(168, 34, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(169, 34, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(170, 34, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(171, 35, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(172, 35, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(173, 35, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(174, 35, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(175, 35, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(176, 36, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(177, 36, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(178, 36, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(179, 36, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(180, 36, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(181, 37, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(182, 37, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(183, 37, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(184, 37, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(185, 37, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(186, 38, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(187, 38, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(188, 38, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(189, 38, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(190, 38, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(191, 39, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(192, 39, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(193, 39, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(194, 39, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(195, 39, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(196, 40, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(197, 40, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(198, 40, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(199, 40, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(200, 40, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(201, 41, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(202, 41, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(203, 41, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(204, 41, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(205, 41, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(206, 42, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(207, 42, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(208, 42, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(209, 42, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(210, 42, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(211, 43, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(212, 43, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(213, 43, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(214, 43, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(215, 43, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(216, 44, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(217, 44, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(218, 44, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(219, 44, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(220, 44, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(221, 45, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(222, 45, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(223, 45, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(224, 45, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(225, 45, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(226, 46, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(227, 46, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(228, 46, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(229, 46, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(230, 46, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(231, 47, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(232, 47, 'Color', 'Charcoal Grey', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(233, 47, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(234, 47, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(235, 47, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(236, 48, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(237, 48, 'Color', 'Cream Beige', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(238, 48, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(239, 48, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(240, 48, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(241, 49, 'Material', 'Premium solid wood & fabric', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(242, 49, 'Color', 'Natural Oak', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(243, 49, 'Assembly', 'Easy assembly included', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(244, 49, 'Warranty', '2 years', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(245, 49, 'Origin', 'Handcrafted', '2026-09-14 10:55:35', '2026-09-14 10:55:35'),
(246, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:52:05', '2026-09-15 07:52:05'),
(247, 49, 'Color', 'Natural Oak', '2026-09-15 07:52:05', '2026-09-15 07:52:05'),
(248, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:52:05', '2026-09-15 07:52:05'),
(249, 49, 'Warranty', '2 years', '2026-09-15 07:52:05', '2026-09-15 07:52:05'),
(250, 49, 'Origin', 'Handcrafted', '2026-09-15 07:52:05', '2026-09-15 07:52:05'),
(251, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(252, 49, 'Color', 'Natural Oak', '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(253, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(254, 49, 'Warranty', '2 years', '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(255, 49, 'Origin', 'Handcrafted', '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(256, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(257, 49, 'Color', 'Natural Oak', '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(258, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(259, 49, 'Warranty', '2 years', '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(260, 49, 'Origin', 'Handcrafted', '2026-09-15 07:52:43', '2026-09-15 07:52:43'),
(261, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(262, 49, 'Color', 'Natural Oak', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(263, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(264, 49, 'Warranty', '2 years', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(265, 49, 'Origin', 'Handcrafted', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(266, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(267, 49, 'Color', 'Natural Oak', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(268, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(269, 49, 'Warranty', '2 years', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(270, 49, 'Origin', 'Handcrafted', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(271, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(272, 49, 'Color', 'Natural Oak', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(273, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(274, 49, 'Warranty', '2 years', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(275, 49, 'Origin', 'Handcrafted', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(276, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(277, 49, 'Color', 'Natural Oak', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(278, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(279, 49, 'Warranty', '2 years', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(280, 49, 'Origin', 'Handcrafted', '2026-09-15 07:52:51', '2026-09-15 07:52:51'),
(281, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(282, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(283, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(284, 49, 'Warranty', '2 years', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(285, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(286, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(287, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(288, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(289, 49, 'Warranty', '2 years', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(290, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(291, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(292, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(293, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(294, 49, 'Warranty', '2 years', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(295, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(296, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(297, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(298, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(299, 49, 'Warranty', '2 years', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(300, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(301, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(302, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(303, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(304, 49, 'Warranty', '2 years', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(305, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(306, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(307, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(308, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(309, 49, 'Warranty', '2 years', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(310, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(311, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(312, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(313, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(314, 49, 'Warranty', '2 years', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(315, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(316, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(317, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(318, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(319, 49, 'Warranty', '2 years', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(320, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:15', '2026-09-15 07:53:15'),
(321, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(322, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(323, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(324, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(325, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(326, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(327, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(328, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(329, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(330, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(331, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(332, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(333, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(334, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(335, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(336, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(337, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(338, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(339, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(340, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(341, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(342, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(343, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(344, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(345, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(346, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(347, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(348, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(349, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(350, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(351, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(352, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(353, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(354, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(355, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(356, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(357, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(358, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(359, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(360, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(361, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(362, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(363, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(364, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(365, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(366, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(367, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(368, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(369, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(370, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(371, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(372, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(373, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(374, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(375, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(376, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(377, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(378, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(379, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(380, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(381, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(382, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(383, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(384, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(385, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(386, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(387, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(388, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(389, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(390, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(391, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(392, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(393, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(394, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(395, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(396, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(397, 49, 'Color', 'Natural Oak', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(398, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(399, 49, 'Warranty', '2 years', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(400, 49, 'Origin', 'Handcrafted', '2026-09-15 07:53:21', '2026-09-15 07:53:21'),
(401, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(402, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(403, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(404, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(405, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(406, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(407, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(408, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(409, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(410, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(411, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(412, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(413, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(414, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(415, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(416, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(417, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(418, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(419, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(420, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(421, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(422, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(423, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(424, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(425, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(426, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(427, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(428, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(429, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(430, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(431, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(432, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(433, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(434, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(435, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(436, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(437, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(438, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(439, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(440, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(441, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(442, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(443, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(444, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(445, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(446, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(447, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(448, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(449, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(450, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(451, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(452, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(453, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(454, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(455, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(456, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(457, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(458, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(459, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(460, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(461, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(462, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(463, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(464, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(465, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(466, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(467, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(468, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(469, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(470, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(471, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(472, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(473, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(474, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(475, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(476, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(477, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(478, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(479, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(480, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(481, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(482, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(483, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(484, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(485, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(486, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(487, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(488, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(489, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(490, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(491, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(492, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(493, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(494, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(495, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(496, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(497, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(498, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(499, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(500, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(501, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(502, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(503, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(504, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(505, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(506, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(507, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(508, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(509, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(510, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(511, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(512, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(513, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(514, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(515, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(516, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(517, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(518, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(519, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(520, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(521, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(522, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(523, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(524, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(525, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(526, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(527, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(528, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(529, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(530, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(531, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(532, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(533, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(534, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(535, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(536, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(537, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(538, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(539, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(540, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(541, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(542, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(543, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(544, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(545, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(546, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(547, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(548, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(549, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(550, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(551, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(552, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(553, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(554, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(555, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(556, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(557, 49, 'Color', 'Natural Oak', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(558, 49, 'Assembly', 'Easy assembly included', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(559, 49, 'Warranty', '2 years', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(560, 49, 'Origin', 'Handcrafted', '2026-09-15 07:54:46', '2026-09-15 07:54:46'),
(565, 48, 'Material', 'Premium solid wood & fabric', '2026-09-15 08:26:11', '2026-09-15 08:26:11'),
(566, 48, 'Color', 'Cream Beige', '2026-09-15 08:26:11', '2026-09-15 08:26:11'),
(567, 48, 'Assembly', 'Easy assembly included', '2026-09-15 08:26:11', '2026-09-15 08:26:11'),
(568, 48, 'Warranty', '2 years', '2026-09-15 08:26:11', '2026-09-15 08:26:11'),
(569, 48, 'Origin', 'Handcrafted', '2026-09-15 08:26:11', '2026-09-15 08:26:11'),
(570, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(571, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(572, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(573, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(574, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(575, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(576, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(577, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(578, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(579, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(580, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(581, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(582, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(583, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(584, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(585, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(586, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(587, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10');
INSERT INTO `product_specifications` (`id`, `product_id`, `attribute_name`, `attribute_value`, `created_at`, `updated_at`) VALUES
(588, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(589, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(590, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(591, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(592, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(593, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(594, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(595, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(596, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(597, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(598, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(599, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(600, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(601, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(602, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(603, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(604, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(605, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(606, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(607, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(608, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(609, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(610, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(611, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(612, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(613, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(614, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(615, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(616, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(617, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(618, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(619, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(620, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(621, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(622, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(623, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(624, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(625, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(626, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(627, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(628, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(629, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(630, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(631, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(632, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(633, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(634, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(635, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(636, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(637, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(638, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(639, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(640, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(641, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(642, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(643, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(644, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(645, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(646, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(647, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(648, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(649, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(650, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(651, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(652, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(653, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(654, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(655, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(656, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(657, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(658, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(659, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(660, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(661, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(662, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(663, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(664, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(665, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(666, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(667, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(668, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(669, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(670, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(671, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(672, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(673, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(674, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(675, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(676, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(677, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(678, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(679, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(680, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(681, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(682, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(683, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(684, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(685, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(686, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(687, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(688, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(689, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(690, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(691, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(692, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(693, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(694, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(695, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(696, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(697, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(698, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(699, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(700, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(701, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(702, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(703, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(704, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(705, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(706, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(707, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(708, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(709, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(710, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(711, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(712, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(713, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(714, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(715, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(716, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(717, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(718, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(719, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(720, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(721, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(722, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(723, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(724, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(725, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(726, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(727, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(728, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(729, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(730, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(731, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(732, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(733, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(734, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(735, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(736, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(737, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(738, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(739, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(740, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(741, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(742, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(743, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(744, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(745, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(746, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(747, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(748, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(749, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(750, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(751, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(752, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(753, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(754, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(755, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(756, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(757, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(758, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(759, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(760, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(761, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(762, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(763, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(764, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(765, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(766, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(767, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(768, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(769, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(770, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(771, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(772, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(773, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(774, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(775, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(776, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(777, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(778, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(779, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(780, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(781, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(782, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(783, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(784, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(785, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(786, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(787, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(788, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(789, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(790, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(791, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(792, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(793, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(794, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(795, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(796, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(797, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(798, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(799, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(800, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(801, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(802, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(803, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(804, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(805, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(806, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(807, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(808, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(809, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(810, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(811, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(812, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(813, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(814, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(815, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(816, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(817, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(818, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(819, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(820, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(821, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(822, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(823, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(824, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(825, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(826, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(827, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(828, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(829, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(830, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(831, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(832, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(833, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(834, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(835, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(836, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(837, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(838, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(839, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(840, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(841, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(842, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(843, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(844, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(845, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(846, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(847, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(848, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(849, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(850, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(851, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(852, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(853, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(854, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(855, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(856, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(857, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(858, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(859, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(860, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(861, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(862, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(863, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(864, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(865, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(866, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(867, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(868, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(869, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(870, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(871, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(872, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(873, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(874, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(875, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(876, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(877, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(878, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(879, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(880, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(881, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(882, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(883, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(884, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(885, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(886, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(887, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(888, 49, 'Warranty', '2 years', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(889, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:10', '2026-09-15 17:03:10'),
(890, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(891, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(892, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(893, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(894, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(895, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(896, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(897, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(898, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(899, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(900, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(901, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(902, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(903, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(904, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(905, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(906, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(907, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(908, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(909, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(910, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(911, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(912, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(913, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(914, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(915, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(916, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(917, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(918, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(919, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(920, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(921, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(922, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(923, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(924, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(925, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(926, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(927, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(928, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(929, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(930, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(931, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(932, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(933, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(934, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(935, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(936, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(937, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(938, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(939, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(940, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(941, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(942, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(943, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(944, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(945, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(946, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(947, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(948, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(949, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(950, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(951, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(952, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(953, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(954, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(955, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(956, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(957, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(958, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(959, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(960, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(961, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(962, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(963, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(964, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(965, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(966, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(967, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(968, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(969, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(970, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(971, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(972, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(973, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(974, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(975, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(976, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(977, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(978, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(979, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(980, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(981, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(982, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(983, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(984, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(985, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(986, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(987, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(988, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(989, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(990, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(991, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(992, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(993, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(994, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(995, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(996, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(997, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(998, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(999, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1000, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1001, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1002, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1003, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1004, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1005, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1006, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1007, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1008, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1009, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1010, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1011, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1012, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1013, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1014, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1015, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1016, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1017, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1018, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1019, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1020, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1021, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1022, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1023, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1024, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1025, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1026, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1027, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1028, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1029, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1030, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1031, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1032, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1033, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1034, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1035, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1036, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1037, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1038, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1039, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1040, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1041, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1042, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1043, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1044, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1045, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1046, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1047, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1048, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1049, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1050, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1051, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1052, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1053, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1054, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1055, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1056, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1057, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1058, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1059, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1060, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1061, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1062, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1063, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1064, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1065, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1066, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1067, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1068, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1069, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1070, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1071, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1072, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1073, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1074, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1075, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1076, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1077, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1078, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1079, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1080, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1081, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1082, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1083, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1084, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1085, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1086, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1087, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1088, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1089, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1090, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1091, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1092, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1093, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1094, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1095, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1096, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1097, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1098, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1099, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1100, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1101, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1102, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1103, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1104, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1105, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1106, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1107, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1108, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1109, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1110, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1111, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1112, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1113, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1114, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1115, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1116, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1117, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1118, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1119, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1120, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1121, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1122, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1123, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1124, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1125, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1126, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1127, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1128, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1129, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1130, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1131, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1132, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1133, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1134, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1135, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1136, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1137, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1138, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1139, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1140, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1141, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1142, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1143, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1144, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1145, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1146, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1147, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1148, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1149, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1150, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1151, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1152, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1153, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1154, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1155, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1156, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1157, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1158, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1159, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1160, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1161, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1162, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1163, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1164, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1165, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1166, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1167, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44');
INSERT INTO `product_specifications` (`id`, `product_id`, `attribute_name`, `attribute_value`, `created_at`, `updated_at`) VALUES
(1168, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1169, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1170, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1171, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1172, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1173, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1174, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1175, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1176, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1177, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1178, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1179, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1180, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1181, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1182, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1183, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1184, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1185, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1186, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1187, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1188, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1189, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1190, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1191, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1192, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1193, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1194, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1195, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1196, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1197, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1198, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1199, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1200, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1201, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1202, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1203, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1204, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1205, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1206, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1207, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1208, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1209, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1210, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1211, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1212, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1213, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1214, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1215, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1216, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1217, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1218, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1219, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1220, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1221, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1222, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1223, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1224, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1225, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1226, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1227, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1228, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1229, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1230, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1231, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1232, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1233, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1234, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1235, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1236, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1237, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1238, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1239, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1240, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1241, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1242, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1243, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1244, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1245, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1246, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1247, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1248, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1249, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1250, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1251, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1252, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1253, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1254, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1255, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1256, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1257, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1258, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1259, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1260, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1261, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1262, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1263, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1264, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1265, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1266, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1267, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1268, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1269, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1270, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1271, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1272, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1273, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1274, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1275, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1276, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1277, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1278, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1279, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1280, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1281, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1282, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1283, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1284, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1285, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1286, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1287, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1288, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1289, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1290, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1291, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1292, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1293, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1294, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1295, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1296, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1297, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1298, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1299, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1300, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1301, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1302, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1303, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1304, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1305, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1306, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1307, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1308, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1309, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1310, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1311, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1312, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1313, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1314, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1315, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1316, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1317, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1318, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1319, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1320, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1321, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1322, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1323, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1324, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1325, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1326, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1327, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1328, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1329, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1330, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1331, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1332, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1333, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1334, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1335, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1336, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1337, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1338, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1339, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1340, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1341, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1342, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1343, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1344, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1345, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1346, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1347, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1348, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1349, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1350, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1351, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1352, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1353, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1354, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1355, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1356, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1357, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1358, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1359, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1360, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1361, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1362, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1363, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1364, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1365, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1366, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1367, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1368, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1369, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1370, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1371, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1372, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1373, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1374, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1375, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1376, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1377, 49, 'Assembly', 'Easy assembly included', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1378, 49, 'Warranty', '2 years', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1379, 49, 'Origin', 'Handcrafted', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1380, 49, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1381, 49, 'Color', 'Natural Oak', '2026-09-15 17:03:44', '2026-09-15 17:03:44'),
(1382, 51, 'Color', 'Black', '2026-09-15 17:10:36', '2026-09-15 17:10:36'),
(1383, 51, 'Top Material', 'Pine Wood', '2026-09-15 17:10:36', '2026-09-15 17:10:36'),
(1384, 51, 'Base Material', 'Metal', '2026-09-15 17:10:36', '2026-09-15 17:10:36'),
(1385, 51, 'Color', 'Black', '2026-09-15 17:11:04', '2026-09-15 17:11:04'),
(1386, 51, 'Top Material', 'Pine Wood', '2026-09-15 17:11:04', '2026-09-15 17:11:04'),
(1387, 51, 'Base Material', 'Metal', '2026-09-15 17:11:04', '2026-09-15 17:11:04'),
(1388, 47, 'Material', 'Premium solid wood & fabric', '2026-09-15 17:12:04', '2026-09-15 17:12:04'),
(1389, 47, 'Color', 'Charcoal Grey', '2026-09-15 17:12:04', '2026-09-15 17:12:04'),
(1390, 47, 'Assembly', 'Easy assembly included', '2026-09-15 17:12:04', '2026-09-15 17:12:04'),
(1391, 47, 'Warranty', '2 years', '2026-09-15 17:12:04', '2026-09-15 17:12:04'),
(1392, 47, 'Origin', 'Handcrafted', '2026-09-15 17:12:04', '2026-09-15 17:12:04'),
(1393, 46, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:06:36', '2026-09-16 11:06:36'),
(1394, 46, 'Color', 'Natural Oak', '2026-09-16 11:06:36', '2026-09-16 11:06:36'),
(1395, 46, 'Assembly', 'Easy assembly included', '2026-09-16 11:06:36', '2026-09-16 11:06:36'),
(1396, 46, 'Warranty', '2 years', '2026-09-16 11:06:36', '2026-09-16 11:06:36'),
(1397, 46, 'Origin', 'Handcrafted', '2026-09-16 11:06:36', '2026-09-16 11:06:36'),
(1398, 45, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:08:24', '2026-09-16 11:08:24'),
(1399, 45, 'Color', 'Cream Beige', '2026-09-16 11:08:24', '2026-09-16 11:08:24'),
(1400, 45, 'Assembly', 'Easy assembly included', '2026-09-16 11:08:24', '2026-09-16 11:08:24'),
(1401, 45, 'Warranty', '2 years', '2026-09-16 11:08:24', '2026-09-16 11:08:24'),
(1402, 45, 'Origin', 'Handcrafted', '2026-09-16 11:08:24', '2026-09-16 11:08:24'),
(1403, 44, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:09:19', '2026-09-16 11:09:19'),
(1404, 44, 'Color', 'Charcoal Grey', '2026-09-16 11:09:19', '2026-09-16 11:09:19'),
(1405, 44, 'Assembly', 'Easy assembly included', '2026-09-16 11:09:19', '2026-09-16 11:09:19'),
(1406, 44, 'Warranty', '2 years', '2026-09-16 11:09:19', '2026-09-16 11:09:19'),
(1407, 44, 'Origin', 'Handcrafted', '2026-09-16 11:09:19', '2026-09-16 11:09:19'),
(1408, 43, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:10:19', '2026-09-16 11:10:19'),
(1409, 43, 'Color', 'Natural Oak', '2026-09-16 11:10:19', '2026-09-16 11:10:19'),
(1410, 43, 'Assembly', 'Easy assembly included', '2026-09-16 11:10:19', '2026-09-16 11:10:19'),
(1411, 43, 'Warranty', '2 years', '2026-09-16 11:10:19', '2026-09-16 11:10:19'),
(1412, 43, 'Origin', 'Handcrafted', '2026-09-16 11:10:19', '2026-09-16 11:10:19'),
(1413, 42, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:11:15', '2026-09-16 11:11:15'),
(1414, 42, 'Color', 'Cream Beige', '2026-09-16 11:11:15', '2026-09-16 11:11:15'),
(1415, 42, 'Assembly', 'Easy assembly included', '2026-09-16 11:11:15', '2026-09-16 11:11:15'),
(1416, 42, 'Warranty', '2 years', '2026-09-16 11:11:15', '2026-09-16 11:11:15'),
(1417, 42, 'Origin', 'Handcrafted', '2026-09-16 11:11:15', '2026-09-16 11:11:15'),
(1418, 41, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:12:23', '2026-09-16 11:12:23'),
(1419, 41, 'Color', 'Charcoal Grey', '2026-09-16 11:12:23', '2026-09-16 11:12:23'),
(1420, 41, 'Assembly', 'Easy assembly included', '2026-09-16 11:12:23', '2026-09-16 11:12:23'),
(1421, 41, 'Warranty', '2 years', '2026-09-16 11:12:23', '2026-09-16 11:12:23'),
(1422, 41, 'Origin', 'Handcrafted', '2026-09-16 11:12:23', '2026-09-16 11:12:23'),
(1423, 40, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:13:25', '2026-09-16 11:13:25'),
(1424, 40, 'Color', 'Natural Oak', '2026-09-16 11:13:25', '2026-09-16 11:13:25'),
(1425, 40, 'Assembly', 'Easy assembly included', '2026-09-16 11:13:25', '2026-09-16 11:13:25'),
(1426, 40, 'Warranty', '2 years', '2026-09-16 11:13:25', '2026-09-16 11:13:25'),
(1427, 40, 'Origin', 'Handcrafted', '2026-09-16 11:13:25', '2026-09-16 11:13:25'),
(1428, 39, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:14:33', '2026-09-16 11:14:33'),
(1429, 39, 'Color', 'Cream Beige', '2026-09-16 11:14:33', '2026-09-16 11:14:33'),
(1430, 39, 'Assembly', 'Easy assembly included', '2026-09-16 11:14:33', '2026-09-16 11:14:33'),
(1431, 39, 'Warranty', '2 years', '2026-09-16 11:14:33', '2026-09-16 11:14:33'),
(1432, 39, 'Origin', 'Handcrafted', '2026-09-16 11:14:33', '2026-09-16 11:14:33'),
(1433, 38, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:25:31', '2026-09-16 11:25:31'),
(1434, 38, 'Color', 'Charcoal Grey', '2026-09-16 11:25:31', '2026-09-16 11:25:31'),
(1435, 38, 'Assembly', 'Easy assembly included', '2026-09-16 11:25:31', '2026-09-16 11:25:31'),
(1436, 38, 'Warranty', '2 years', '2026-09-16 11:25:31', '2026-09-16 11:25:31'),
(1437, 38, 'Origin', 'Handcrafted', '2026-09-16 11:25:31', '2026-09-16 11:25:31'),
(1438, 37, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:26:53', '2026-09-16 11:26:53'),
(1439, 37, 'Color', 'Natural Oak', '2026-09-16 11:26:53', '2026-09-16 11:26:53'),
(1440, 37, 'Assembly', 'Easy assembly included', '2026-09-16 11:26:53', '2026-09-16 11:26:53'),
(1441, 37, 'Warranty', '2 years', '2026-09-16 11:26:53', '2026-09-16 11:26:53'),
(1442, 37, 'Origin', 'Handcrafted', '2026-09-16 11:26:53', '2026-09-16 11:26:53'),
(1443, 36, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:27:35', '2026-09-16 11:27:35'),
(1444, 36, 'Color', 'Cream Beige', '2026-09-16 11:27:35', '2026-09-16 11:27:35'),
(1445, 36, 'Assembly', 'Easy assembly included', '2026-09-16 11:27:35', '2026-09-16 11:27:35'),
(1446, 36, 'Warranty', '2 years', '2026-09-16 11:27:35', '2026-09-16 11:27:35'),
(1447, 36, 'Origin', 'Handcrafted', '2026-09-16 11:27:35', '2026-09-16 11:27:35'),
(1448, 35, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:28:33', '2026-09-16 11:28:33'),
(1449, 35, 'Color', 'Charcoal Grey', '2026-09-16 11:28:33', '2026-09-16 11:28:33'),
(1450, 35, 'Assembly', 'Easy assembly included', '2026-09-16 11:28:33', '2026-09-16 11:28:33'),
(1451, 35, 'Warranty', '2 years', '2026-09-16 11:28:33', '2026-09-16 11:28:33'),
(1452, 35, 'Origin', 'Handcrafted', '2026-09-16 11:28:33', '2026-09-16 11:28:33'),
(1453, 34, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:29:41', '2026-09-16 11:29:41'),
(1454, 34, 'Color', 'Natural Oak', '2026-09-16 11:29:41', '2026-09-16 11:29:41'),
(1455, 34, 'Assembly', 'Easy assembly included', '2026-09-16 11:29:41', '2026-09-16 11:29:41'),
(1456, 34, 'Warranty', '2 years', '2026-09-16 11:29:41', '2026-09-16 11:29:41'),
(1457, 34, 'Origin', 'Handcrafted', '2026-09-16 11:29:41', '2026-09-16 11:29:41'),
(1458, 33, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:30:40', '2026-09-16 11:30:40'),
(1459, 33, 'Color', 'Cream Beige', '2026-09-16 11:30:40', '2026-09-16 11:30:40'),
(1460, 33, 'Assembly', 'Easy assembly included', '2026-09-16 11:30:40', '2026-09-16 11:30:40'),
(1461, 33, 'Warranty', '2 years', '2026-09-16 11:30:40', '2026-09-16 11:30:40'),
(1462, 33, 'Origin', 'Handcrafted', '2026-09-16 11:30:40', '2026-09-16 11:30:40'),
(1463, 32, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:31:39', '2026-09-16 11:31:39'),
(1464, 32, 'Color', 'Charcoal Grey', '2026-09-16 11:31:39', '2026-09-16 11:31:39'),
(1465, 32, 'Assembly', 'Easy assembly included', '2026-09-16 11:31:39', '2026-09-16 11:31:39'),
(1466, 32, 'Warranty', '2 years', '2026-09-16 11:31:39', '2026-09-16 11:31:39'),
(1467, 32, 'Origin', 'Handcrafted', '2026-09-16 11:31:39', '2026-09-16 11:31:39'),
(1468, 31, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:32:34', '2026-09-16 11:32:34'),
(1469, 31, 'Color', 'Natural Oak', '2026-09-16 11:32:34', '2026-09-16 11:32:34'),
(1470, 31, 'Assembly', 'Easy assembly included', '2026-09-16 11:32:34', '2026-09-16 11:32:34'),
(1471, 31, 'Warranty', '2 years', '2026-09-16 11:32:34', '2026-09-16 11:32:34'),
(1472, 31, 'Origin', 'Handcrafted', '2026-09-16 11:32:34', '2026-09-16 11:32:34'),
(1473, 30, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:33:26', '2026-09-16 11:33:26'),
(1474, 30, 'Color', 'Cream Beige', '2026-09-16 11:33:26', '2026-09-16 11:33:26'),
(1475, 30, 'Assembly', 'Easy assembly included', '2026-09-16 11:33:26', '2026-09-16 11:33:26'),
(1476, 30, 'Warranty', '2 years', '2026-09-16 11:33:26', '2026-09-16 11:33:26'),
(1477, 30, 'Origin', 'Handcrafted', '2026-09-16 11:33:26', '2026-09-16 11:33:26'),
(1478, 29, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:34:51', '2026-09-16 11:34:51'),
(1479, 29, 'Color', 'Charcoal Grey', '2026-09-16 11:34:51', '2026-09-16 11:34:51'),
(1480, 29, 'Assembly', 'Easy assembly included', '2026-09-16 11:34:51', '2026-09-16 11:34:51'),
(1481, 29, 'Warranty', '2 years', '2026-09-16 11:34:51', '2026-09-16 11:34:51'),
(1482, 29, 'Origin', 'Handcrafted', '2026-09-16 11:34:51', '2026-09-16 11:34:51'),
(1483, 28, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:35:58', '2026-09-16 11:35:58'),
(1484, 28, 'Color', 'Natural Oak', '2026-09-16 11:35:58', '2026-09-16 11:35:58'),
(1485, 28, 'Assembly', 'Easy assembly included', '2026-09-16 11:35:58', '2026-09-16 11:35:58'),
(1486, 28, 'Warranty', '2 years', '2026-09-16 11:35:58', '2026-09-16 11:35:58'),
(1487, 28, 'Origin', 'Handcrafted', '2026-09-16 11:35:58', '2026-09-16 11:35:58'),
(1488, 27, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:36:43', '2026-09-16 11:36:43'),
(1489, 27, 'Color', 'Cream Beige', '2026-09-16 11:36:43', '2026-09-16 11:36:43'),
(1490, 27, 'Assembly', 'Easy assembly included', '2026-09-16 11:36:43', '2026-09-16 11:36:43'),
(1491, 27, 'Warranty', '2 years', '2026-09-16 11:36:43', '2026-09-16 11:36:43'),
(1492, 27, 'Origin', 'Handcrafted', '2026-09-16 11:36:43', '2026-09-16 11:36:43'),
(1493, 26, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:37:29', '2026-09-16 11:37:29'),
(1494, 26, 'Color', 'Charcoal Grey', '2026-09-16 11:37:29', '2026-09-16 11:37:29'),
(1495, 26, 'Assembly', 'Easy assembly included', '2026-09-16 11:37:29', '2026-09-16 11:37:29'),
(1496, 26, 'Warranty', '2 years', '2026-09-16 11:37:29', '2026-09-16 11:37:29'),
(1497, 26, 'Origin', 'Handcrafted', '2026-09-16 11:37:29', '2026-09-16 11:37:29'),
(1498, 25, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:39:42', '2026-09-16 11:39:42'),
(1499, 25, 'Color', 'Natural Oak', '2026-09-16 11:39:42', '2026-09-16 11:39:42'),
(1500, 25, 'Assembly', 'Easy assembly included', '2026-09-16 11:39:42', '2026-09-16 11:39:42'),
(1501, 25, 'Warranty', '2 years', '2026-09-16 11:39:42', '2026-09-16 11:39:42'),
(1502, 25, 'Origin', 'Handcrafted', '2026-09-16 11:39:42', '2026-09-16 11:39:42'),
(1503, 24, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:40:47', '2026-09-16 11:40:47'),
(1504, 24, 'Color', 'Cream Beige', '2026-09-16 11:40:47', '2026-09-16 11:40:47'),
(1505, 24, 'Assembly', 'Easy assembly included', '2026-09-16 11:40:47', '2026-09-16 11:40:47'),
(1506, 24, 'Warranty', '2 years', '2026-09-16 11:40:47', '2026-09-16 11:40:47'),
(1507, 24, 'Origin', 'Handcrafted', '2026-09-16 11:40:47', '2026-09-16 11:40:47'),
(1508, 23, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:41:50', '2026-09-16 11:41:50'),
(1509, 23, 'Color', 'Charcoal Grey', '2026-09-16 11:41:50', '2026-09-16 11:41:50'),
(1510, 23, 'Assembly', 'Easy assembly included', '2026-09-16 11:41:50', '2026-09-16 11:41:50'),
(1511, 23, 'Warranty', '2 years', '2026-09-16 11:41:50', '2026-09-16 11:41:50'),
(1512, 23, 'Origin', 'Handcrafted', '2026-09-16 11:41:50', '2026-09-16 11:41:50'),
(1513, 22, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:42:52', '2026-09-16 11:42:52'),
(1514, 22, 'Color', 'Natural Oak', '2026-09-16 11:42:52', '2026-09-16 11:42:52'),
(1515, 22, 'Assembly', 'Easy assembly included', '2026-09-16 11:42:52', '2026-09-16 11:42:52'),
(1516, 22, 'Warranty', '2 years', '2026-09-16 11:42:52', '2026-09-16 11:42:52'),
(1517, 22, 'Origin', 'Handcrafted', '2026-09-16 11:42:52', '2026-09-16 11:42:52'),
(1518, 21, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:43:53', '2026-09-16 11:43:53'),
(1519, 21, 'Color', 'Cream Beige', '2026-09-16 11:43:53', '2026-09-16 11:43:53'),
(1520, 21, 'Assembly', 'Easy assembly included', '2026-09-16 11:43:53', '2026-09-16 11:43:53'),
(1521, 21, 'Warranty', '2 years', '2026-09-16 11:43:53', '2026-09-16 11:43:53'),
(1522, 21, 'Origin', 'Handcrafted', '2026-09-16 11:43:53', '2026-09-16 11:43:53'),
(1523, 20, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:45:21', '2026-09-16 11:45:21'),
(1524, 20, 'Color', 'Charcoal Grey', '2026-09-16 11:45:21', '2026-09-16 11:45:21'),
(1525, 20, 'Assembly', 'Easy assembly included', '2026-09-16 11:45:21', '2026-09-16 11:45:21'),
(1526, 20, 'Warranty', '2 years', '2026-09-16 11:45:21', '2026-09-16 11:45:21'),
(1527, 20, 'Origin', 'Handcrafted', '2026-09-16 11:45:21', '2026-09-16 11:45:21'),
(1528, 19, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:48:51', '2026-09-16 11:48:51'),
(1529, 19, 'Color', 'Natural Oak', '2026-09-16 11:48:51', '2026-09-16 11:48:51'),
(1530, 19, 'Assembly', 'Easy assembly included', '2026-09-16 11:48:51', '2026-09-16 11:48:51'),
(1531, 19, 'Warranty', '2 years', '2026-09-16 11:48:51', '2026-09-16 11:48:51'),
(1532, 19, 'Origin', 'Handcrafted', '2026-09-16 11:48:51', '2026-09-16 11:48:51'),
(1533, 18, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:49:46', '2026-09-16 11:49:46'),
(1534, 18, 'Color', 'Cream Beige', '2026-09-16 11:49:46', '2026-09-16 11:49:46'),
(1535, 18, 'Assembly', 'Easy assembly included', '2026-09-16 11:49:46', '2026-09-16 11:49:46'),
(1536, 18, 'Warranty', '2 years', '2026-09-16 11:49:46', '2026-09-16 11:49:46'),
(1537, 18, 'Origin', 'Handcrafted', '2026-09-16 11:49:46', '2026-09-16 11:49:46'),
(1538, 17, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:50:32', '2026-09-16 11:50:32'),
(1539, 17, 'Color', 'Charcoal Grey', '2026-09-16 11:50:32', '2026-09-16 11:50:32'),
(1540, 17, 'Assembly', 'Easy assembly included', '2026-09-16 11:50:32', '2026-09-16 11:50:32'),
(1541, 17, 'Warranty', '2 years', '2026-09-16 11:50:32', '2026-09-16 11:50:32'),
(1542, 17, 'Origin', 'Handcrafted', '2026-09-16 11:50:32', '2026-09-16 11:50:32'),
(1543, 16, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:51:27', '2026-09-16 11:51:27'),
(1544, 16, 'Color', 'Natural Oak', '2026-09-16 11:51:27', '2026-09-16 11:51:27'),
(1545, 16, 'Assembly', 'Easy assembly included', '2026-09-16 11:51:27', '2026-09-16 11:51:27'),
(1546, 16, 'Warranty', '2 years', '2026-09-16 11:51:27', '2026-09-16 11:51:27'),
(1547, 16, 'Origin', 'Handcrafted', '2026-09-16 11:51:27', '2026-09-16 11:51:27'),
(1548, 15, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:52:11', '2026-09-16 11:52:11'),
(1549, 15, 'Color', 'Cream Beige', '2026-09-16 11:52:11', '2026-09-16 11:52:11'),
(1550, 15, 'Assembly', 'Easy assembly included', '2026-09-16 11:52:11', '2026-09-16 11:52:11'),
(1551, 15, 'Warranty', '2 years', '2026-09-16 11:52:11', '2026-09-16 11:52:11'),
(1552, 15, 'Origin', 'Handcrafted', '2026-09-16 11:52:11', '2026-09-16 11:52:11'),
(1553, 14, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:53:00', '2026-09-16 11:53:00'),
(1554, 14, 'Color', 'Charcoal Grey', '2026-09-16 11:53:00', '2026-09-16 11:53:00'),
(1555, 14, 'Assembly', 'Easy assembly included', '2026-09-16 11:53:00', '2026-09-16 11:53:00'),
(1556, 14, 'Warranty', '2 years', '2026-09-16 11:53:00', '2026-09-16 11:53:00'),
(1557, 14, 'Origin', 'Handcrafted', '2026-09-16 11:53:00', '2026-09-16 11:53:00'),
(1558, 13, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:54:15', '2026-09-16 11:54:15'),
(1559, 13, 'Color', 'Natural Oak', '2026-09-16 11:54:15', '2026-09-16 11:54:15'),
(1560, 13, 'Assembly', 'Easy assembly included', '2026-09-16 11:54:15', '2026-09-16 11:54:15'),
(1561, 13, 'Warranty', '2 years', '2026-09-16 11:54:15', '2026-09-16 11:54:15'),
(1562, 13, 'Origin', 'Handcrafted', '2026-09-16 11:54:15', '2026-09-16 11:54:15'),
(1563, 12, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:55:19', '2026-09-16 11:55:19'),
(1564, 12, 'Color', 'Cream Beige', '2026-09-16 11:55:19', '2026-09-16 11:55:19'),
(1565, 12, 'Assembly', 'Easy assembly included', '2026-09-16 11:55:19', '2026-09-16 11:55:19'),
(1566, 12, 'Warranty', '2 years', '2026-09-16 11:55:19', '2026-09-16 11:55:19'),
(1567, 12, 'Origin', 'Handcrafted', '2026-09-16 11:55:19', '2026-09-16 11:55:19'),
(1568, 11, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:56:13', '2026-09-16 11:56:13'),
(1569, 11, 'Color', 'Charcoal Grey', '2026-09-16 11:56:13', '2026-09-16 11:56:13'),
(1570, 11, 'Assembly', 'Easy assembly included', '2026-09-16 11:56:13', '2026-09-16 11:56:13'),
(1571, 11, 'Warranty', '2 years', '2026-09-16 11:56:13', '2026-09-16 11:56:13'),
(1572, 11, 'Origin', 'Handcrafted', '2026-09-16 11:56:13', '2026-09-16 11:56:13'),
(1573, 10, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:57:04', '2026-09-16 11:57:04'),
(1574, 10, 'Color', 'Natural Oak', '2026-09-16 11:57:04', '2026-09-16 11:57:04'),
(1575, 10, 'Assembly', 'Easy assembly included', '2026-09-16 11:57:04', '2026-09-16 11:57:04'),
(1576, 10, 'Warranty', '2 years', '2026-09-16 11:57:04', '2026-09-16 11:57:04'),
(1577, 10, 'Origin', 'Handcrafted', '2026-09-16 11:57:04', '2026-09-16 11:57:04'),
(1578, 9, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:57:47', '2026-09-16 11:57:47'),
(1579, 9, 'Color', 'Cream Beige', '2026-09-16 11:57:47', '2026-09-16 11:57:47'),
(1580, 9, 'Assembly', 'Easy assembly included', '2026-09-16 11:57:47', '2026-09-16 11:57:47'),
(1581, 9, 'Warranty', '2 years', '2026-09-16 11:57:47', '2026-09-16 11:57:47'),
(1582, 9, 'Origin', 'Handcrafted', '2026-09-16 11:57:47', '2026-09-16 11:57:47'),
(1583, 8, 'Material', 'Premium solid wood & fabric', '2026-09-16 11:58:56', '2026-09-16 11:58:56'),
(1584, 8, 'Color', 'Charcoal Grey', '2026-09-16 11:58:56', '2026-09-16 11:58:56'),
(1585, 8, 'Assembly', 'Easy assembly included', '2026-09-16 11:58:56', '2026-09-16 11:58:56'),
(1586, 8, 'Warranty', '2 years', '2026-09-16 11:58:56', '2026-09-16 11:58:56'),
(1587, 8, 'Origin', 'Handcrafted', '2026-09-16 11:58:56', '2026-09-16 11:58:56'),
(1588, 7, 'Material', 'Premium solid wood & fabric', '2026-09-16 12:00:31', '2026-09-16 12:00:31'),
(1589, 7, 'Color', 'Natural Oak', '2026-09-16 12:00:31', '2026-09-16 12:00:31'),
(1590, 7, 'Assembly', 'Easy assembly included', '2026-09-16 12:00:31', '2026-09-16 12:00:31'),
(1591, 7, 'Warranty', '2 years', '2026-09-16 12:00:31', '2026-09-16 12:00:31'),
(1592, 7, 'Origin', 'Handcrafted', '2026-09-16 12:00:31', '2026-09-16 12:00:31'),
(1593, 6, 'Material', 'Premium solid wood & fabric', '2026-09-16 12:01:34', '2026-09-16 12:01:34'),
(1594, 6, 'Color', 'Cream Beige', '2026-09-16 12:01:34', '2026-09-16 12:01:34'),
(1595, 6, 'Assembly', 'Easy assembly included', '2026-09-16 12:01:34', '2026-09-16 12:01:34'),
(1596, 6, 'Warranty', '2 years', '2026-09-16 12:01:34', '2026-09-16 12:01:34'),
(1597, 6, 'Origin', 'Handcrafted', '2026-09-16 12:01:34', '2026-09-16 12:01:34'),
(1598, 5, 'Material', 'Premium solid wood & fabric', '2026-09-16 12:02:27', '2026-09-16 12:02:27'),
(1599, 5, 'Color', 'Charcoal Grey', '2026-09-16 12:02:27', '2026-09-16 12:02:27'),
(1600, 5, 'Assembly', 'Easy assembly included', '2026-09-16 12:02:27', '2026-09-16 12:02:27'),
(1601, 5, 'Warranty', '2 years', '2026-09-16 12:02:27', '2026-09-16 12:02:27'),
(1602, 5, 'Origin', 'Handcrafted', '2026-09-16 12:02:27', '2026-09-16 12:02:27'),
(1603, 4, 'Material', 'Premium solid wood & fabric', '2026-09-16 12:03:22', '2026-09-16 12:03:22'),
(1604, 4, 'Color', 'Natural Oak', '2026-09-16 12:03:22', '2026-09-16 12:03:22'),
(1605, 4, 'Assembly', 'Easy assembly included', '2026-09-16 12:03:22', '2026-09-16 12:03:22'),
(1606, 4, 'Warranty', '2 years', '2026-09-16 12:03:22', '2026-09-16 12:03:22'),
(1607, 4, 'Origin', 'Handcrafted', '2026-09-16 12:03:22', '2026-09-16 12:03:22'),
(1608, 3, 'Material', 'Premium solid wood & fabric', '2026-09-16 12:06:56', '2026-09-16 12:06:56'),
(1609, 3, 'Color', 'Cream Beige', '2026-09-16 12:06:56', '2026-09-16 12:06:56'),
(1610, 3, 'Assembly', 'Easy assembly included', '2026-09-16 12:06:56', '2026-09-16 12:06:56'),
(1611, 3, 'Warranty', '2 years', '2026-09-16 12:06:56', '2026-09-16 12:06:56'),
(1612, 3, 'Origin', 'Handcrafted', '2026-09-16 12:06:56', '2026-09-16 12:06:56'),
(1613, 2, 'Material', 'Premium solid wood & fabric', '2026-09-16 12:07:56', '2026-09-16 12:07:56'),
(1614, 2, 'Color', 'Charcoal Grey', '2026-09-16 12:07:56', '2026-09-16 12:07:56'),
(1615, 2, 'Assembly', 'Easy assembly included', '2026-09-16 12:07:56', '2026-09-16 12:07:56'),
(1616, 2, 'Warranty', '2 years', '2026-09-16 12:07:56', '2026-09-16 12:07:56'),
(1617, 2, 'Origin', 'Handcrafted', '2026-09-16 12:07:56', '2026-09-16 12:07:56'),
(1618, 1, 'Material', 'Premium solid wood & fabric', '2026-09-16 12:09:03', '2026-09-16 12:09:03'),
(1619, 1, 'Color', 'Natural Oak', '2026-09-16 12:09:03', '2026-09-16 12:09:03'),
(1620, 1, 'Assembly', 'Easy assembly included', '2026-09-16 12:09:03', '2026-09-16 12:09:03'),
(1621, 1, 'Warranty', '2 years', '2026-09-16 12:09:03', '2026-09-16 12:09:03'),
(1622, 1, 'Origin', 'Handcrafted', '2026-09-16 12:09:03', '2026-09-16 12:09:03'),
(1623, 51, 'Color', 'Black', '2026-09-22 18:32:27', '2026-09-22 18:32:27'),
(1624, 51, 'Top Material', 'Pine Wood', '2026-09-22 18:32:27', '2026-09-22 18:32:27'),
(1625, 51, 'Base Material', 'Metal', '2026-09-22 18:32:27', '2026-09-22 18:32:27'),
(1627, 51, 'Top Material', 'Pine Wood', '2026-09-22 18:32:27', '2026-09-22 18:32:27'),
(1629, 51, 'Color', 'Black', '2026-09-23 11:15:19', '2026-09-23 11:15:19'),
(1630, 51, 'Top Material', 'Pine Wood', '2026-09-23 11:15:19', '2026-09-23 11:15:19'),
(1631, 51, 'Base Material', 'Metal', '2026-09-23 11:15:19', '2026-09-23 11:15:19'),
(1632, 51, 'Color', 'Black', '2026-09-23 11:15:19', '2026-09-23 11:15:19'),
(1633, 51, 'Top Material', 'Pine Wood', '2026-09-23 11:15:19', '2026-09-23 11:15:19'),
(1634, 51, 'Base Material', 'Metal', '2026-09-23 11:15:19', '2026-09-23 11:15:19'),
(1635, 51, 'Color', 'Black', '2026-09-23 11:15:19', '2026-09-23 11:15:19'),
(1636, 51, 'Top Material', 'Pine Wood', '2026-09-23 11:15:19', '2026-09-23 11:15:19'),
(1637, 51, 'Base Material', 'Metal', '2026-09-23 11:15:19', '2026-09-23 11:15:19'),
(1638, 51, 'Top Material', 'Pine Wood', '2026-09-23 11:15:19', '2026-09-23 11:15:19');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `rating` tinyint(4) NOT NULL DEFAULT '5',
  `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `title`, `comment`, `status`, `created_at`, `updated_at`) VALUES
(1, 9, 5, 3, 'The color is slightly different but overall very satisfied.', 'Sturdy and well made. Would recommend to friends.', 'approved', '2026-08-05 12:55:35', '2026-08-15 12:55:35'),
(2, 41, 5, 5, 'Sturdy and well made. Would recommend to friends.', 'Sturdy and well made. Would recommend to friends.', 'approved', '2026-08-06 12:55:35', '2026-08-16 12:55:35'),
(3, 30, 10, 3, 'The color is slightly different but overall very satisfied.', 'The color is slightly different but overall very satisfied.', 'approved', '2026-08-07 12:55:35', '2026-08-17 12:55:35'),
(4, 27, 8, 4, 'Sturdy and well made. Would recommend to friends.', 'Sturdy and well made. Would recommend to friends.', 'approved', '2026-08-08 12:55:35', '2026-08-18 12:55:35'),
(5, 42, 10, 4, 'Good value for money. Delivery was quick.', 'Love it! Comfortable and beautifully designed.', 'rejected', '2026-08-09 12:55:35', '2026-08-19 12:55:35'),
(6, 6, 16, 3, 'Beautiful piece, elevates the room instantly.', 'The color is slightly different but overall very satisfied.', 'approved', '2026-08-10 12:55:35', '2026-08-20 12:55:35'),
(7, 23, 7, 4, 'The color is slightly different but overall very satisfied.', 'Beautiful piece, elevates the room instantly.', 'approved', '2026-08-11 12:55:35', '2026-08-21 12:55:35'),
(8, 21, 8, 4, 'Love it! Comfortable and beautifully designed.', 'Excellent quality, very sturdy and looks great in our home.', 'approved', '2026-08-12 12:55:35', '2026-08-22 12:55:35'),
(9, 34, 5, 5, 'Sturdy and well made. Would recommend to friends.', 'The color is slightly different but overall very satisfied.', 'approved', '2026-08-13 12:55:35', '2026-08-23 12:55:35'),
(10, 34, 11, 3, 'Good value for money. Delivery was quick.', 'The color is slightly different but overall very satisfied.', 'approved', '2026-08-14 12:55:35', '2026-08-24 12:55:35'),
(11, 28, 8, 4, 'Excellent quality, very sturdy and looks great in our home.', 'Excellent quality, very sturdy and looks great in our home.', 'approved', '2026-08-15 12:55:35', '2026-08-25 12:55:35'),
(12, 31, 7, 3, 'Sturdy and well made. Would recommend to friends.', 'Excellent quality, very sturdy and looks great in our home.', 'pending', '2026-08-16 12:55:35', '2026-08-26 12:55:35'),
(13, 16, 15, 3, 'Love it! Comfortable and beautifully designed.', 'Excellent quality, very sturdy and looks great in our home.', 'approved', '2026-08-17 12:55:35', '2026-08-27 12:55:35'),
(14, 40, 8, 3, 'Love it! Comfortable and beautifully designed.', 'The color is slightly different but overall very satisfied.', 'approved', '2026-08-18 12:55:35', '2026-08-28 12:55:35'),
(15, 41, 18, 5, 'Beautiful piece, elevates the room instantly.', 'Beautiful piece, elevates the room instantly.', 'approved', '2026-08-19 12:55:35', '2026-08-29 12:55:35'),
(16, 45, 6, 3, 'Excellent quality, very sturdy and looks great in our home.', 'Excellent quality, very sturdy and looks great in our home.', 'pending', '2026-08-20 12:55:35', '2026-08-30 12:55:35'),
(17, 12, 8, 4, 'Beautiful piece, elevates the room instantly.', 'Good value for money. Delivery was quick.', 'pending', '2026-08-21 12:55:35', '2026-08-31 12:55:35'),
(18, 7, 6, 3, 'Excellent quality, very sturdy and looks great in our home.', 'Good value for money. Delivery was quick.', 'rejected', '2026-08-22 12:55:35', '2026-09-01 12:55:35'),
(19, 5, 11, 4, 'Excellent quality, very sturdy and looks great in our home.', 'Excellent quality, very sturdy and looks great in our home.', 'rejected', '2026-08-23 12:55:35', '2026-09-02 12:55:35'),
(20, 26, 9, 5, 'Beautiful piece, elevates the room instantly.', 'Sturdy and well made. Would recommend to friends.', 'pending', '2026-08-24 12:55:35', '2026-09-03 12:55:35'),
(21, 32, 6, 3, 'Love it! Comfortable and beautifully designed.', 'Good value for money. Delivery was quick.', 'rejected', '2026-08-25 12:55:35', '2026-09-04 12:55:35'),
(22, 35, 7, 3, 'Beautiful piece, elevates the room instantly.', 'The color is slightly different but overall very satisfied.', 'approved', '2026-08-26 12:55:35', '2026-09-17 20:34:25'),
(23, 11, 18, 4, 'Sturdy and well made. Would recommend to friends.', 'Excellent quality, very sturdy and looks great in our home.', 'approved', '2026-08-27 12:55:35', '2026-09-06 12:55:35'),
(24, 45, 12, 5, 'Excellent quality, very sturdy and looks great in our home.', 'Beautiful piece, elevates the room instantly.', 'approved', '2026-08-28 12:55:35', '2026-09-07 12:55:35'),
(25, 18, 10, 4, 'Good value for money. Delivery was quick.', 'The color is slightly different but overall very satisfied.', 'approved', '2026-08-29 12:55:35', '2026-09-08 12:55:35'),
(26, 24, 11, 4, 'Excellent quality, very sturdy and looks great in our home.', 'The color is slightly different but overall very satisfied.', 'rejected', '2026-08-30 12:55:35', '2026-09-09 12:55:35'),
(27, 28, 7, 3, 'Good value for money. Delivery was quick.', 'Beautiful piece, elevates the room instantly.', 'approved', '2026-08-31 12:55:35', '2026-09-10 12:55:35'),
(28, 29, 5, 3, 'Good value for money. Delivery was quick.', 'The color is slightly different but overall very satisfied.', 'rejected', '2026-09-01 12:55:35', '2026-09-17 20:34:11');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `group` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `value` text COLLATE utf8mb4_unicode_ci,
  `is_editable` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `title`, `group`, `value`, `is_editable`, `created_at`, `updated_at`) VALUES
(1, 'site_name', 'Site Name', 'general', 'FurniShop', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(2, 'site_logo', 'Site Logo', 'general', '', 1, '2026-09-14 10:55:34', '2026-09-14 10:55:34'),
(3, 'site_description', 'Site Description', 'general', 'Premium Home Furniture Store', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(4, 'support_email', 'Support Email', 'general', 'support@furnishop.com', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(5, 'support_phone', 'Support Phone', 'general', '+1 234 567 8900', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(6, 'address', 'Address', 'general', '123 Furniture Street, Design District', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(7, 'currency', 'Currency', 'general', 'PHP', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(8, 'tax_rate', 'Tax Rate', 'general', '12', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(9, 'shipping_fee', 'Shipping Fee', 'general', '150', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(10, 'stripe_publishable_key', 'Stripe Publishable Key', 'payment', 'pk_test_xxxxxxxxxxxx', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(11, 'stripe_secret_key', 'Stripe Secret Key', 'payment', 'sk_test_xxxxxxxxxxxx', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(12, 'paypal_client_id', 'PayPal Client ID', 'payment', 'test', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(13, 'paypal_client_secret', 'PayPal Client Secret', 'payment', 'test', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(14, 'mail_driver', 'Mail Driver', 'mail', 'smtp', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(15, 'smtp_host', 'SMTP Host', 'mail', 'smtp.gmail.com', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(16, 'smtp_port', 'SMTP Port', 'mail', '587', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(17, 'smtp_username', 'SMTP Username', 'mail', '', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(18, 'smtp_password', 'SMTP Password', 'mail', '', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(19, 'smtp_encryption', 'SMTP Encryption', 'mail', 'tls', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(20, 'mail_from_address', 'From Address', 'mail', 'no-reply@furnishop.com', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(21, 'mail_from_name', 'From Name', 'mail', 'FurniShop', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(22, 'theme_color', 'Theme Color', 'theme', '#6366f1', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(23, 'default_language', 'Default Language', 'general', 'en', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(24, 'timezone', 'Timezone', 'general', 'Asia/Manila', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09'),
(25, 'business_hours', 'Business Hours', 'general', 'Mon - Sat, 9:00 AM - 6:00 PM', 1, '2026-09-14 10:55:34', '2026-09-17 20:36:09');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','customer','staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','banned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `remember_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `avatar`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@furnishop.com', '$2y$10$fHSiwMRzVbQNaXwE4FTj8u2ZUFIQ/hxcq0xZyUG8tWtpoY0Ho1bG6', 'admin', '+1 234 567 8901', 'avatars/avatar-5-1_3e5426957c66.png', 'active', '2026-09-23 11:13:49', NULL, '2026-05-17 12:55:35', '2026-09-23 11:33:07'),
(2, 'Jessica Ramos', 'jessica@furnishop.com', '$2y$10$1RcEVyQcawHI/QEcxuIsSOYJA3WXfVWiEf5MymZM01X/iUjKETQUu', 'staff', '+1 234 567 8902', NULL, 'active', '2026-09-14 12:02:32', NULL, '2026-06-06 12:55:35', '2026-09-14 12:02:32'),
(3, 'Mark Dela Cruz', 'mark@furnishop.com', '$2y$12$zrsuc1JqyIY4Yxvjdk2Ffe2CKgh7IrxlADEKNtAI/tC3XwCyIBVdG', 'staff', '+1 234 567 8903', NULL, 'active', '2026-09-10 12:55:35', NULL, '2026-06-11 12:55:35', '2026-09-14 02:55:34'),
(4, 'Anna Villanueva', 'anna@furnishop.com', '$2y$12$zrsuc1JqyIY4Yxvjdk2Ffe2CKgh7IrxlADEKNtAI/tC3XwCyIBVdG', 'staff', '+1 234 567 8904', NULL, 'active', '2026-09-07 12:55:35', NULL, '2026-06-16 12:55:35', '2026-09-14 02:55:34'),
(5, 'Juan Santos', 'juan.santos@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 917 123 4567', NULL, 'inactive', '2026-09-12 12:55:35', NULL, '2026-06-16 12:55:35', '2026-09-14 02:55:34'),
(6, 'Maria Garcia', 'maria.garcia@example.com', '$2y$10$da1Tld9qcetwQ4wU5FWzgugaEZd5S2G1da5jUQJoIDUw16blAuIfG', 'customer', '+63 918 234 5678', NULL, 'active', '2026-09-22 18:42:58', NULL, '2026-06-19 12:55:35', '2026-09-22 18:42:58'),
(7, 'John Reyes', 'john.reyes@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 919 345 6789', NULL, 'active', '2026-09-08 12:55:35', NULL, '2026-06-22 12:55:35', '2026-09-14 02:55:34'),
(8, 'Kaye Mendoza', 'kaye.mendoza@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 920 456 7890', NULL, 'active', '2026-09-06 12:55:35', NULL, '2026-06-25 12:55:35', '2026-09-14 02:55:34'),
(9, 'Paolo Aquino', 'paolo.aquino@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 921 567 8901', NULL, 'active', '2026-09-04 12:55:35', NULL, '2026-06-28 12:55:35', '2026-09-14 02:55:34'),
(10, 'Claire Tan', 'claire.tan@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 922 678 9012', NULL, 'active', '2026-09-02 12:55:35', NULL, '2026-07-01 12:55:35', '2026-09-14 02:55:34'),
(11, 'Rico Bautista', 'rico.bautista@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 923 789 0123', NULL, 'inactive', '2026-08-31 12:55:35', NULL, '2026-07-04 12:55:35', '2026-09-14 02:55:34'),
(12, 'Diana Cruz', 'diana.cruz@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 924 890 1234', NULL, 'active', '2026-08-29 12:55:35', NULL, '2026-07-07 12:55:35', '2026-09-14 02:55:34'),
(13, 'Leo Manalo', 'leo.manalo@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 925 901 2345', NULL, 'active', '2026-08-27 12:55:35', NULL, '2026-07-10 12:55:35', '2026-09-14 02:55:34'),
(14, 'Sophia Lim', 'sophia.lim@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 926 012 3456', NULL, 'active', '2026-08-25 12:55:35', NULL, '2026-07-13 12:55:35', '2026-09-14 02:55:34'),
(15, 'Ian Torres', 'ian.torres@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 927 123 4568', NULL, 'active', '2026-08-23 12:55:35', NULL, '2026-07-16 12:55:35', '2026-09-14 02:55:34'),
(16, 'Grace Navarro', 'grace.navarro@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 928 234 5679', NULL, 'active', '2026-08-21 12:55:35', NULL, '2026-07-19 12:55:35', '2026-09-14 02:55:34'),
(17, 'Miguel Ocampo', 'miguel.ocampo@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 929 345 6780', NULL, 'inactive', '2026-08-19 12:55:35', NULL, '2026-07-22 12:55:35', '2026-09-14 02:55:34'),
(18, 'Alyanna Flores', 'alyanna.flores@example.com', '$2y$10$z/2t76HqmjK5BWRhCVsxze4l/Cz2TG2E0nw80Gj5qX2HadGo1IeOS', 'customer', '+63 930 456 7891', NULL, 'active', '2026-09-22 17:33:57', NULL, '2026-07-25 12:55:35', '2026-09-22 17:33:57'),
(19, 'Gabriel Po', 'gabriel.po@example.com', '$2y$12$Btssw1q4pLKYfihG/7YVnuff/cocroSoe/fHgvxOGrHkM8k8fl1DG', 'customer', '+63 931 567 8902', 'avatars/avatar-8_57e09947ee87.png', 'active', '2026-08-15 12:55:35', NULL, '2026-07-28 12:55:35', '2026-09-17 10:29:59'),
(20, 'clydey Ednalan', 'clydey@test.com', '$2y$10$JalWLa9dtouz9sJYimXzAOIbCNi18iPea.v76QinA0LVGtqR809YS', 'customer', '5345345345', NULL, 'active', '2026-09-23 11:35:15', NULL, '2026-09-17 10:25:58', '2026-09-23 11:35:15'),
(21, 'Catlin Ednalan', 'catlin@test.com', '$2y$10$x2H/2fD37TRhSAUumJHV.OTepl5gc.kaD1/f7YAYrk3dh8Y5vz.AW', 'customer', '345345345', 'avatars/6_191169909c96.jpeg', 'active', NULL, NULL, '2026-09-17 10:29:21', '2026-09-17 10:29:21');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`, `updated_at`) VALUES
(1, 5, 49, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(3, 7, 31, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(4, 8, 24, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(5, 9, 25, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(6, 10, 13, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(7, 11, 12, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(8, 12, 46, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(9, 13, 18, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(10, 14, 47, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(11, 15, 43, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(12, 16, 6, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(13, 17, 47, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(14, 18, 26, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(15, 19, 33, '2026-08-30 12:55:35', '2026-08-30 12:55:35'),
(19, 20, 46, '2026-09-18 13:14:57', '2026-09-18 13:14:57'),
(20, 6, 18, '2026-09-22 16:40:12', '2026-09-22 16:40:12'),
(21, 20, 4, '2026-09-22 16:57:39', '2026-09-22 16:57:39'),
(22, 20, 26, '2026-09-23 11:11:35', '2026-09-23 11:11:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_user` (`user_id`);

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_addresses_user` (`user_id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_brands_status` (`status`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_carts_user` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cart_items_cart` (`cart_id`),
  ADD KEY `idx_cart_items_product` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_categories_parent` (`parent_id`),
  ADD KEY `idx_categories_status` (`status`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contact_status` (`status`),
  ADD KEY `idx_contact_user` (`user_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `uq_coupons_code` (`code`),
  ADD KEY `idx_coupons_status` (`status`);

--
-- Indexes for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_coupon_usages_coupon` (`coupon_id`),
  ADD KEY `idx_coupon_usages_order` (`order_id`),
  ADD KEY `idx_coupon_usages_user` (`user_id`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_files_user` (`user_id`),
  ADD KEY `idx_files_group` (`group`);

--
-- Indexes for table `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inventory_product` (`product_id`),
  ADD KEY `idx_inventory_type` (`type`);

--
-- Indexes for table `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_login_user` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user` (`user_id`),
  ADD KEY `idx_notifications_read` (`is_read`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD UNIQUE KEY `uq_orders_number` (`order_number`),
  ADD KEY `idx_orders_user` (`user_id`),
  ADD KEY `idx_orders_status` (`order_status`),
  ADD KEY `idx_orders_payment` (`payment_status`),
  ADD KEY `idx_orders_created` (`created_at`),
  ADD KEY `idx_orders_address` (`shipping_address_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order` (`order_id`),
  ADD KEY `idx_order_items_product` (`product_id`);

--
-- Indexes for table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status_logs_order` (`order_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reset_email` (`email`),
  ADD KEY `idx_reset_token` (`token`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payments_order` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `uq_products_sku` (`sku`),
  ADD UNIQUE KEY `uq_products_slug` (`slug`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_brand` (`brand_id`),
  ADD KEY `idx_products_status` (`status`),
  ADD KEY `idx_products_featured` (`featured`),
  ADD KEY `idx_products_stock` (`stock_quantity`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_images_product` (`product_id`);

--
-- Indexes for table `product_specifications`
--
ALTER TABLE `product_specifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_specs_product` (`product_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reviews_product` (`product_id`),
  ADD KEY `idx_reviews_user` (`user_id`),
  ADD KEY `idx_reviews_status` (`status`),
  ADD KEY `idx_reviews_rating` (`rating`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_settings_key` (`key`),
  ADD KEY `idx_settings_group` (`group`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_status` (`status`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_wishlists_user_product` (`user_id`,`product_id`),
  ADD KEY `idx_wishlists_product` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=171;

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `inventory_logs`
--
ALTER TABLE `inventory_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `login_history`
--
ALTER TABLE `login_history`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=149;

--
-- AUTO_INCREMENT for table `product_specifications`
--
ALTER TABLE `product_specifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1639;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `fk_contact_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `coupon_usages`
--
ALTER TABLE `coupon_usages`
  ADD CONSTRAINT `fk_coupon_usages_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_coupon_usages_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_coupon_usages_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `fk_files_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `login_history`
--
ALTER TABLE `login_history`
  ADD CONSTRAINT `fk_login_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_address` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_status_logs`
--
ALTER TABLE `order_status_logs`
  ADD CONSTRAINT `fk_status_logs_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_specifications`
--
ALTER TABLE `product_specifications`
  ADD CONSTRAINT `fk_product_specs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `fk_wishlists_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
