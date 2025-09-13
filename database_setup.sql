-- Sales Management System Database Setup
-- MySQL 8.0+ Compatible

-- Create database
CREATE DATABASE IF NOT EXISTS `manage_sales` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `manage_sales`;

-- Drop tables in correct order (reverse of dependencies)
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS categories;

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores table
CREATE TABLE stores (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    barcode VARCHAR(100) UNIQUE,
    cost_price DECIMAL(10,2) DEFAULT 0.00,
    selling_price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory table
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id VARCHAR(50),
    store_id VARCHAR(50),
    current_stock INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    max_stock_level INT DEFAULT 100,
    cost_price DECIMAL(10,2) DEFAULT 0.00,
    selling_price DECIMAL(10,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_store (product_id, store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales table
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) DEFAULT 0.00,
    cost_price DECIMAL(10,2) DEFAULT 0.00,
    sale_date DATE NOT NULL,
    sale_time TIME DEFAULT NULL,
    store_id VARCHAR(50) DEFAULT 'main',
    customer_name VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data

-- Categories
INSERT INTO categories (name, description) VALUES
('Outils', 'Outils de construction et bricolage'),
('Peinture', 'Peintures et produits de finition'),
('Plomberie', 'Matériel de plomberie et sanitaire'),
('Électricité', 'Matériel électrique et câblage'),
('Quincaillerie', 'Visserie et petites pièces métalliques'),
('Nettoyage', 'Produits de nettoyage et entretien');

-- Stores
INSERT INTO stores (id, name, address, phone, is_main) VALUES
('main-store', 'Quincaillerie Principale', '123 Rue Mohammed V, Casablanca', '+212 522 123 456', TRUE),
('secondary-store', 'Succursale Nord', '456 Avenue Hassan II, Rabat', '+212 537 789 012', FALSE);

-- Products
INSERT INTO products (id, name, category_id, barcode, cost_price, selling_price) VALUES
('prod-1', 'Marteau 500g', 1, '3401320234567', 15.00, 25.00),
('prod-2', 'Tournevis Phillips Set', 1, '3401320234568', 12.00, 22.00),
('prod-3', 'Peinture Blanche 5L', 2, '3401320234569', 80.00, 120.00),
('prod-4', 'Tuyau PVC 32mm (2m)', 3, '3401320234570', 8.00, 15.00),
('prod-5', 'Câble Électrique 2.5mm² (10m)', 4, '3401320234571', 25.00, 40.00),
('prod-6', 'Niveau à Bulle 60cm', 1, '3401320234572', 30.00, 50.00),
('prod-7', 'Vis 4x50mm (Boîte 100)', 5, '3401320234573', 8.50, 15.00),
('prod-8', 'Détergent Multi-Usage 1L', 6, '3401320234574', 6.00, 12.00);

-- Inventory
INSERT INTO inventory (product_id, store_id, current_stock, min_stock_level, cost_price, selling_price) VALUES
('prod-1', 'main-store', 48, 10, 15.00, 25.00),
('prod-2', 'main-store', 8, 15, 12.00, 22.00),
('prod-3', 'main-store', 25, 5, 80.00, 120.00),
('prod-4', 'main-store', 40, 8, 8.00, 15.00),
('prod-5', 'main-store', 20, 5, 25.00, 40.00),
('prod-6', 'main-store', 3, 5, 30.00, 50.00),
('prod-7', 'main-store', 150, 25, 8.50, 15.00),
('prod-8', 'main-store', 75, 15, 6.00, 12.00);

-- Sample sales data
INSERT INTO sales (product_id, product_name, category, quantity, unit_price, total_price, profit, cost_price, sale_date, store_id, payment_method) VALUES
('prod-1', 'Marteau 500g', 'Outils', 2, 25.00, 50.00, 20.00, 15.00, '2024-09-01', 'main-store', 'cash'),
('prod-3', 'Peinture Blanche 5L', 'Peinture', 1, 120.00, 120.00, 40.00, 80.00, '2024-09-02', 'main-store', 'card'),
('prod-7', 'Vis 4x50mm (Boîte 100)', 'Quincaillerie', 3, 15.00, 45.00, 19.50, 8.50, '2024-09-03', 'main-store', 'cash'),
('prod-4', 'Tuyau PVC 32mm (2m)', 'Plomberie', 2, 15.00, 30.00, 14.00, 8.00, '2024-09-04', 'main-store', 'cash'),
('prod-5', 'Câble Électrique 2.5mm² (10m)', 'Électricité', 1, 40.00, 40.00, 15.00, 25.00, '2024-09-05', 'main-store', 'card'),
('prod-6', 'Niveau à Bulle 60cm', 'Outils', 1, 50.00, 50.00, 20.00, 30.00, '2024-09-06', 'main-store', 'cash'),
('prod-8', 'Détergent Multi-Usage 1L', 'Nettoyage', 4, 12.00, 48.00, 24.00, 6.00, '2024-09-07', 'main-store', 'cash'),
('prod-2', 'Tournevis Phillips Set', 'Outils', 1, 22.00, 22.00, 10.00, 12.00, '2024-09-08', 'main-store', 'card');

-- Application settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('currentStore', 'main-store', 'Currently selected store'),
('defaultStore', 'main-store', 'Default store for new transactions'),
('enableBarcodeScanning', 'true', 'Enable barcode scanning functionality'),
('showProfitMargins', 'true', 'Show profit margins in reports'),
('lowStockThreshold', '5', 'Default low stock threshold'),
('currency', 'MAD', 'Default currency'),
('taxRate', '20', 'Default tax rate percentage'),
('companyName', 'Quincaillerie Jamal', 'Company name for reports'),
('companyAddress', '123 Rue Mohammed V, Casablanca', 'Company address'),
('companyPhone', '+212 522 123 456', 'Company phone number');

-- Create useful indexes for better performance
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_inventory_store ON inventory(store_id);
CREATE INDEX idx_inventory_stock_level ON inventory(current_stock, min_stock_level);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_store ON sales(store_id);
CREATE INDEX idx_sales_product ON sales(product_id);

-- Show created tables
SHOW TABLES;

-- Show low stock items (example query)
SELECT
    p.name as product_name,
    c.name as category,
    i.current_stock,
    i.min_stock_level,
    (i.min_stock_level - i.current_stock) as stock_needed
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
JOIN inventory i ON p.id = i.product_id
WHERE i.current_stock <= i.min_stock_level
ORDER BY stock_needed DESC;
