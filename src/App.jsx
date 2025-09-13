import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  BarChart3,
  Package,
  TrendingUp,
  Download,
  RotateCcw,
  AlertTriangle,
  Play,
  FileSpreadsheet,
  Trash2,
  Building2,
  Moon,
  Sun,
  Settings,
  Palette,
  X,
  Monitor,
  Eye,
  Keyboard,
  Zap
} from 'lucide-react';
import SalesForm from './components/SalesForm';
import SalesList from './components/SalesList';
import SalesStats from './components/SalesStats';
import Reports from './components/Reports';
import InventoryManager from './components/InventoryManager';
import StoreManager from './components/StoreManager';
import SettingsManager from './components/SettingsManager';
import LocalStorageInspector from './components/LocalStorageInspector';

// Use centralized API service instead of direct calls
import {
  loadSales,
  addSale,
  deleteSale,
  getLowStockItems,
  loadSettings,
  updateSettings,
  loadStores
} from './utils/storage-api';
import { populateSampleData, clearAllData } from './utils/sampleData';
import api from './utils/api';

// Color scheme definitions
const COLOR_SCHEMES = {
  blue: {
    name: 'Bleu Océan',
    primary: 'blue',
    accent: 'cyan',
    colors: {
      primary: 'rgb(59 130 246)', // blue-500
      primaryDark: 'rgb(30 64 175)', // blue-800
      accent: 'rgb(6 182 212)', // cyan-500
      accentDark: 'rgb(14 116 144)' // cyan-700
    }
  },
  green: {
    name: 'Vert Nature',
    primary: 'emerald',
    accent: 'teal',
    colors: {
      primary: 'rgb(16 185 129)', // emerald-500
      primaryDark: 'rgb(6 95 70)', // emerald-800
      accent: 'rgb(20 184 166)', // teal-500
      accentDark: 'rgb(15 118 110)' // teal-700
    }
  },
  purple: {
    name: 'Violet Royal',
    primary: 'violet',
    accent: 'purple',
    colors: {
      primary: 'rgb(139 92 246)', // violet-500
      primaryDark: 'rgb(91 33 182)', // violet-800
      accent: 'rgb(168 85 247)', // purple-500
      accentDark: 'rgb(107 33 168)' // purple-800
    }
  },
  orange: {
    name: 'Orange Énergie',
    primary: 'orange',
    accent: 'amber',
    colors: {
      primary: 'rgb(249 115 22)', // orange-500
      primaryDark: 'rgb(154 52 18)', // orange-800
      accent: 'rgb(245 158 11)', // amber-500
      accentDark: 'rgb(180 83 9)' // amber-700
    }
  },
  red: {
    name: 'Rouge Passion',
    primary: 'red',
    accent: 'rose',
    colors: {
      primary: 'rgb(239 68 68)', // red-500
      primaryDark: 'rgb(153 27 27)', // red-800
      accent: 'rgb(244 63 94)', // rose-500
      accentDark: 'rgb(159 18 57)' // rose-800
    }
  }
};

function App() {
  const [activeView, setActiveView] = useState('sales');
  const [sales, setSales] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    itemsSold: 0,
    transactions: 0,
    lowStock: 0
  });
  const [settings, setSettings] = useState({
    theme: 'light',
    colorScheme: 'blue',
    currentStore: 'main',
    enableDemo: false
  });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data using centralized API
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load all data using storage-api functions
      const [salesData, lowStockData, settingsData, storesData] = await Promise.all([
        loadSales(),
        getLowStockItems(),
        loadSettings(),
        loadStores()
      ]);

      setSales(salesData);
      setLowStockItems(lowStockData);
      setSettings(prevSettings => ({ ...prevSettings, ...settingsData }));
      setStores(storesData);

      // Calculate stats from loaded data
      updateStats(salesData, lowStockData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Show MySQL connection error to user
      alert(`Erreur de connexion MySQL: ${error.message}\n\nVeuillez vérifier que:\n- MySQL est démarré\n- Les paramètres de connexion sont corrects\n- La base de données 'quincaillerie_jamal' existe`);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (salesData, lowStockData) => {
    const totalSales = salesData.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const itemsSold = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
    const transactions = salesData.length;
    const lowStock = lowStockData.length;

    setStats({
      totalSales,
      itemsSold,
      transactions,
      lowStock
    });
  };

  const handleAddSale = async (saleData) => {
    try {
      const newSale = await addSale(saleData);
      setSales(prev => [...prev, newSale]);

      // Refresh low stock items and stats
      const updatedLowStock = await getLowStockItems();
      setLowStockItems(updatedLowStock);
      updateStats([...sales, newSale], updatedLowStock);
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  };

  const handleDeleteSale = async (saleId) => {
    try {
      await deleteSale(saleId);
      const updatedSales = sales.filter(sale => sale.id !== saleId);
      setSales(updatedSales);

      // Refresh stats
      const updatedLowStock = await getLowStockItems();
      setLowStockItems(updatedLowStock);
      updateStats(updatedSales, updatedLowStock);
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  };

  const handleSettingsUpdate = async (newSettings) => {
    try {
      await updateSettings(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleSampleData = () => {
    populateSampleData();
    loadInitialData();
  };

  const handleClearData = () => {
    clearAllData();
    loadInitialData();
  };

  // Get current color scheme
  const currentScheme = COLOR_SCHEMES[settings.colorScheme] || COLOR_SCHEMES.blue;

  // Apply theme classes
  const themeClasses = settings.theme === 'dark' ? 'dark' : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${themeClasses}`}>
      <style>{`
        :root {
          --primary: ${currentScheme.primary};
          --primary-50: ${currentScheme.light};
          --primary-600: ${currentScheme.main};
          --primary-700: ${currentScheme.dark};
          --accent: ${settings.theme === 'dark' ? currentScheme.accentDark : currentScheme.accent};
        }
      `}</style>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Quincaillerie Jamal
              </h1>
            </div>

            <nav className="flex space-x-4">
              {[
                { id: 'sales', label: 'Ventes', icon: DollarSign },
                { id: 'inventory', label: 'Inventaire', icon: Package },
                { id: 'reports', label: 'Rapports', icon: BarChart3 },
                { id: 'stores', label: 'Magasins', icon: Building2 },
                { id: 'settings', label: 'Paramètres', icon: Settings }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveView(id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ventes Totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalSales.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Articles Vendus</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.itemsSold}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.transactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Faible</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStock}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Views */}
        {activeView === 'sales' && (
          <div className="space-y-8">
            <SalesForm onAddSale={handleAddSale} />
            <SalesList sales={sales} onDeleteSale={handleDeleteSale} />
          </div>
        )}

        {activeView === 'inventory' && (
          <InventoryManager />
        )}

        {activeView === 'reports' && (
          <Reports sales={sales} />
        )}

        {activeView === 'stores' && (
          <StoreManager />
        )}

        {activeView === 'settings' && (
          <SettingsManager
            settings={settings}
            onSettingsUpdate={handleSettingsUpdate}
            onSampleData={handleSampleData}
            onClearData={handleClearData}
          />
        )}
      </main>

      {/* Demo data buttons */}
      {settings.enableDemo && (
        <div className="fixed bottom-4 right-4 flex space-x-2">
          <button
            onClick={handleSampleData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Données d'exemple
          </button>
          <button
            onClick={handleClearData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Effacer
          </button>
        </div>
      )}

      {/* Debug inspector */}
      {import.meta.env.DEV && (
        <LocalStorageInspector />
      )}
    </div>
  );
}

export default App;
