import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const seedDatabase = async () => {
  const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');
  const db = new Database(DB_PATH);

  try {
    console.log('🌱 Seeding database with sample data...');

    // Insert stores
    const insertStore = db.prepare(`
      INSERT OR IGNORE INTO stores (id, name, address, phone, is_main) VALUES (?, ?, ?, ?, ?)
    `);
    insertStore.run('main', 'Quincaillerie Jamal - Principal', 'Avenue Hassan II, Casablanca, Maroc', '0522-123456', 1);
    insertStore.run('branch1', 'Quincaillerie Jamal - Maarif', 'Boulevard Zerktouni, Maarif, Casablanca', '0522-654321', 0);

    // Get category IDs
    const categories = db.prepare('SELECT id, name FROM categories').all();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Insert products
    const products = [
      { id: '1', name: 'Marteau 500g', category: 'Outils', barcode: '3401320234567', cost: 15.00, selling: 25.00 },
      { id: '2', name: 'Tournevis Phillips Set', category: 'Outils', barcode: '3401320234568', cost: 12.00, selling: 22.00 },
      { id: '3', name: 'Peinture Blanche 5L', category: 'Peinture', barcode: '3401320234569', cost: 80.00, selling: 120.00 },
      { id: '4', name: 'Tuyau PVC 32mm (2m)', category: 'Plomberie', barcode: '3401320234570', cost: 8.00, selling: 15.00 },
      { id: '5', name: 'Câble Électrique 2.5mm² (10m)', category: 'Électricité', barcode: '3401320234571', cost: 25.00, selling: 40.00 },
      { id: '6', name: 'Niveau à Bulle 60cm', category: 'Outils', barcode: '3401320234572', cost: 30.00, selling: 50.00 },
      { id: '7', name: 'Vis 4x50mm (Boîte 100)', category: 'Quincaillerie', barcode: '3401320234573', cost: 8.50, selling: 15.00 },
      { id: '8', name: 'Détergent Multi-Usage 1L', category: 'Nettoyage', barcode: '3401320234574', cost: 6.00, selling: 12.00 }
    ];

    const insertProduct = db.prepare(`
      INSERT OR IGNORE INTO products (id, name, category_id, barcode, cost_price, selling_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const product of products) {
      insertProduct.run(product.id, product.name, categoryMap[product.category], product.barcode, product.cost, product.selling);
    }

    // Insert inventory
    const inventory = [
      { product_id: '1', stock: 48, min_stock: 10 }, // Reduced by 2 (sold)
      { product_id: '2', stock: 8, min_stock: 15 },
      { product_id: '3', stock: 74, min_stock: 10 }, // Reduced by 1 (sold)
      { product_id: '4', stock: 42, min_stock: 8 }, // Reduced by 3 (sold)
      { product_id: '5', stock: 29, min_stock: 5 }, // Reduced by 1 (sold)
      { product_id: '6', stock: 3, min_stock: 5 },
      { product_id: '7', stock: 118, min_stock: 25 }, // Reduced by 2 (sold)
      { product_id: '8', stock: 76, min_stock: 15 } // Reduced by 4 (sold)
    ];

    const insertInventory = db.prepare(`
      INSERT OR IGNORE INTO inventory (product_id, store_id, stock_quantity, min_stock_level)
      VALUES (?, 'main', ?, ?)
    `);

    for (const item of inventory) {
      insertInventory.run(item.product_id, item.stock, item.min_stock);
    }

    // Insert daily sales
    const dailySales = [
      { day_id: '2024-09-01', day_name: 'Dimanche', total: 170.00, items: 2 },
      { day_id: '2024-09-02', day_name: 'Lundi', total: 75.00, items: 2 },
      { day_id: '2024-09-03', day_name: 'Mardi', total: 88.00, items: 2 }
    ];

    const insertDailySale = db.prepare(`
      INSERT OR IGNORE INTO daily_sales (day_id, day_name, store_id, total_amount, items_count)
      VALUES (?, ?, 'main', ?, ?)
    `);

    for (const sale of dailySales) {
      insertDailySale.run(sale.day_id, sale.day_name, sale.total, sale.items);
    }

    // Get daily sale IDs for sales items
    const salesData = db.prepare('SELECT id, day_id FROM daily_sales ORDER BY day_id').all();

    // Insert sales items
    const salesItems = [
      // 2024-09-01
      { daily_sale_id: salesData[0].id, name: 'Marteau 500g', category: 'Outils', price: 25.00, quantity: 2, total: 50.00 },
      { daily_sale_id: salesData[0].id, name: 'Peinture Blanche 5L', category: 'Peinture', price: 120.00, quantity: 1, total: 120.00 },
      // 2024-09-02
      { daily_sale_id: salesData[1].id, name: 'Tuyau PVC 32mm (2m)', category: 'Plomberie', price: 15.00, quantity: 3, total: 45.00 },
      { daily_sale_id: salesData[1].id, name: 'Vis 4x50mm (Boîte 100)', category: 'Quincaillerie', price: 15.00, quantity: 2, total: 30.00 },
      // 2024-09-03
      { daily_sale_id: salesData[2].id, name: 'Détergent Multi-Usage 1L', category: 'Nettoyage', price: 12.00, quantity: 4, total: 48.00 },
      { daily_sale_id: salesData[2].id, name: 'Câble Électrique 2.5mm² (10m)', category: 'Électricité', price: 40.00, quantity: 1, total: 40.00 }
    ];

    const insertSalesItem = db.prepare(`
      INSERT OR IGNORE INTO sales_items (daily_sale_id, product_name, category, unit_price, quantity, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of salesItems) {
      insertSalesItem.run(item.daily_sale_id, item.name, item.category, item.price, item.quantity, item.total);
    }

    // Insert default settings
    const settings = [
      { key: 'currentStore', value: 'main' },
      { key: 'defaultStore', value: 'main' },
      { key: 'enableBarcodeScanning', value: 'true' },
      { key: 'showProfitMargins', value: 'true' }
    ];

    const insertSetting = db.prepare(`
      INSERT OR IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)
    `);

    for (const setting of settings) {
      insertSetting.run(setting.key, setting.value);
    }

    console.log('✅ Sample data seeded successfully!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    db.close();
  }
};

seedDatabase();
