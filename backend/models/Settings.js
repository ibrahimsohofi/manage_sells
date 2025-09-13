import { executeQuery } from '../config/database.js';

export class Settings {
  // Get all settings
  static async getAll() {
    const query = 'SELECT setting_key, setting_value FROM settings';
    const result = await executeQuery(query);

    // Convert to object format
    const settings = {};
    result.forEach(row => {
      let value = row.setting_value;
      // Parse boolean and JSON values
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
      settings[row.setting_key] = value;
    });

    return settings;
  }

  // Get setting by key
  static async get(key) {
    const query = 'SELECT setting_value FROM settings WHERE setting_key = ?';
    const result = await executeQuery(query, [key]);

    if (result.length === 0) return null;

    let value = result[0].setting_value;
    // Parse boolean and JSON values
    if (value === 'true') return true;
    if (value === 'false') return false;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  // Set setting
  static async set(key, value) {
    // Convert value to string
    let stringValue = value;
    if (typeof value === 'boolean') {
      stringValue = value.toString();
    } else if (typeof value === 'object') {
      stringValue = JSON.stringify(value);
    }

    const query = `
      INSERT INTO settings (setting_key, setting_value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `;
    await executeQuery(query, [key, stringValue]);
    return { success: true };
  }

  // Set multiple settings
  static async setMultiple(settings) {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value);
    }
    return { success: true };
  }

  // Delete setting
  static async delete(key) {
    const query = 'DELETE FROM settings WHERE setting_key = ?';
    await executeQuery(query, [key]);
    return { success: true };
  }

  // Get default settings
  static getDefaults() {
    return {
      currentStore: 'main',
      defaultStore: 'main',
      enableBarcodeScanning: true,
      showProfitMargins: true
    };
  }
}
