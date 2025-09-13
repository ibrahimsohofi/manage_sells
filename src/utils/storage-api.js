// Storage utilities using MySQL API backend only (no localStorage fallbacks)
import api from './api.js';

// =======================
// SALES FUNCTIONS
// =======================

export const loadSales = async (storeId = 'main') => {
  try {
    const response = await api.get(`/sales?storeId=${storeId}`);
    return response;
  } catch (error) {
    console.error('Failed to load sales from MySQL:', error);
    throw new Error('Impossible de charger les ventes depuis MySQL. Vérifiez la connexion à la base de données.');
  }
};

export const addSale = async (sale) => {
  try {
    const response = await api.post('/sales', sale);
    return response;
  } catch (error) {
    console.error('Failed to add sale to MySQL:', error);
    throw new Error('Impossible d\'ajouter la vente à MySQL. Vérifiez la connexion à la base de données.');
  }
};

export const deleteSale = async (saleId) => {
  try {
    await api.delete(`/sales/${saleId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete sale from MySQL:', error);
    throw new Error('Impossible de supprimer la vente de MySQL. Vérifiez la connexion à la base de données.');
  }
};

export const getDailySales = async (storeId = 'main') => {
  try {
    const response = await api.get(`/sales/daily?storeId=${storeId}`);
    return response;
  } catch (error) {
    console.error('Failed to load daily sales from MySQL:', error);
    throw new Error('Impossible de charger les ventes quotidiennes depuis MySQL.');
  }
};

// =======================
// INVENTORY FUNCTIONS
// =======================

export const loadInventory = async (storeId = 'main') => {
  try {
    const response = await api.get(`/inventory?storeId=${storeId}`);
    return response;
  } catch (error) {
    console.error('Failed to load inventory from MySQL:', error);
    throw new Error('Impossible de charger l\'inventaire depuis MySQL. Vérifiez la connexion à la base de données.');
  }
};

export const addInventoryItem = async (item) => {
  try {
    const response = await api.post('/inventory', item);
    return response;
  } catch (error) {
    console.error('Failed to add inventory item to MySQL:', error);
    throw new Error('Impossible d\'ajouter l\'article à l\'inventaire MySQL.');
  }
};

export const updateInventoryItem = async (id, updates) => {
  try {
    const response = await api.put(`/inventory/${id}`, updates);
    return response;
  } catch (error) {
    console.error('Failed to update inventory item in MySQL:', error);
    throw new Error('Impossible de mettre à jour l\'article dans MySQL.');
  }
};

export const deleteInventoryItem = async (id) => {
  try {
    await api.delete(`/inventory/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete inventory item from MySQL:', error);
    throw new Error('Impossible de supprimer l\'article de l\'inventaire MySQL.');
  }
};

export const getLowStockItems = async (storeId = 'main') => {
  try {
    const response = await api.get(`/inventory/low-stock?storeId=${storeId}`);
    return response;
  } catch (error) {
    console.error('Failed to load low stock items from MySQL:', error);
    throw new Error('Impossible de charger les articles en rupture de stock depuis MySQL.');
  }
};

// =======================
// STORES FUNCTIONS
// =======================

export const loadStores = async () => {
  try {
    const response = await api.get('/stores');
    return response;
  } catch (error) {
    console.error('Failed to load stores from MySQL:', error);
    throw new Error('Impossible de charger les magasins depuis MySQL. Vérifiez la connexion à la base de données.');
  }
};

export const addStore = async (store) => {
  try {
    const response = await api.post('/stores', store);
    return response;
  } catch (error) {
    console.error('Failed to add store to MySQL:', error);
    throw new Error('Impossible d\'ajouter le magasin à MySQL.');
  }
};

export const updateStore = async (id, updates) => {
  try {
    const response = await api.put(`/stores/${id}`, updates);
    return response;
  } catch (error) {
    console.error('Failed to update store in MySQL:', error);
    throw new Error('Impossible de mettre à jour le magasin dans MySQL.');
  }
};

export const deleteStore = async (id) => {
  try {
    await api.delete(`/stores/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete store from MySQL:', error);
    throw new Error('Impossible de supprimer le magasin de MySQL.');
  }
};

// =======================
// CATEGORIES FUNCTIONS
// =======================

export const loadCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response;
  } catch (error) {
    console.error('Failed to load categories from MySQL:', error);
    throw new Error('Impossible de charger les catégories depuis MySQL. Vérifiez la connexion à la base de données.');
  }
};

export const addCategory = async (category) => {
  try {
    const response = await api.post('/categories', category);
    return response;
  } catch (error) {
    console.error('Failed to add category to MySQL:', error);
    throw new Error('Impossible d\'ajouter la catégorie à MySQL.');
  }
};

// =======================
// SETTINGS FUNCTIONS
// =======================

export const loadSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response;
  } catch (error) {
    console.error('Failed to load settings from MySQL:', error);
    throw new Error('Impossible de charger les paramètres depuis MySQL. Vérifiez la connexion à la base de données.');
  }
};

export const updateSettings = async (settings) => {
  try {
    const response = await api.put('/settings', settings);
    return response;
  } catch (error) {
    console.error('Failed to update settings in MySQL:', error);
    throw new Error('Impossible de mettre à jour les paramètres dans MySQL.');
  }
};

// =======================
// ANALYTICS FUNCTIONS
// =======================

export const getSalesStats = async (storeId = 'main', period = 'week') => {
  try {
    const response = await api.get(`/sales/stats?storeId=${storeId}&period=${period}`);
    return response;
  } catch (error) {
    console.error('Failed to load sales stats from MySQL:', error);
    throw new Error('Impossible de charger les statistiques de vente depuis MySQL.');
  }
};

export const getCategoryStats = async (storeId = 'main') => {
  try {
    const response = await api.get(`/sales/category-stats?storeId=${storeId}`);
    return response;
  } catch (error) {
    console.error('Failed to load category stats from MySQL:', error);
    throw new Error('Impossible de charger les statistiques par catégorie depuis MySQL.');
  }
};

// =======================
// EXPORT FUNCTIONS
// =======================

export const exportSalesCSV = (sales) => {
  const headers = ['Date', 'Produit', 'Catégorie', 'Quantité', 'Prix Unitaire', 'Total'];
  const rows = sales.map(sale => [
    sale.date,
    sale.productName,
    sale.category,
    sale.quantity,
    `${sale.unitPrice} MAD`,
    `${sale.totalPrice} MAD`
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `ventes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
