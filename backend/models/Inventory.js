import { executeQuery } from '../config/database.js';

export class Inventory {
  // Get all inventory items
  static async getAllInventory(storeId = 'main') {
    const query = `
      SELECT
        id,
        name,
        category,
        barcode,
        cost_price as costPrice,
        selling_price as sellingPrice,
        stock,
        min_stock as minStock,
        updated_at as lastUpdated,
        created_at as createdAt
      FROM products
      WHERE store_id = ?
      ORDER BY name
    `;
    return await executeQuery(query, [storeId]);
  }

  // Get low stock items
  static async getLowStockItems(storeId = 'main') {
    const query = `
      SELECT
        id,
        name,
        category,
        barcode,
        cost_price as costPrice,
        selling_price as sellingPrice,
        stock,
        min_stock as minStock
      FROM products
      WHERE store_id = ? AND stock <= min_stock
      ORDER BY (stock - min_stock)
    `;
    return await executeQuery(query, [storeId]);
  }

  // Add new product
  static async addProduct(productData) {
    const { name, category, barcode, costPrice, sellingPrice, stock, minStock, storeId } = productData;

    // Insert product with inventory data
    const insertProductQuery = `
      INSERT INTO products (name, category, barcode, cost_price, selling_price, stock, min_stock, store_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertProductQuery, [
      name,
      category || 'Autres',
      barcode,
      costPrice || 0,
      sellingPrice || 0,
      stock || 0,
      minStock || 5,
      storeId || 'main'
    ]);

    return {
      id: result.insertId,
      name,
      category: category || 'Autres',
      barcode,
      costPrice: costPrice || 0,
      sellingPrice: sellingPrice || 0,
      stock: stock || 0,
      minStock: minStock || 5,
      storeId: storeId || 'main'
    };
  }

  // Update stock quantity
  static async updateStock(productName, quantityChange, storeId = 'main') {
    // Update stock directly in products table
    const updateQuery = `
      UPDATE products
      SET stock = MAX(0, stock + ?), updated_at = CURRENT_TIMESTAMP
      WHERE name = ? AND store_id = ?
    `;

    const result = await executeQuery(updateQuery, [quantityChange, productName, storeId]);

    if (result.affectedRows === 0) {
      // Create new product if it doesn't exist
      await this.addProduct({
        name: productName,
        category: 'Non catégorisé',
        stock: Math.max(0, quantityChange),
        minStock: 5,
        storeId
      });
    }

    return { success: true };
  }

  // Find product by barcode
  static async findByBarcode(barcode) {
    const query = `
      SELECT
        id,
        name,
        category,
        barcode,
        cost_price as costPrice,
        selling_price as sellingPrice,
        stock,
        min_stock as minStock
      FROM products
      WHERE barcode = ?
    `;
    const result = await executeQuery(query, [barcode]);
    return result.length > 0 ? result[0] : null;
  }

  // Get inventory by category
  static async getByCategory(category, storeId = 'main') {
    const query = `
      SELECT
        id,
        name,
        category,
        barcode,
        cost_price as costPrice,
        selling_price as sellingPrice,
        stock,
        min_stock as minStock
      FROM products
      WHERE category = ? AND store_id = ?
      ORDER BY name
    `;
    return await executeQuery(query, [category, storeId]);
  }

  // Delete product
  static async deleteProduct(productId, storeId = 'main') {
    // Delete product directly
    const deleteProductQuery = 'DELETE FROM products WHERE id = ? AND store_id = ?';
    const result = await executeQuery(deleteProductQuery, [productId, storeId]);

    return { success: true, affectedRows: result.affectedRows };
  }

  // Update product details
  static async updateProduct(productId, updates) {
    const { name, category, barcode, costPrice, sellingPrice, stock, minStock, storeId } = updates;

    // Build update query
    let setClauses = [];
    let params = [];

    if (name) {
      setClauses.push('name = ?');
      params.push(name);
    }
    if (category) {
      setClauses.push('category = ?');
      params.push(category);
    }
    if (barcode) {
      setClauses.push('barcode = ?');
      params.push(barcode);
    }
    if (costPrice !== undefined) {
      setClauses.push('cost_price = ?');
      params.push(costPrice);
    }
    if (sellingPrice !== undefined) {
      setClauses.push('selling_price = ?');
      params.push(sellingPrice);
    }
    if (stock !== undefined) {
      setClauses.push('stock = ?');
      params.push(stock);
    }
    if (minStock !== undefined) {
      setClauses.push('min_stock = ?');
      params.push(minStock);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = CURRENT_TIMESTAMP');
      params.push(productId, storeId || 'main');
      const updateQuery = `UPDATE products SET ${setClauses.join(', ')} WHERE id = ? AND store_id = ?`;
      const result = await executeQuery(updateQuery, params);
      return { success: true, affectedRows: result.affectedRows };
    }

    return { success: true };
  }
}
