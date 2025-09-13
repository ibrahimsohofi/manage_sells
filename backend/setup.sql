-- Creating SQLite database
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  barcode TEXT,
  category_id INTEGER,
  store_id INTEGER,
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  max_stock INTEGER DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  store_id INTEGER,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Insert sample data
INSERT OR IGNORE INTO categories (name) VALUES 
('Outillage'),
('Plomberie'),
('Électricité'),
('Visserie'),
('Peinture'),
('Jardinage');

INSERT OR IGNORE INTO stores (name, address) VALUES 
('Magasin Principal', '123 Rue Principale'),
('Succursale Nord', '456 Avenue du Nord');

INSERT OR IGNORE INTO products (name, barcode, category_id, store_id, cost_price, selling_price, current_stock) VALUES
('Marteau', '1234567890123', 1, 1, 15.00, 25.00, 20),
('Tournevis Phillips', '2345678901234', 1, 1, 5.00, 8.00, 50),
('Tube PVC 32mm', '3456789012345', 2, 1, 3.50, 6.00, 30),
('Ampoule LED 10W', '4567890123456', 3, 1, 8.00, 12.00, 40),
('Vis à bois 4x40', '5678901234567', 4, 1, 0.10, 0.20, 500),
('Peinture blanche 1L', '6789012345678', 5, 1, 12.00, 20.00, 15);
