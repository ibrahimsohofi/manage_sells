// Storage utilities using API backend instead of localStorage
import api from './api.js';

// Settings Management
export const saveSettings = async (settings) => {
  try {
    await api.setMultipleSettings(settings);
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

export const loadSettings = async () => {
  try {
    const settings = await api.getSettings();
    return {
      currentStore: settings.currentStore || 'main',
      defaultStore: settings.defaultStore || 'main',
      enableBarcodeScanning: settings.enableBarcodeScanning ?? true,
      showProfitMargins: settings.showProfitMargins ?? true,
      ...settings
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      currentStore: 'main',
      defaultStore: 'main',
      enableBarcodeScanning: true,
      showProfitMargins: true
    };
  }
};

// Store Management
export const saveStores = async (stores) => {
  try {
    // This would require implementing bulk store operations in the API
    // For now, we'll just return success since stores are managed individually
    return true;
  } catch (error) {
    console.error('Error saving stores:', error);
    return false;
  }
};

export const loadStores = async () => {
  try {
    return await api.getStores();
  } catch (error) {
    console.error('Error loading stores:', error);
    return [
      {
        id: 'main',
        name: 'Droguerie Jamal - Principal',
        address: 'Casablanca, Maroc',
        phone: '0522-123456',
        is_main: true,
        createdAt: new Date().toISOString()
      }
    ];
  }
};

export const addStore = async (store) => {
  try {
    return await api.addStore(store);
  } catch (error) {
    console.error('Error adding store:', error);
    throw error;
  }
};

export const getStoreById = async (id) => {
  try {
    return await api.getStoreById(id);
  } catch (error) {
    console.error('Error getting store by ID:', error);
    return null;
  }
};

// Sales Management
export const saveDailySales = async (dailySales) => {
  // This is handled automatically by the API when adding individual sales
  return true;
};

export const loadDailySales = async () => {
  try {
    return await api.getDailySales();
  } catch (error) {
    console.error('Error loading daily sales:', error);
    return [];
  }
};

// Convert individual sales to match existing interface
export const loadSales = async () => {
  try {
    const salesData = await api.getSales();
    return salesData.map(sale => ({
      id: sale.id || `${sale.date}-${Date.now()}`,
      date: sale.date,
      dayName: sale.dayName,
      productName: sale.productName,
      category: sale.category,
      quantity: parseInt(sale.quantity) || 1,
      price: parseFloat(sale.unitPrice || sale.price) || 0,
      totalPrice: parseFloat(sale.totalPrice) || 0,
      timestamp: sale.timestamp || new Date().toISOString()
    }));
  } catch (error) {
    console.warn('API not available, loading from localStorage:', error);
    // Fallback to localStorage
    const localSales = JSON.parse(localStorage.getItem('sales') || '[]');
    return localSales.map(sale => ({
      id: sale.id || `${sale.date}-${Date.now()}`,
      date: sale.date,
      dayName: sale.dayName,
      productName: sale.productName,
      category: sale.category,
      quantity: parseInt(sale.quantity) || 1,
      price: parseFloat(sale.price) || 0,
      totalPrice: parseFloat(sale.totalPrice) || 0,
      timestamp: sale.timestamp || new Date().toISOString()
    }));
  }
};

// Add sale using API
export const addSale = async (sale) => {
  try {
    // Fallback to localStorage when API is not available
    const price = parseFloat(sale.price) || 0;
    const quantity = parseInt(sale.quantity) || 1;
    const totalPrice = price * quantity;

    const saleData = {
      date: sale.date,
      dayName: sale.dayName || new Date(sale.date).toLocaleDateString('fr-FR', { weekday: 'long' }),
      storeId: sale.storeId || 'main',
      productName: sale.productName,
      category: sale.category,
      unitPrice: price,
      quantity: quantity,
      totalPrice: totalPrice
    };

    // Try API first, fallback to localStorage
    try {
      const result = await api.addSale(saleData);
    } catch (apiError) {
      console.warn('API not available, using localStorage:', apiError);
      // Store in localStorage as fallback
      const salesData = JSON.parse(localStorage.getItem('sales') || '[]');
      const newSale = {
        id: `${sale.date}-${Date.now()}`,
        date: sale.date,
        dayName: saleData.dayName,
        productName: sale.productName,
        category: sale.category,
        quantity: quantity,
        price: price,
        totalPrice: totalPrice,
        timestamp: new Date().toISOString()
      };
      salesData.push(newSale);
      localStorage.setItem('sales', JSON.stringify(salesData));
    }

    return {
      id: `${sale.date}-${Date.now()}`,
      date: sale.date,
      dayName: saleData.dayName,
      productName: sale.productName,
      category: sale.category,
      quantity: quantity,
      price: price,
      totalPrice: totalPrice,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error adding sale:', error);
    throw error;
  }
};

export const deleteSale = async (id) => {
  try {
    // Extract item ID from the composite ID if needed
    const itemId = id.includes('-') ? id.split('-')[1] : id;
    await api.deleteSaleItem(itemId);
    return true;
  } catch (error) {
    console.error('Error deleting sale:', error);
    return false;
  }
};

// Get sales data by day
export const getSalesByDate = async (date, storeId = null) => {
  try {
    return await api.getSalesItemsByDay(date, storeId);
  } catch (error) {
    console.error('Error getting sales by date:', error);
    return [];
  }
};

export const getDailyTotal = async (date, storeId = null) => {
  try {
    const sales = await getSalesByDate(date, storeId);
    return sales.reduce((total, sale) => total + (sale.totalPrice || 0), 0);
  } catch (error) {
    console.error('Error getting daily total:', error);
    return 0;
  }
};

// Get all days with sales data
export const getAllSalesDays = async () => {
  try {
    const dailySales = await api.getDailySales();
    return dailySales.map(day => ({
      day_id: day.day_id,
      day_name: day.day_name,
      items_count: day.items_count,
      total_prices: day.total_amount
    }));
  } catch (error) {
    console.error('Error getting all sales days:', error);
    return [];
  }
};

// Additional compatibility functions
export const getSalesByStore = async (storeId) => {
  try {
    return await api.getSales(storeId);
  } catch (error) {
    console.error('Error getting sales by store:', error);
    return [];
  }
};

export const getSalesByCategory = async (category, storeId = null) => {
  try {
    const sales = await api.getSales(storeId);
    return sales.filter(sale => sale.category === category);
  } catch (error) {
    console.error('Error getting sales by category:', error);
    return [];
  }
};

export const getCategoryTotal = async (category, storeId = null) => {
  try {
    const categorySales = await getSalesByCategory(category, storeId);
    return categorySales.reduce((total, sale) => total + sale.totalPrice, 0);
  } catch (error) {
    console.error('Error getting category total:', error);
    return 0;
  }
};

// Customer Management (placeholder - would need backend implementation)
export const saveCustomers = async (customers) => {
  console.warn('Customer management not yet implemented in API');
  return true;
};

export const loadCustomers = async () => {
  console.warn('Customer management not yet implemented in API');
  return [];
};

export const addCustomer = async (customer) => {
  console.warn('Customer management not yet implemented in API');
  return { ...customer, id: Date.now().toString() };
};

export const updateCustomerStats = async (customerId, amount) => {
  console.warn('Customer management not yet implemented in API');
};

export const getCustomerById = async (id) => {
  console.warn('Customer management not yet implemented in API');
  return null;
};

// Inventory Management
export const saveInventory = async (inventory) => {
  // Handled automatically by the API
  return true;
};

export const loadInventory = async () => {
  try {
    const inventory = await api.getInventory();
    return inventory.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      stock: item.stock || 0,
      minStock: item.minStock || 5,
      costPrice: item.costPrice || 0,
      sellingPrice: item.sellingPrice || 0,
      barcode: item.barcode || '',
      createdAt: item.createdAt,
      lastUpdated: item.lastUpdated
    }));
  } catch (error) {
    console.error('Error loading inventory:', error);
    return [];
  }
};

export const addInventoryItem = async (item) => {
  try {
    await api.addProduct({
      id: item.id || Date.now().toString(),
      name: item.name,
      category: item.category,
      barcode: item.barcode,
      costPrice: item.costPrice || 0,
      sellingPrice: item.sellingPrice || 0,
      stock: item.stock || 0,
      minStock: item.minStock || 5,
      storeId: 'main'
    });
    return await loadInventory();
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

export const findProductByBarcode = async (barcode) => {
  try {
    return await api.findProductByBarcode(barcode);
  } catch (error) {
    console.error('Error finding product by barcode:', error);
    return null;
  }
};

export const updateInventoryStock = async (productName, quantityChange, storeId = 'main') => {
  try {
    await api.updateStock(productName, quantityChange, storeId);
    return true;
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    return false;
  }
};

export const getLowStockItems = async () => {
  try {
    return await api.getLowStockItems();
  } catch (error) {
    console.error('Error getting low stock items:', error);
    return [];
  }
};

export const getInventoryByCategory = async (category) => {
  try {
    return await api.getInventoryByCategory(category);
  } catch (error) {
    console.error('Error getting inventory by category:', error);
    return [];
  }
};

// Reporting utilities
export const getMonthlyData = async (year, month, storeId = null) => {
  try {
    const sales = await api.getSales(storeId);
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getFullYear() === year && saleDate.getMonth() === month;
    });
  } catch (error) {
    console.error('Error getting monthly data:', error);
    return [];
  }
};

export const getYearlyData = async (year, storeId = null) => {
  try {
    const sales = await api.getSales(storeId);
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getFullYear() === year;
    });
  } catch (error) {
    console.error('Error getting yearly data:', error);
    return [];
  }
};

export const getProfitAnalysis = async (startDate, endDate, storeId = null) => {
  try {
    const sales = await api.getSalesByDateRange(startDate, endDate, storeId);

    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const totalCost = sales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0);
    const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      avgMargin,
      salesCount: sales.length
    };
  } catch (error) {
    console.error('Error getting profit analysis:', error);
    return {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      avgMargin: 0,
      salesCount: 0
    };
  }
};

export const getStoreComparison = async () => {
  try {
    return await api.getStoreComparison();
  } catch (error) {
    console.error('Error getting store comparison:', error);
    return [];
  }
};

export const generateCSV = (data, type = 'sales') => {
  // Keep the existing CSV generation logic
  if (type === 'sales') {
    const headers = [
      'Date', 'Magasin', 'Jour', 'Produit', 'Code-barres', 'Catégorie',
      'Quantité', 'Prix Unitaire', 'Prix Total'
    ];
    const rows = data.map(sale => [
      sale.date,
      sale.storeId || 'N/A',
      sale.dayName,
      sale.productName,
      sale.barcode || 'N/A',
      sale.category,
      sale.quantity || 1,
      (sale.unitPrice || sale.price || 0).toFixed(2),
      sale.totalPrice.toFixed(2)
    ]);
    return [headers, ...rows];
  }

  if (type === 'inventory') {
    const headers = [
      'Produit', 'Code-barres', 'Catégorie', 'Stock', 'Stock Minimum',
      'Prix Achat', 'Prix Vente', 'Statut'
    ];
    const rows = data.map(item => [
      item.name,
      item.barcode || 'N/A',
      item.category,
      item.stock,
      item.minStock,
      (item.costPrice || 0).toFixed(2),
      (item.sellingPrice || 0).toFixed(2),
      item.stock <= item.minStock ? 'Stock Faible' : 'OK'
    ]);
    return [headers, ...rows];
  }

  return [];
};

// Add backward compatibility functions
export const addItemToDay = addSale;
export const deleteItemFromDay = deleteSale;
