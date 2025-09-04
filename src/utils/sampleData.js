// Sample data generator for Quincaillerie Jamal Sales Management System
import {
  saveInventory,
  saveCustomers,
  saveSales,
  saveStores,
  saveSettings
} from './storage.js';

// Sample inventory data - hardware store products
const sampleInventory = [
  {
    id: '1',
    name: 'Marteau 500g',
    category: 'Outils',
    stock: 50,
    minStock: 10,
    costPrice: 15.00,
    sellingPrice: 25.00,
    barcode: '3401320234567',
    createdAt: '2024-01-15T10:00:00.000Z',
    lastUpdated: '2024-09-01T14:30:00.000Z'
  },
  {
    id: '2',
    name: 'Tournevis Phillips Set',
    category: 'Outils',
    stock: 8,
    minStock: 15,
    costPrice: 12.00,
    sellingPrice: 22.00,
    barcode: '3401320234568',
    createdAt: '2024-01-20T09:00:00.000Z',
    lastUpdated: '2024-09-03T11:15:00.000Z'
  },
  {
    id: '3',
    name: 'Peinture Blanche 5L',
    category: 'Peinture',
    stock: 75,
    minStock: 10,
    costPrice: 80.00,
    sellingPrice: 120.00,
    barcode: '3401320234569',
    createdAt: '2024-02-01T08:30:00.000Z',
    lastUpdated: '2024-09-02T16:45:00.000Z'
  },
  {
    id: '4',
    name: 'Tuyau PVC 32mm (2m)',
    category: 'Plomberie',
    stock: 45,
    minStock: 8,
    costPrice: 8.00,
    sellingPrice: 15.00,
    barcode: '3401320234570',
    createdAt: '2024-02-10T10:15:00.000Z',
    lastUpdated: '2024-08-30T13:20:00.000Z'
  },
  {
    id: '5',
    name: 'Câble Électrique 2.5mm² (10m)',
    category: 'Électricité',
    stock: 30,
    minStock: 5,
    costPrice: 25.00,
    sellingPrice: 40.00,
    barcode: '3401320234571',
    createdAt: '2024-02-15T11:45:00.000Z',
    lastUpdated: '2024-09-01T09:30:00.000Z'
  },
  {
    id: '6',
    name: 'Niveau à Bulle 60cm',
    category: 'Outils',
    stock: 3,
    minStock: 5,
    costPrice: 30.00,
    sellingPrice: 50.00,
    barcode: '3401320234572',
    createdAt: '2024-03-01T14:20:00.000Z',
    lastUpdated: '2024-09-03T10:10:00.000Z'
  },
  {
    id: '7',
    name: 'Vis 4x50mm (Boîte 100)',
    category: 'Quincaillerie',
    stock: 120,
    minStock: 25,
    costPrice: 8.50,
    sellingPrice: 15.00,
    barcode: '3401320234573',
    createdAt: '2024-03-10T12:00:00.000Z',
    lastUpdated: '2024-09-02T15:40:00.000Z'
  },
  {
    id: '8',
    name: 'Détergent Multi-Usage 1L',
    category: 'Nettoyage',
    stock: 80,
    minStock: 15,
    costPrice: 6.00,
    sellingPrice: 12.00,
    barcode: '3401320234574',
    createdAt: '2024-03-15T09:30:00.000Z',
    lastUpdated: '2024-09-01T12:25:00.000Z'
  }
];

// Sample sales data
const sampleSales = [
  {
    id: '1',
    date: '2024-09-01',
    dayName: 'Dimanche',
    productName: 'Marteau 500g',
    category: 'Outils',
    quantity: 2,
    price: 25.00,
    unitPrice: 25.00,
    unitCost: 15.00,
    totalPrice: 50.00,
    totalCost: 30.00,
    profit: 20.00,
    profitMargin: 40.0,
    barcode: '3401320234567',
    storeId: 'main',
    timestamp: '2024-09-01T10:30:00.000Z'
  },
  {
    id: '2',
    date: '2024-09-01',
    dayName: 'Dimanche',
    productName: 'Peinture Blanche 5L',
    category: 'Peinture',
    quantity: 1,
    price: 120.00,
    unitPrice: 120.00,
    unitCost: 80.00,
    totalPrice: 120.00,
    totalCost: 80.00,
    profit: 40.00,
    profitMargin: 33.33,
    barcode: '3401320234569',
    storeId: 'main',
    timestamp: '2024-09-01T14:15:00.000Z'
  },
  {
    id: '3',
    date: '2024-09-02',
    dayName: 'Lundi',
    productName: 'Tuyau PVC 32mm (2m)',
    category: 'Plomberie',
    quantity: 3,
    price: 15.00,
    unitPrice: 15.00,
    unitCost: 8.00,
    totalPrice: 45.00,
    totalCost: 24.00,
    profit: 21.00,
    profitMargin: 46.67,
    barcode: '3401320234570',
    storeId: 'main',
    timestamp: '2024-09-02T09:45:00.000Z'
  },
  {
    id: '4',
    date: '2024-09-02',
    dayName: 'Lundi',
    productName: 'Vis 4x50mm (Boîte 100)',
    category: 'Quincaillerie',
    quantity: 2,
    price: 15.00,
    unitPrice: 15.00,
    unitCost: 8.50,
    totalPrice: 30.00,
    totalCost: 17.00,
    profit: 13.00,
    profitMargin: 43.33,
    barcode: '3401320234573',
    storeId: 'main',
    timestamp: '2024-09-02T16:30:00.000Z'
  },
  {
    id: '5',
    date: '2024-09-03',
    dayName: 'Mardi',
    productName: 'Détergent Multi-Usage 1L',
    category: 'Nettoyage',
    quantity: 4,
    price: 12.00,
    unitPrice: 12.00,
    unitCost: 6.00,
    totalPrice: 48.00,
    totalCost: 24.00,
    profit: 24.00,
    profitMargin: 50.00,
    barcode: '3401320234574',
    storeId: 'main',
    timestamp: '2024-09-03T11:15:00.000Z'
  },
  {
    id: '6',
    date: '2024-09-03',
    dayName: 'Mardi',
    productName: 'Câble Électrique 2.5mm² (10m)',
    category: 'Électricité',
    quantity: 1,
    price: 40.00,
    unitPrice: 40.00,
    unitCost: 25.00,
    totalPrice: 40.00,
    totalCost: 25.00,
    profit: 15.00,
    profitMargin: 37.50,
    barcode: '3401320234571',
    storeId: 'main',
    timestamp: '2024-09-03T15:20:00.000Z'
  }
];

// Sample stores data
const sampleStores = [
  {
    id: 'main',
    name: 'Quincaillerie Jamal - Principal',
    address: 'Avenue Hassan II, Casablanca, Maroc',
    phone: '0522-123456',
    isMain: true,
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 'branch1',
    name: 'Quincaillerie Jamal - Maarif',
    address: 'Boulevard Zerktouni, Maarif, Casablanca',
    phone: '0522-654321',
    isMain: false,
    createdAt: '2024-03-01T10:00:00.000Z'
  }
];

// Sample settings
const sampleSettings = {
  currentStore: 'main',
  defaultStore: 'main',
  enableBarcodeScanning: true,
  showProfitMargins: true
};

// Function to populate all sample data
export const populateSampleData = () => {
  try {
    saveInventory(sampleInventory);
    saveSales(sampleSales);
    saveStores(sampleStores);
    saveSettings(sampleSettings);

    console.log('✅ Sample data populated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    return false;
  }
};

// Function to clear all data
export const clearAllData = () => {
  try {
    localStorage.removeItem('droguerie_jamal_sales');
    localStorage.removeItem('droguerie_jamal_customers');
    localStorage.removeItem('droguerie_jamal_inventory');
    localStorage.removeItem('droguerie_jamal_stores');
    localStorage.removeItem('droguerie_jamal_settings');

    console.log('🗑️ All data cleared successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    return false;
  }
};

export default {
  populateSampleData,
  clearAllData,
  sampleInventory,
  sampleSales,
  sampleStores,
  sampleSettings
};
