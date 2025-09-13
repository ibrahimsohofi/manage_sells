import { executeQuery } from '../config/database.js';

export class Sales {
  // Get all sales as individual records
  static async getIndividualSales(storeId = null) {
    let query = `
      SELECT
        id,
        sale_date as date,
        product_name as productName,
        category,
        quantity,
        unit_price as price,
        unit_price as unitPrice,
        total_price as totalPrice,
        store_id as storeId,
        notes,
        created_at as timestamp
      FROM sales
    `;
    let params = [];

    if (storeId) {
      query += ' WHERE store_id = ?';
      params.push(storeId);
    }

    query += ' ORDER BY sale_date DESC, id DESC';
    return await executeQuery(query, params);
  }

  // Get daily sales summary (grouped by date)
  static async getAllDailySales(storeId = null) {
    let query = `
      SELECT
        sale_date as day_id,
        sale_date as day_name,
        store_id,
        COUNT(*) as items_count,
        SUM(total_price) as total_amount,
        s.name as store_name
      FROM sales
      LEFT JOIN stores s ON sales.store_id = s.id
    `;
    let params = [];

    if (storeId) {
      query += ' WHERE sales.store_id = ?';
      params.push(storeId);
    }

    query += ' GROUP BY sale_date, store_id ORDER BY sale_date DESC';
    return await executeQuery(query, params);
  }

  // Get daily sales by date range
  static async getDailySalesByDateRange(startDate, endDate, storeId = null) {
    let query = `
      SELECT
        sale_date as day_id,
        sale_date as day_name,
        store_id,
        COUNT(*) as items_count,
        SUM(total_price) as total_amount,
        s.name as store_name
      FROM sales
      LEFT JOIN stores s ON sales.store_id = s.id
      WHERE sale_date BETWEEN ? AND ?
    `;
    let params = [startDate, endDate];

    if (storeId) {
      query += ' AND sales.store_id = ?';
      params.push(storeId);
    }

    query += ' GROUP BY sale_date, store_id ORDER BY sale_date DESC';
    return await executeQuery(query, params);
  }

  // Get sales items for a specific day
  static async getSalesItemsByDay(dayId, storeId = null) {
    let query = `
      SELECT
        id,
        sale_date as date,
        product_name as productName,
        category,
        quantity,
        unit_price as price,
        unit_price as unitPrice,
        total_price as totalPrice,
        store_id as storeId,
        notes,
        created_at as timestamp
      FROM sales
      WHERE sale_date = ?
    `;
    let params = [dayId];

    if (storeId) {
      query += ' AND store_id = ?';
      params.push(storeId);
    }

    query += ' ORDER BY id DESC';
    return await executeQuery(query, params);
  }

  // Add new sale
  static async addSale(saleData) {
    const {
      date,
      dayName,
      storeId = 'main-store',
      productName,
      category,
      unitPrice,
      quantity = 1,
      totalPrice,
      notes = null,
      productId = null
    } = saleData;

    const insertQuery = `
      INSERT INTO sales (
        product_id, product_name, category, quantity,
        unit_price, total_price, sale_date, store_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const calculatedTotal = totalPrice || (unitPrice * quantity);

    const result = await executeQuery(insertQuery, [
      productId, productName, category, quantity,
      unitPrice, calculatedTotal, date, storeId, notes
    ]);

    return {
      success: true,
      id: result.insertId,
      totalPrice: calculatedTotal
    };
  }

  // Delete sale item
  static async deleteSaleItem(itemId) {
    const deleteQuery = 'DELETE FROM sales WHERE id = ?';
    const result = await executeQuery(deleteQuery, [itemId]);

    if (result.affectedRows === 0) {
      throw new Error('Sale item not found');
    }

    return { success: true };
  }

  // Get sales statistics
  static async getSalesStats(storeId = null) {
    let query = `
      SELECT
        COUNT(DISTINCT sale_date) as total_days,
        COALESCE(SUM(total_price), 0) as total_revenue,
        COALESCE(SUM(quantity), 0) as total_items_sold,
        COUNT(*) as total_transactions
      FROM sales
    `;
    let params = [];

    if (storeId) {
      query += ' WHERE store_id = ?';
      params.push(storeId);
    }

    const result = await executeQuery(query, params);
    return result.length > 0 ? result[0] : {
      total_days: 0,
      total_revenue: 0,
      total_items_sold: 0,
      total_transactions: 0
    };
  }

  // Get sales by category
  static async getSalesByCategory(storeId = null) {
    let query = `
      SELECT
        category,
        COUNT(*) as sales_count,
        SUM(quantity) as total_quantity,
        SUM(total_price) as total_amount
      FROM sales
    `;
    let params = [];

    if (storeId) {
      query += ' WHERE store_id = ?';
      params.push(storeId);
    }

    query += ' GROUP BY category ORDER BY total_amount DESC';
    return await executeQuery(query, params);
  }

  // Get monthly sales data
  static async getMonthlySales(year, month, storeId = null) {
    let query = `
      SELECT
        sale_date,
        SUM(total_price) as daily_total,
        COUNT(*) as daily_count
      FROM sales
      WHERE strftime('%Y', sale_date) = ? AND strftime('%m', sale_date) = ?
    `;
    let params = [year.toString(), month.toString().padStart(2, '0')];

    if (storeId) {
      query += ' AND store_id = ?';
      params.push(storeId);
    }

    query += ' GROUP BY sale_date ORDER BY sale_date';
    return await executeQuery(query, params);
  }

  // Get top selling products
  static async getTopProducts(limit = 10, storeId = null) {
    let query = `
      SELECT
        product_name,
        SUM(quantity) as total_quantity,
        SUM(total_price) as total_revenue,
        COUNT(*) as sale_count
      FROM sales
    `;
    let params = [];

    if (storeId) {
      query += ' WHERE store_id = ?';
      params.push(storeId);
    }

    query += ' GROUP BY product_name ORDER BY total_quantity DESC LIMIT ?';
    params.push(limit);

    return await executeQuery(query, params);
  }
}
