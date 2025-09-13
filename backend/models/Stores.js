import { executeQuery } from '../config/database.js';

export class Stores {
  // Get all stores
  static async getAll() {
    const query = 'SELECT * FROM stores ORDER BY is_main DESC, name';
    return await executeQuery(query);
  }

  // Get store by ID
  static async getById(id) {
    const query = 'SELECT * FROM stores WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.length > 0 ? result[0] : null;
  }

  // Add new store
  static async add(storeData) {
    const { id, name, address, phone, isMain = false } = storeData;
    const storeId = id || Date.now().toString();

    const query = 'INSERT INTO stores (id, name, address, phone, is_main) VALUES (?, ?, ?, ?, ?)';
    await executeQuery(query, [storeId, name, address, phone, isMain]);
    return { success: true, id: storeId };
  }

  // Update store
  static async update(id, updates) {
    const { name, address, phone, isMain } = updates;

    let setClauses = [];
    let params = [];

    if (name) {
      setClauses.push('name = ?');
      params.push(name);
    }
    if (address !== undefined) {
      setClauses.push('address = ?');
      params.push(address);
    }
    if (phone !== undefined) {
      setClauses.push('phone = ?');
      params.push(phone);
    }
    if (isMain !== undefined) {
      setClauses.push('is_main = ?');
      params.push(isMain);
    }

    if (setClauses.length > 0) {
      params.push(id);
      const query = `UPDATE stores SET ${setClauses.join(', ')} WHERE id = ?`;
      await executeQuery(query, params);
    }

    return { success: true };
  }

  // Delete store
  static async delete(id) {
    const query = 'DELETE FROM stores WHERE id = ?';
    await executeQuery(query, [id]);
    return { success: true };
  }

  // Get store comparison with sales data
  static async getStoreComparison() {
    const query = `
      SELECT
        s.*,
        COALESCE(SUM(ds.total_amount), 0) as revenue,
        COUNT(DISTINCT ds.id) as transactions,
        COALESCE(SUM(ds.items_count), 0) as total_items_sold,
        CASE
          WHEN COUNT(DISTINCT ds.id) > 0
          THEN COALESCE(SUM(ds.total_amount), 0) / COUNT(DISTINCT ds.id)
          ELSE 0
        END as avg_transaction
      FROM stores s
      LEFT JOIN daily_sales ds ON s.id = ds.store_id
      GROUP BY s.id, s.name, s.address, s.phone, s.is_main, s.created_at, s.updated_at
      ORDER BY s.is_main DESC, revenue DESC
    `;
    return await executeQuery(query);
  }
}
