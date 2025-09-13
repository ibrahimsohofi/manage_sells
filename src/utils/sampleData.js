// Sample data generator for Quincaillerie Jamal Sales Management System
import {
  saveInventory,
  saveCustomers,
  saveDailySales,
  saveStores,
  saveSettings
} from './storage-api.js';

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

// NEW DAY-BASED SAMPLE SALES DATA
const sampleDailySales = [
  {
    day_id: '2024-09-01',
    day_name: 'Dimanche',
    items: [
      {
        name: 'Marteau 500g',
        category: 'Outils',
        unit_price: 25.00,
        quantity: 2,
        total: 50.00
      },
      {
        name: 'Peinture Blanche 5L',
        category: 'Peinture',
        unit_price: 120.00,
        quantity: 1,
        total: 120.00
      }
    ],
    total_prices: 170.00,
    storeId: 'main',
    timestamp: '2024-09-01T10:30:00.000Z'
  },
  {
    day_id: '2024-09-02',
    day_name: 'Lundi',
    items: [
      {
        name: 'Tuyau PVC 32mm (2m)',
        category: 'Plomberie',
        unit_price: 15.00,
        quantity: 3,
        total: 45.00
      },
      {
        name: 'Vis 4x50mm (Boîte 100)',
        category: 'Quincaillerie',
        unit_price: 15.00,
        quantity: 2,
        total: 30.00
      }
    ],
    total_prices: 75.00,
    storeId: 'main',
    timestamp: '2024-09-02T09:45:00.000Z'
  },
  {
    day_id: '2024-09-03',
    day_name: 'Mardi',
    items: [
      {
        name: 'Détergent Multi-Usage 1L',
        category: 'Nettoyage',
        unit_price: 12.00,
        quantity: 4,
        total: 48.00
      },
      {
        name: 'Câble Électrique 2.5mm² (10m)',
        category: 'Électricité',
        unit_price: 40.00,
        quantity: 1,
        total: 40.00
      }
    ],
    total_prices: 88.00,
    storeId: 'main',
    timestamp: '2024-09-03T11:15:00.000Z'
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
  // Clear existing data first
  clearAllData();

  // Sample sales data
  const sampleSales = [
    {
      id: '2025-09-11-1',
      date: '2025-09-11',
      dayName: 'Jeudi',
      productName: 'Marteau 500g',
      category: 'Outils',
      quantity: 2,
      price: 45.00,
      totalPrice: 90.00,
      timestamp: new Date().toISOString()
    },
    {
      id: '2025-09-11-2',
      date: '2025-09-11',
      dayName: 'Jeudi',
      productName: 'Peinture Blanche 5L',
      category: 'Peinture',
      quantity: 1,
      price: 120.00,
      totalPrice: 120.00,
      timestamp: new Date().toISOString()
    },
    {
      id: '2025-09-10-1',
      date: '2025-09-10',
      dayName: 'Mercredi',
      productName: 'Vis 4x50mm (Boîte)',
      category: 'Quincaillerie',
      quantity: 3,
      price: 15.00,
      totalPrice: 45.00,
      timestamp: new Date().toISOString()
    },
    {
      id: '2025-09-10-2',
      date: '2025-09-10',
      dayName: 'Mercredi',
      productName: 'Tuyau PVC 50mm',
      category: 'Plomberie',
      quantity: 2,
      price: 25.50,
      totalPrice: 51.00,
      timestamp: new Date().toISOString()
    },
    {
      id: '2025-09-09-1',
      date: '2025-09-09',
      dayName: 'Mardi',
      productName: 'Ampoule LED 15W',
      category: 'Électricité',
      quantity: 5,
      price: 12.00,
      totalPrice: 60.00,
      timestamp: new Date().toISOString()
    }
  ];

  // Store sample data in localStorage
  localStorage.setItem('sales', JSON.stringify(sampleSales));

  // Add some inventory data too
  const sampleInventory = [
    {
      id: 'product-1',
      name: 'Marteau 500g',
      category: 'Outils',
      stock: 15,
      minStock: 5,
      costPrice: 35.00,
      sellingPrice: 45.00,
      barcode: '1234567890123',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'product-2',
      name: 'Peinture Blanche 5L',
      category: 'Peinture',
      stock: 8,
      minStock: 3,
      costPrice: 90.00,
      sellingPrice: 120.00,
      barcode: '1234567890124',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'product-3',
      name: 'Vis 4x50mm (Boîte)',
      category: 'Quincaillerie',
      stock: 25,
      minStock: 10,
      costPrice: 10.00,
      sellingPrice: 15.00,
      barcode: '1234567890125',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  ];

  localStorage.setItem('inventory', JSON.stringify(sampleInventory));

  console.log('Sample data populated successfully!');
  alert('Données d\'exemple ajoutées! Actualisez la page pour voir les changements.');
};

// Function to clear all data
export const clearAllData = () => {
  try {
    localStorage.removeItem('droguerie_jamal_daily_sales');
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
  sampleDailySales,
  sampleStores,
  sampleSettings
};
