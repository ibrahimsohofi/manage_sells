// Enhanced localStorage utilities for advanced business management
const STORAGE_KEY = 'droguerie_jamal_sales';
const CUSTOMERS_KEY = 'droguerie_jamal_customers';
const INVENTORY_KEY = 'droguerie_jamal_inventory';
const STORES_KEY = 'droguerie_jamal_stores';
const SETTINGS_KEY = 'droguerie_jamal_settings';

// Settings Management
export const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadSettings = () => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? JSON.parse(stored) : {
    currentStore: null,
    defaultStore: null,
    enableBarcodeScanning: true,
    showProfitMargins: true
  };
};

// Store Management
export const saveStores = (stores) => {
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
};

export const loadStores = () => {
  const stored = localStorage.getItem(STORES_KEY);
  const defaultStores = [
    {
      id: 'main',
      name: 'Droguerie Jamal - Principal',
      address: 'Casablanca, Maroc',
      phone: '0522-123456',
      isMain: true,
      createdAt: new Date().toISOString()
    }
  ];
  return stored ? JSON.parse(stored) : defaultStores;
};

export const addStore = (store) => {
  const stores = loadStores();
  const newStore = {
    ...store,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    isMain: false
  };
  stores.push(newStore);
  saveStores(stores);
  return newStore;
};

export const getStoreById = (id) => {
  const stores = loadStores();
  return stores.find(store => store.id === id);
};

// Enhanced Sales Management with Store and Profit Tracking
export const saveSales = (sales) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
};

export const loadSales = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addSale = (sale) => {
  const sales = loadSales();
  const settings = loadSettings();

  // Get product info for profit calculation
  const inventory = loadInventory();
  const product = inventory.find(item =>
    item.name.toLowerCase() === sale.productName.toLowerCase() ||
    (item.barcode && item.barcode === sale.barcode)
  );

  const unitCost = product?.costPrice || 0;
  const unitPrice = sale.price || 0;
  const quantity = sale.quantity || 1;
  const totalCost = unitCost * quantity;
  const totalPrice = unitPrice * quantity;
  const profit = totalPrice - totalCost;
  const profitMargin = totalPrice > 0 ? ((profit / totalPrice) * 100) : 0;

  const newSale = {
    ...sale,
    id: Date.now().toString(),
    storeId: sale.storeId || settings.currentStore || 'main',
    quantity: quantity,
    unitPrice: unitPrice,
    unitCost: unitCost,
    totalPrice: totalPrice,
    totalCost: totalCost,
    profit: profit,
    profitMargin: profitMargin,
    timestamp: new Date().toISOString()
  };

  // Update inventory if product exists
  if (sale.productName) {
    updateInventoryStock(sale.productName, -quantity, sale.storeId);
  }

  sales.push(newSale);
  saveSales(sales);
  return newSale;
};

export const deleteSale = (id) => {
  const sales = loadSales();
  const saleToDelete = sales.find(sale => sale.id === id);

  // Restore inventory if sale is deleted
  if (saleToDelete && saleToDelete.productName) {
    updateInventoryStock(saleToDelete.productName, saleToDelete.quantity, saleToDelete.storeId);
  }

  const filtered = sales.filter(sale => sale.id !== id);
  saveSales(filtered);
};

export const getSalesByStore = (storeId) => {
  const sales = loadSales();
  return sales.filter(sale => sale.storeId === storeId);
};

export const getSalesByDate = (date, storeId = null) => {
  const sales = loadSales();
  return sales.filter(sale => {
    const dateMatch = sale.date === date;
    const storeMatch = !storeId || sale.storeId === storeId;
    return dateMatch && storeMatch;
  });
};

export const getSalesByCategory = (category, storeId = null) => {
  const sales = loadSales();
  return sales.filter(sale => {
    const categoryMatch = sale.category === category;
    const storeMatch = !storeId || sale.storeId === storeId;
    return categoryMatch && storeMatch;
  });
};

export const getDailyTotal = (date, storeId = null) => {
  const dailySales = getSalesByDate(date, storeId);
  return dailySales.reduce((total, sale) => total + sale.totalPrice, 0);
};

export const getDailyProfit = (date, storeId = null) => {
  const dailySales = getSalesByDate(date, storeId);
  return dailySales.reduce((total, sale) => total + (sale.profit || 0), 0);
};

export const getCategoryTotal = (category, storeId = null) => {
  const categorySales = getSalesByCategory(category, storeId);
  return categorySales.reduce((total, sale) => total + sale.totalPrice, 0);
};

// Enhanced Customer Management
export const saveCustomers = (customers) => {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const loadCustomers = () => {
  const stored = localStorage.getItem(CUSTOMERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addCustomer = (customer) => {
  const customers = loadCustomers();
  const newCustomer = {
    ...customer,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    totalPurchases: 0,
    totalAmount: 0
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
};

export const updateCustomerStats = (customerId, amount) => {
  const customers = loadCustomers();
  const customerIndex = customers.findIndex(c => c.id === customerId);
  if (customerIndex !== -1) {
    customers[customerIndex].totalPurchases += 1;
    customers[customerIndex].totalAmount += amount;
    saveCustomers(customers);
  }
};

export const getCustomerById = (id) => {
  const customers = loadCustomers();
  return customers.find(customer => customer.id === id);
};

// Enhanced Inventory Management with Barcode and Multi-Store Support
export const saveInventory = (inventory) => {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
};

export const loadInventory = () => {
  const stored = localStorage.getItem(INVENTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addInventoryItem = (item) => {
  const inventory = loadInventory();
  const existingIndex = inventory.findIndex(i =>
    i.name.toLowerCase() === item.name.toLowerCase() ||
    (item.barcode && i.barcode === item.barcode)
  );

  if (existingIndex !== -1) {
    // Update existing item
    inventory[existingIndex].stock += item.stock || 0;
    inventory[existingIndex].lastUpdated = new Date().toISOString();
    if (item.barcode && !inventory[existingIndex].barcode) {
      inventory[existingIndex].barcode = item.barcode;
    }
  } else {
    // Add new item
    const newItem = {
      ...item,
      id: Date.now().toString(),
      stock: item.stock || 0,
      minStock: item.minStock || 5,
      costPrice: item.costPrice || 0,
      sellingPrice: item.sellingPrice || 0,
      barcode: item.barcode || '',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    inventory.push(newItem);
  }

  saveInventory(inventory);
  return inventory;
};

export const findProductByBarcode = (barcode) => {
  const inventory = loadInventory();
  return inventory.find(item => item.barcode === barcode);
};

export const updateInventoryStock = (productName, quantityChange, storeId = null) => {
  const inventory = loadInventory();
  const itemIndex = inventory.findIndex(i =>
    i.name.toLowerCase() === productName.toLowerCase()
  );

  if (itemIndex !== -1) {
    inventory[itemIndex].stock = Math.max(0, inventory[itemIndex].stock + quantityChange);
    inventory[itemIndex].lastUpdated = new Date().toISOString();
    saveInventory(inventory);
  } else if (quantityChange < 0) {
    // Create new inventory item with negative stock (indicating we need to add it)
    addInventoryItem({
      name: productName,
      category: 'Non catégorisé',
      stock: 0,
      minStock: 5,
      costPrice: 0,
      sellingPrice: 0
    });
  }
};

export const getLowStockItems = () => {
  const inventory = loadInventory();
  return inventory.filter(item => item.stock <= item.minStock);
};

export const getInventoryByCategory = (category) => {
  const inventory = loadInventory();
  return inventory.filter(item => item.category === category);
};

// Enhanced Reporting utilities with Profit Analysis
export const getMonthlyData = (year, month, storeId = null) => {
  const sales = loadSales();
  return sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const dateMatch = saleDate.getFullYear() === year && saleDate.getMonth() === month;
    const storeMatch = !storeId || sale.storeId === storeId;
    return dateMatch && storeMatch;
  });
};

export const getYearlyData = (year, storeId = null) => {
  const sales = loadSales();
  return sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const dateMatch = saleDate.getFullYear() === year;
    const storeMatch = !storeId || sale.storeId === storeId;
    return dateMatch && storeMatch;
  });
};

export const getProfitAnalysis = (startDate, endDate, storeId = null) => {
  const sales = loadSales();
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const dateInRange = saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    const storeMatch = !storeId || sale.storeId === storeId;
    return dateInRange && storeMatch;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalCost = filteredSales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    avgMargin,
    salesCount: filteredSales.length
  };
};

export const getStoreComparison = () => {
  const sales = loadSales();
  const stores = loadStores();

  return stores.map(store => {
    const storeSales = sales.filter(sale => sale.storeId === store.id);
    const revenue = storeSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const profit = storeSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    const transactions = storeSales.length;

    return {
      ...store,
      revenue,
      profit,
      transactions,
      avgTransaction: transactions > 0 ? revenue / transactions : 0
    };
  });
};

export const generateCSV = (data, type = 'sales') => {
  if (type === 'sales') {
    const headers = [
      'Date', 'Magasin', 'Jour', 'Produit', 'Code-barres', 'Catégorie',
      'Quantité', 'Prix Unitaire', 'Coût Unitaire', 'Prix Total',
      'Coût Total', 'Profit', 'Marge (%)', 'Client'
    ];
    const rows = data.map(sale => [
      sale.date,
      getStoreById(sale.storeId)?.name || 'N/A',
      sale.dayName,
      sale.productName,
      sale.barcode || 'N/A',
      sale.category,
      sale.quantity || 1,
      (sale.unitPrice || sale.price || 0).toFixed(2),
      (sale.unitCost || 0).toFixed(2),
      sale.totalPrice.toFixed(2),
      (sale.totalCost || 0).toFixed(2),
      (sale.profit || 0).toFixed(2),
      (sale.profitMargin || 0).toFixed(2),
      sale.customerName || 'N/A'
    ]);
    return [headers, ...rows];
  }

  if (type === 'inventory') {
    const headers = [
      'Produit', 'Code-barres', 'Catégorie', 'Stock', 'Stock Minimum',
      'Prix Achat', 'Prix Vente', 'Marge Unitaire', 'Statut'
    ];
    const rows = data.map(item => {
      const margin = item.sellingPrice && item.costPrice
        ? (((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100).toFixed(2)
        : '0.00';
      return [
        item.name,
        item.barcode || 'N/A',
        item.category,
        item.stock,
        item.minStock,
        (item.costPrice || 0).toFixed(2),
        (item.sellingPrice || 0).toFixed(2),
        margin,
        item.stock <= item.minStock ? 'Stock Faible' : 'OK'
      ];
    });
    return [headers, ...rows];
  }

  if (type === 'customers') {
    const headers = ['Nom', 'Téléphone', 'Email', 'Adresse', 'Total Achats', 'Montant Total (MAD)', 'Dernière Visite', 'Notes'];
    const rows = data.map(customer => [
      customer.name,
      customer.phone || '',
      customer.email || '',
      customer.address || '',
      customer.totalPurchases,
      customer.totalAmount.toFixed(2),
      customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('fr-FR') : 'Jamais',
      customer.notes || ''
    ]);
    return [headers, ...rows];
  }

  if (type === 'stores') {
    const headers = ['Magasin', 'Adresse', 'Téléphone', 'Chiffre d\'Affaires', 'Profit', 'Transactions', 'Panier Moyen'];
    const rows = data.map(store => [
      store.name,
      store.address || '',
      store.phone || '',
      (store.revenue || 0).toFixed(2),
      (store.profit || 0).toFixed(2),
      store.transactions || 0,
      (store.avgTransaction || 0).toFixed(2)
    ]);
    return [headers, ...rows];
  }

  return [];
};
