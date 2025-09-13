// API service for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Sales API
  async getSales(storeId = null) {
    const params = storeId ? `?storeId=${storeId}` : '';
    return this.request(`/sales${params}`);
  }

  async getDailySales(storeId = null) {
    const params = storeId ? `?storeId=${storeId}` : '';
    return this.request(`/sales/daily${params}`);
  }

  async getSalesByDateRange(startDate, endDate, storeId = null) {
    const params = new URLSearchParams({ startDate, endDate });
    if (storeId) params.append('storeId', storeId);
    return this.request(`/sales/range?${params}`);
  }

  async getSalesItemsByDay(date, storeId = null) {
    const params = storeId ? `?storeId=${storeId}` : '';
    return this.request(`/sales/day/${date}${params}`);
  }

  async addSale(saleData) {
    return this.request('/sales', {
      method: 'POST',
      body: saleData,
    });
  }

  async deleteSaleItem(itemId) {
    return this.request(`/sales/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getSalesStats(storeId = null) {
    const params = storeId ? `?storeId=${storeId}` : '';
    return this.request(`/sales/stats${params}`);
  }

  async getSalesByCategory(storeId = null) {
    const params = storeId ? `?storeId=${storeId}` : '';
    return this.request(`/sales/categories${params}`);
  }

  // Inventory API
  async getInventory(storeId = 'main') {
    return this.request(`/inventory?storeId=${storeId}`);
  }

  async getLowStockItems(storeId = 'main') {
    return this.request(`/inventory/low-stock?storeId=${storeId}`);
  }

  async getInventoryByCategory(category, storeId = 'main') {
    return this.request(`/inventory/category/${category}?storeId=${storeId}`);
  }

  async findProductByBarcode(barcode) {
    return this.request(`/inventory/barcode/${barcode}`);
  }

  async addProduct(productData) {
    return this.request('/inventory', {
      method: 'POST',
      body: productData,
    });
  }

  async updateStock(productName, quantityChange, storeId = 'main') {
    return this.request('/inventory/stock', {
      method: 'PATCH',
      body: { productName, quantityChange, storeId },
    });
  }

  async updateProduct(productId, updates) {
    return this.request(`/inventory/${productId}`, {
      method: 'PATCH',
      body: updates,
    });
  }

  async deleteProduct(productId, storeId = 'main') {
    return this.request(`/inventory/${productId}?storeId=${storeId}`, {
      method: 'DELETE',
    });
  }

  // Stores API
  async getStores() {
    return this.request('/stores');
  }

  async getStoreById(id) {
    return this.request(`/stores/${id}`);
  }

  async getStoreComparison() {
    return this.request('/stores/comparison/all');
  }

  async addStore(storeData) {
    return this.request('/stores', {
      method: 'POST',
      body: storeData,
    });
  }

  async updateStore(id, updates) {
    return this.request(`/stores/${id}`, {
      method: 'PATCH',
      body: updates,
    });
  }

  async deleteStore(id) {
    return this.request(`/stores/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  async getCategories() {
    return this.request('/categories');
  }

  async addCategory(name, description) {
    return this.request('/categories', {
      method: 'POST',
      body: { name, description },
    });
  }

  async updateCategory(id, name, description) {
    return this.request(`/categories/${id}`, {
      method: 'PATCH',
      body: { name, description },
    });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings API
  async getSettings() {
    return this.request('/settings');
  }

  async getSetting(key) {
    return this.request(`/settings/${key}`);
  }

  async setSetting(key, value) {
    return this.request('/settings', {
      method: 'POST',
      body: { key, value },
    });
  }

  async setMultipleSettings(settings) {
    return this.request('/settings/bulk', {
      method: 'POST',
      body: settings,
    });
  }

  async updateSetting(key, value) {
    return this.request(`/settings/${key}`, {
      method: 'PATCH',
      body: { value },
    });
  }

  async deleteSetting(key) {
    return this.request(`/settings/${key}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
export default api;
