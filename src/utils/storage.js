// Enhanced localStorage utilities for day-based business management
const STORAGE_KEY = 'droguerie_jamal_daily_sales';
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

// NEW DAY-BASED SALES MANAGEMENT
export const saveDailySales = (dailySales) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dailySales));
};

export const loadDailySales = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Convert day-based sales to individual sales for compatibility with existing reports
export const loadSales = () => {
  const dailySales = loadDailySales();
  const individualSales = [];

  dailySales.forEach(day => {
    day.items.forEach((item, index) => {
      individualSales.push({
        id: `${day.day_id}-${index}`,
        date: day.day_id,
        dayName: day.day_name,
        productName: item.name,
        category: item.category || 'Non catégorisé',
        quantity: item.quantity || 1,
        price: item.unit_price || item.price,
        unitPrice: item.unit_price || item.price,
        totalPrice: item.total || (item.price * (item.quantity || 1)),
        storeId: day.storeId || 'main',
        timestamp: day.timestamp || new Date(day.day_id).toISOString()
      });
    });
  });

  return individualSales;
};

// Add item to a specific day
export const addItemToDay = (dayId, item) => {
  const dailySales = loadDailySales();
  const settings = loadSettings();

  // Find existing day or create new one
  let dayIndex = dailySales.findIndex(day => day.day_id === dayId);

  if (dayIndex === -1) {
    // Create new day entry
    const newDay = {
      day_id: dayId,
      day_name: new Date(dayId).toLocaleDateString('fr-FR', { weekday: 'long' }),
      items: [],
      total_prices: 0,
      storeId: settings.currentStore || 'main',
      timestamp: new Date().toISOString()
    };
    dailySales.push(newDay);
    dayIndex = dailySales.length - 1;
  }

  // Add item to the day
  const newItem = {
    name: item.productName || item.name,
    category: item.category || 'Non catégorisé',
    unit_price: item.price || 0,
    quantity: item.quantity || 1,
    total: (item.price || 0) * (item.quantity || 1)
  };

  dailySales[dayIndex].items.push(newItem);

  // Update total_prices for the day
  dailySales[dayIndex].total_prices = dailySales[dayIndex].items.reduce(
    (sum, item) => sum + item.total, 0
  );

  saveDailySales(dailySales);
  return newItem;
};

// Add sale using new day-based structure
export const addSale = (sale) => {
  const inventory = loadInventory();
  const product = inventory.find(item =>
    item.name.toLowerCase() === sale.productName.toLowerCase() ||
    (item.barcode && item.barcode === sale.barcode)
  );

  const quantity = sale.quantity || 1;

  // Update inventory if product exists
  if (sale.productName) {
    updateInventoryStock(sale.productName, -quantity, sale.storeId);
  }

  const newItem = addItemToDay(sale.date, {
    productName: sale.productName,
    category: sale.category,
    price: sale.price,
    quantity: quantity
  });

  return {
    id: `${sale.date}-${Date.now()}`,
    date: sale.date,
    dayName: sale.dayName,
    productName: sale.productName,
    category: sale.category,
    quantity: quantity,
    price: sale.price,
    totalPrice: newItem.total,
    timestamp: new Date().toISOString()
  };
};

// Delete item from a specific day
export const deleteItemFromDay = (dayId, itemIndex) => {
  const dailySales = loadDailySales();
  const dayIndex = dailySales.findIndex(day => day.day_id === dayId);

  if (dayIndex !== -1 && dailySales[dayIndex].items[itemIndex]) {
    const deletedItem = dailySales[dayIndex].items[itemIndex];

    // Restore inventory
    updateInventoryStock(deletedItem.name, deletedItem.quantity);

    // Remove item
    dailySales[dayIndex].items.splice(itemIndex, 1);

    // Update total_prices
    dailySales[dayIndex].total_prices = dailySales[dayIndex].items.reduce(
      (sum, item) => sum + item.total, 0
    );

    // Remove day if no items left
    if (dailySales[dayIndex].items.length === 0) {
      dailySales.splice(dayIndex, 1);
    }

    saveDailySales(dailySales);
  }
};

export const deleteSale = (id) => {
  // Parse the day-based ID format: dayId-timestamp
  const [dayId, timestamp] = id.split('-');
  if (dayId && timestamp) {
    const dailySales = loadDailySales();
    const dayIndex = dailySales.findIndex(day => day.day_id === dayId);

    if (dayIndex !== -1) {
      // Find the specific item (this is simplified - in practice you'd need better ID management)
      const items = dailySales[dayIndex].items;
      if (items.length > 0) {
        deleteItemFromDay(dayId, items.length - 1); // Remove last item as approximation
      }
    }
  }
};

// Get sales data by day
export const getSalesByDate = (date, storeId = null) => {
  const dailySales = loadDailySales();
  const dayData = dailySales.find(day => day.day_id === date);

  if (!dayData || (storeId && dayData.storeId !== storeId)) {
    return [];
  }

  return dayData.items.map((item, index) => ({
    id: `${date}-${index}`,
    date: date,
    dayName: dayData.day_name,
    productName: item.name,
    category: item.category,
    quantity: item.quantity,
    price: item.unit_price,
    totalPrice: item.total
  }));
};

export const getDailyTotal = (date, storeId = null) => {
  const dailySales = loadDailySales();
  const dayData = dailySales.find(day => day.day_id === date);

  if (!dayData || (storeId && dayData.storeId !== storeId)) {
    return 0;
  }

  return dayData.total_prices;
};

// Get all days with sales data
export const getAllSalesDays = () => {
  const dailySales = loadDailySales();
  return dailySales.map(day => ({
    day_id: day.day_id,
    day_name: day.day_name,
    items_count: day.items.length,
    total_prices: day.total_prices
  }));
};

// Additional compatibility functions for existing components
export const getSalesByStore = (storeId) => {
  const sales = loadSales();
  return sales.filter(sale => sale.storeId === storeId);
};

export const getSalesByCategory = (category, storeId = null) => {
  const sales = loadSales();
  return sales.filter(sale => {
    const categoryMatch = sale.category === category;
    const storeMatch = !storeId || sale.storeId === storeId;
    return categoryMatch && storeMatch;
  });
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
