import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database directory if it doesn't exist
const dbDir = join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, 'quincaillerie_jamal.db');

// Create SQLite database connection
let db;

export const initializeDatabase = () => {
  try {
    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    console.log('✅ SQLite database connected successfully');
    console.log('📁 Database path:', dbPath);

    // Create tables
    createTables();

    return true;
  } catch (error) {
    console.error('❌ SQLite connection failed:', error.message);
    return false;
  }
};

export const getDatabase = () => {
  if (!db) {
    initializeDatabase();
  }
  return db;
};

export const testConnection = async () => {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as test').get();
    console.log('✅ SQLite database test successful');
    return true;
  } catch (error) {
    console.error('❌ SQLite connection test failed:', error.message);
    return false;
  }
};

const createTables = () => {
  const db = getDatabase();

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Stores table
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      is_main BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products/Inventory table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      barcode TEXT UNIQUE,
      cost_price REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      store_id TEXT DEFAULT 'main',
      stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id)
    )
  `);

  // Sales table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_date DATE NOT NULL,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      store_id TEXT DEFAULT 'main',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id)
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database tables created successfully');
};

// Execute query function for compatibility with MySQL version
export const executeQuery = (query, params = []) => {
  try {
    const db = getDatabase();

    // Handle different query types
    const queryType = query.toLowerCase().trim();

    if (queryType.startsWith('select')) {
      const stmt = db.prepare(query);
      const result = params.length > 0 ? stmt.all(...params) : stmt.all();
      return result;
    }
    else if (queryType.startsWith('insert')) {
      const stmt = db.prepare(query);
      const result = params.length > 0 ? stmt.run(...params) : stmt.run();
      return {
        insertId: result.lastInsertRowid,
        affectedRows: result.changes
      };
    }
    else if (queryType.startsWith('update') || queryType.startsWith('delete')) {
      const stmt = db.prepare(query);
      const result = params.length > 0 ? stmt.run(...params) : stmt.run();
      return {
        affectedRows: result.changes,
        changedRows: result.changes
      };
    }
    else {
      // For CREATE, DROP, etc.
      const result = db.exec(query);
      return { success: true };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Seed initial data
export const seedInitialData = () => {
  const db = getDatabase();

  try {
    // Insert default store
    const storeExists = db.prepare('SELECT COUNT(*) as count FROM stores WHERE id = ?').get('main');
    if (storeExists.count === 0) {
      db.prepare(`
        INSERT INTO stores (id, name, address, phone, is_main)
        VALUES (?, ?, ?, ?, ?)
      `).run('main', 'Quincaillerie Jamal - Principal', 'Casablanca, Maroc', '0522-123456', 1);
    }

    // Insert default categories
    const categories = [
      'Outillage',
      'Quincaillerie',
      'Peinture',
      'Électricité',
      'Plomberie',
      'Construction'
    ];

    categories.forEach(category => {
      try {
        db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)').run(category);
      } catch (e) {
        // Category might already exist
      }
    });

    // Insert sample products
    const sampleProducts = [
      { name: 'Marteau', category: 'Outillage', barcode: '1234567890', costPrice: 25, sellingPrice: 40, stock: 50 },
      { name: 'Tournevis', category: 'Outillage', barcode: '1234567891', costPrice: 15, sellingPrice: 25, stock: 100 },
      { name: 'Peinture Blanche', category: 'Peinture', barcode: '1234567892', costPrice: 45, sellingPrice: 70, stock: 30 },
      { name: 'Câble Électrique', category: 'Électricité', barcode: '1234567893', costPrice: 20, sellingPrice: 35, stock: 200 },
      { name: 'Tuyau PVC', category: 'Plomberie', barcode: '1234567894', costPrice: 12, sellingPrice: 20, stock: 80 },
      { name: 'Vis 4x50mm', category: 'Quincaillerie', barcode: '1234567895', costPrice: 0.5, sellingPrice: 1, stock: 1000 }
    ];

    sampleProducts.forEach(product => {
      try {
        const exists = db.prepare('SELECT COUNT(*) as count FROM products WHERE name = ?').get(product.name);
        if (exists.count === 0) {
          db.prepare(`
            INSERT INTO products (name, category, barcode, cost_price, selling_price, stock, min_stock)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            product.name,
            product.category,
            product.barcode,
            product.costPrice,
            product.sellingPrice,
            product.stock,
            10
          );
        }
      } catch (e) {
        // Product might already exist
      }
    });

    console.log('✅ Initial data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

export default { initializeDatabase, testConnection, executeQuery, seedInitialData, getDatabase };
