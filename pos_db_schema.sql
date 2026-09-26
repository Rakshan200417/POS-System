-- POS System Database Schema and Initial Data for phpMyAdmin
-- Compatible with MySQL 5.7+ / 8.0+ / MariaDB (XAMPP)

CREATE DATABASE IF NOT EXISTS `pos_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pos_db`;

-- --------------------------------------------------------
-- Table structure for table `categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `sales_orders`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `customers`;

CREATE TABLE `categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------
CREATE TABLE `products` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `price` DOUBLE NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `min_stock_level` INT DEFAULT 5,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `customers`
-- --------------------------------------------------------
CREATE TABLE `customers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(255) NOT NULL UNIQUE,
  `address` VARCHAR(255) DEFAULT NULL,
  `loyalty_points` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `user_roles`
-- --------------------------------------------------------
CREATE TABLE `user_roles` (
  `user_id` BIGINT NOT NULL,
  `roles` VARCHAR(255) NOT NULL,
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `sales_orders`
-- --------------------------------------------------------
CREATE TABLE `sales_orders` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `invoice_number` VARCHAR(255) NOT NULL UNIQUE,
  `customer_id` BIGINT DEFAULT NULL,
  `user_id` BIGINT DEFAULT NULL,
  `total_amount` DOUBLE DEFAULT 0.0,
  `order_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(50) DEFAULT 'COMPLETED',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `order_items`
-- --------------------------------------------------------
CREATE TABLE `order_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `product_id` BIGINT DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DOUBLE NOT NULL DEFAULT 0.0,
  `sub_total` DOUBLE NOT NULL DEFAULT 0.0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `payments`
-- --------------------------------------------------------
CREATE TABLE `payments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `payment_type` VARCHAR(50) NOT NULL,
  `amount` DOUBLE NOT NULL DEFAULT 0.0,
  `transaction_reference` VARCHAR(255) DEFAULT NULL,
  `payment_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `amount_tendered` DOUBLE DEFAULT NULL,
  `change_amount` DOUBLE DEFAULT 0.0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Dumping initial seed data
-- --------------------------------------------------------

-- Categories
INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Fresh Produce', 'Fruits, vegetables, and fresh greens'),
(2, 'Dairy', 'Milk, cheeses, eggs, and butter'),
(3, 'Bakery', 'Freshly baked breads and pastries'),
(4, 'Pantry', 'Cereals, coffees, canned items, and dry goods');

-- Products
INSERT INTO `products` (`id`, `sku`, `name`, `description`, `price`, `stock`, `min_stock_level`) VALUES
(1, '50001', 'Fresh Fuji Apples', 'Crisp and sweet Fuji apples', 3.99, 150, 20),
(2, '50002', 'Organic Whole Milk', 'Grade A organic whole milk 1L', 4.50, 45, 10),
(3, '50003', 'Artisan Sourdough', 'Naturally fermented sourdough bread', 5.20, 20, 5),
(4, '50004', 'Premium Ground Coffee', 'Dark roast arabica coffee 250g', 12.00, 35, 10),
(5, '50005', 'Greek Yogurt (Plain)', 'Thick whole-milk plain Greek yogurt', 6.50, 60, 15),
(6, '50006', 'Red Bell Peppers', 'Fresh sweet red peppers', 2.50, 80, 20),
(7, '50007', 'Free Range Eggs (12pk)', 'Dozen large free-range brown eggs', 7.99, 40, 10);

-- Customers
INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `address`, `loyalty_points`, `created_at`) VALUES
(1, 'Alex Rivera', 'alex@supermarket.net', '+1 555-0101', '123 Pine St, Cityville', 145, NOW()),
(2, 'Sarah Chen', 's.chen@foodie.com', '+1 555-0102', '456 Oak Ave, Metropolis', 320, NOW()),
(3, 'Marcus Knight', 'm.knight@home.org', '+1 555-0103', '789 Maple Rd, Suburbia', 85, NOW());

-- Users (Password for both is: password)
-- BCrypt hash for 'password': $2a$10$Ul3U.B0bZ4wzqYNeLb9IDOr.9c6D15dRGczS/fSlxJ0hLHEWF/tAq
INSERT INTO `users` (`id`, `username`, `email`, `password`) VALUES
(1, 'admin', 'admin@pos.com', '$2a$10$Ul3U.B0bZ4wzqYNeLb9IDOr.9c6D15dRGczS/fSlxJ0hLHEWF/tAq'),
(2, 'cashier', 'cashier@pos.com', '$2a$10$Ul3U.B0bZ4wzqYNeLb9IDOr.9c6D15dRGczS/fSlxJ0hLHEWF/tAq');

-- User Roles
INSERT INTO `user_roles` (`user_id`, `roles`) VALUES
(1, 'ROLE_ADMIN'),
(1, 'ROLE_CASHIER'),
(2, 'ROLE_CASHIER');

-- Sample Sales Order
INSERT INTO `sales_orders` (`id`, `invoice_number`, `customer_id`, `user_id`, `total_amount`, `order_date`, `status`) VALUES
(1, 'INV-2026-0001', 1, 1, 14.50, NOW(), 'COMPLETED');

-- Order Items for Order 1
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `sub_total`) VALUES
(1, 1, 1, 2, 3.99, 7.98),
(2, 1, 3, 1, 5.20, 5.20);

-- Payment for Order 1
INSERT INTO `payments` (`id`, `order_id`, `payment_type`, `amount`, `transaction_reference`, `payment_date`) VALUES
(1, 1, 'CASH', 14.50, 'TXN-998811', NOW());

-- --------------------------------------------------------
-- Table structure and Seed data for `store_settings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `store_settings`;
CREATE TABLE `store_settings` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_name` VARCHAR(150) NOT NULL DEFAULT 'SuperPOS Store',
  `email` VARCHAR(150) DEFAULT 'contact@pos.com',
  `phone` VARCHAR(50) DEFAULT '+1 (555) 019-2834',
  `address` TEXT,
  `currency` VARCHAR(10) DEFAULT '$',
  `tax_rate` DOUBLE DEFAULT 10.0,
  `receipt_header` TEXT,
  `receipt_footer` TEXT,
  `enable_sound` BOOLEAN DEFAULT TRUE,
  `barcode_auto_add` BOOLEAN DEFAULT TRUE,
  `auto_print_receipt` BOOLEAN DEFAULT FALSE,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `store_settings` (`id`, `store_name`, `email`, `phone`, `address`, `currency`, `tax_rate`, `receipt_header`, `receipt_footer`, `enable_sound`, `barcode_auto_add`, `auto_print_receipt`) VALUES
(1, 'SuperPOS Retail Hub', 'store@superpos.com', '+1 (555) 019-2834', '100 Innovation Blvd, Tech City, CA 94016', '$', 10.0, 'THANK YOU FOR SHOPPING AT SUPERPOS!\nVisit us online: www.superpos.com', 'Returns accepted within 14 days with receipt.\nHave a wonderful day!', TRUE, TRUE, FALSE);

