import { executeQuery } from '../config/database.js';

export class Categories {
  // Get all categories
  static async getAll() {
    const query = 'SELECT * FROM categories ORDER BY name';
    return await executeQuery(query);
  }

  // Add new category
  static async add(name, description = null) {
    const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    const result = await executeQuery(query, [name, description]);
    return { success: true, id: result.insertId };
  }

  // Update category
  static async update(id, name, description = null) {
    const query = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
    await executeQuery(query, [name, description, id]);
    return { success: true };
  }

  // Delete category
  static async delete(id) {
    const query = 'DELETE FROM categories WHERE id = ?';
    await executeQuery(query, [id]);
    return { success: true };
  }

  // Get category by name
  static async getByName(name) {
    const query = 'SELECT * FROM categories WHERE name = ?';
    const result = await executeQuery(query, [name]);
    return result.length > 0 ? result[0] : null;
  }
}
