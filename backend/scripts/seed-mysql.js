import { executeQuery, testConnection } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const seedMySQLDatabase = async () => {
  console.log('🌱 Seeding MySQL database with sample data...');

  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Cannot connect to MySQL database');
    }

    // Get category IDs
    const categories = await executeQuery('SELECT id, name FROM categories');
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    console.log('📦 Adding sample products...');

    // Insert products
    const products = [
      { id: 'prod-1', name: 'Marteau 500g', category: 'Outils', barcode: '3401320234567', cost: 15.00, selling: 25.00 },
      { id: 'prod-2', name: 'Tournevis Phillips Set', category: 'Outils', barcode: '3401320234568', cost: 12.00, selling: 22.00 },
      { id: 'prod-3', name: 'Peinture Blanche 5L', category: 'Peinture', barcode: '3401320234569', cost: 80.00, selling: 120.00 },
      { id: 'prod-4', name: 'Tuyau PVC 32mm (2m)', category: 'Plomberie', barcode: '3401320234570', cost: 8.00, selling: 15.00 },
      { id: 'prod-5', name: 'Câble Électrique 2.5mm² (10m)', category: 'Électricité', barcode: '3401320234571', cost: 25.00, selling: 40.00 },
      { id: 'prod-6', name: 'Niveau à Bulle 60cm', category: 'Outils', barcode: '3401320234572', cost: 30.00, selling: 50.00 },
      { id: 'prod-7', name: 'Vis 4x50mm (Boîte 100)', category: 'Quincaillerie', barcode: '3401320234573', cost: 8.50, selling: 15.00 },
      { id: 'prod-8', name: 'Détergent Multi-Usage 1L', category: 'Nettoyage', barcode: '3401320234574', cost: 6.00, selling: 12.00 }
    ];

    for (const product of products) {
      await executeQuery(`
        INSERT IGNORE INTO products (id, name, category_id, barcode, cost_price, selling_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [product.id, product.name, categoryMap[product.category], product.barcode, product.cost, product.selling]);
    }

    console.log('🏪 Adding inventory data...');

    // Insert inventory
    const inventory = [
      { product_id: 'prod-1', stock: 48, min_stock: 10, cost: 15.00, selling: 25.00 },
      { product_id: 'prod-2', stock: 8, min_stock: 15, cost: 12.00, selling: 22.00 }, // Low stock
      { product_id: 'prod-3', stock: 25, min_stock: 5, cost: 80.00, selling: 120.00 },
      { product_id: 'prod-4', stock: 40, min_stock: 8, cost: 8.00, selling: 15.00 },
      { product_id: 'prod-5', stock: 20, min_stock: 5, cost: 25.00, selling: 40.00 },
      { product_id: 'prod-6', stock: 3, min_stock: 5, cost: 30.00, selling: 50.00 }, // Low stock
      { product_id: 'prod-7', stock: 150, min_stock: 25, cost: 8.50, selling: 15.00 },
      { product_id: 'prod-8', stock: 75, min_stock: 15, cost: 6.00, selling: 12.00 }
    ];

    for (const item of inventory) {
      await executeQuery(`
        INSERT IGNORE INTO inventory (product_id, store_id, current_stock, min_stock_level, cost_price, selling_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [item.product_id, 'main-store', item.stock, item.min_stock, item.cost, item.selling]);
    }

    console.log('💰 Adding sample sales...');

    // Insert sales
    const sales = [
      { product_id: 'prod-1', name: 'Marteau 500g', category: 'Outils', quantity: 2, price: 25.00, total: 50.00, date: '2024-09-01' },
      { product_id: 'prod-3', name: 'Peinture Blanche 5L', category: 'Peinture', quantity: 1, price: 120.00, total: 120.00, date: '2024-09-02' },
      { product_id: 'prod-7', name: 'Vis 4x50mm (Boîte 100)', category: 'Quincaillerie', quantity: 3, price: 15.00, total: 45.00, date: '2024-09-03' },
      { product_id: 'prod-4', name: 'Tuyau PVC 32mm (2m)', category: 'Plomberie', quantity: 2, price: 15.00, total: 30.00, date: '2024-09-04' },
      { product_id: 'prod-5', name: 'Câble Électrique 2.5mm²', category: 'Électricité', quantity: 1, price: 40.00, total: 40.00, date: '2024-09-05' },
      { product_id: 'prod-6', name: 'Niveau à Bulle 60cm', category: 'Outils', quantity: 1, price: 50.00, total: 50.00, date: '2024-09-06' },
      { product_id: 'prod-8', name: 'Détergent Multi-Usage 1L', category: 'Nettoyage', quantity: 4, price: 12.00, total: 48.00, date: '2024-09-07' },
      { product_id: 'prod-2', name: 'Tournevis Phillips Set', category: 'Outils', quantity: 1, price: 22.00, total: 22.00, date: '2024-09-08' }
    ];

    for (const sale of sales) {
      await executeQuery(`
        INSERT INTO sales (product_id, product_name, category, quantity, unit_price, total_price, sale_date, store_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [sale.product_id, sale.name, sale.category, sale.quantity, sale.price, sale.total, sale.date, 'main-store']);
    }

    console.log('⚙️ Adding application settings...');

    // Insert settings
    const settings = [
      { key: 'currentStore', value: 'main-store', description: 'Currently selected store' },
      { key: 'defaultStore', value: 'main-store', description: 'Default store for new transactions' },
      { key: 'enableBarcodeScanning', value: 'true', description: 'Enable barcode scanning functionality' },
      { key: 'showProfitMargins', value: 'true', description: 'Show profit margins in reports' },
      { key: 'lowStockThreshold', value: '5', description: 'Default low stock threshold' },
      { key: 'currency', value: 'MAD', description: 'Default currency' }
    ];

    for (const setting of settings) {
      await executeQuery(`
        INSERT IGNORE INTO settings (setting_key, setting_value, description)
        VALUES (?, ?, ?)
      `, [setting.key, setting.value, setting.description]);
    }

    console.log('\n✅ MySQL database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   • ${products.length} products added`);
    console.log(`   • ${inventory.length} inventory items added`);
    console.log(`   • ${sales.length} sales transactions added`);
    console.log(`   • ${settings.length} application settings added`);
    console.log(`   • 2 items with low stock alerts`);
    console.log(`   • Total sales value: ${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)} MAD`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    throw error;
  }
};

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMySQLDatabase()
    .then(() => {
      console.log('🎉 MySQL seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedMySQLDatabase;
