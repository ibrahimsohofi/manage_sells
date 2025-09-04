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

import { loadSales, addSale, deleteSale, getLowStockItems } from './utils/storage';
import { populateSampleData, clearAllData } from './utils/sampleData';

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
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [lowStockAlert, setLowStockAlert] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Advanced theme system
  const [themeSettings, setThemeSettings] = useState(() => {
    const saved = localStorage.getItem('themeSettings');
    return saved ? JSON.parse(saved) : {
      mode: 'dark', // light, dark, auto
      colorScheme: 'purple',
      animations: true,
      highContrast: false,
      reducedMotion: false
    };
  });

  const [showSettings, setShowSettings] = useState(false);

  // Demo sequence steps
  const demoSteps = [
    { tab: 'sales', title: 'Tableau de Bord - Ventes' },
    { tab: 'reports', title: 'Rapports et Analyses' },
    { tab: 'inventory', title: 'Gestion du Stock' }
  ];

  // Apply theme and color scheme
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;

      // Apply dark/light mode
      if (isDarkMode()) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Apply high contrast
      if (themeSettings.highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }

      // Apply reduced motion
      if (themeSettings.reducedMotion) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }

      // Apply color scheme CSS variables
      const scheme = COLOR_SCHEMES[themeSettings.colorScheme];
      root.style.setProperty('--primary', scheme.colors.primary);
      root.style.setProperty('--primary-dark', scheme.colors.primaryDark);
      root.style.setProperty('--accent', scheme.colors.accent);
      root.style.setProperty('--accent-dark', scheme.colors.accentDark);

      // Set data attribute for CSS targeting
      root.setAttribute('data-color-scheme', themeSettings.colorScheme);
      root.setAttribute('data-animations', themeSettings.animations);
    };

    applyTheme();
    localStorage.setItem('themeSettings', JSON.stringify(themeSettings));

    // Listen for system theme changes when in auto mode
    if (themeSettings.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, [themeSettings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Shift + T: Toggle theme mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        cycleThemeMode();
      }

      // Ctrl/Cmd + Shift + C: Cycle color scheme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        cycleColorScheme();
      }

      // Ctrl/Cmd + Shift + S: Open settings
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setShowSettings(true);
      }

      // Escape: Close settings
      if (e.key === 'Escape' && showSettings) {
        setShowSettings(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showSettings]);

  useEffect(() => {
    // Load sales from localStorage on component mount
    const savedSales = loadSales();
    setSales(savedSales);

    // Check for low stock items
    const lowStock = getLowStockItems();
    setLowStockAlert(lowStock);

    setLoading(false);
  }, [activeTab]);

  // Separate effect for initial data population - only runs once
  useEffect(() => {
    const hasData = localStorage.getItem('droguerie_jamal_sales');
    if (!hasData) {
      populateSampleData();
      // Refresh data after population
      setTimeout(() => {
        const newSales = loadSales();
        setSales(newSales);
        const lowStock = getLowStockItems();
        setLowStockAlert(lowStock);
      }, 100);
    }
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    if (demoMode && demoStep < demoSteps.length) {
      const timer = setTimeout(() => {
        setActiveTab(demoSteps[demoStep].tab);
        setDemoStep(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (demoMode && demoStep >= demoSteps.length) {
      setDemoMode(false);
      setDemoStep(0);
      setActiveTab('sales');
    }
  }, [demoMode, demoStep]);

  const startDemo = () => {
    setDemoMode(true);
    setDemoStep(0);
    setActiveTab('sales');
  };

  const cycleThemeMode = () => {
    const modes = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(themeSettings.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    updateThemeSettings({ mode: modes[nextIndex] });
  };

  const cycleColorScheme = () => {
    const schemes = Object.keys(COLOR_SCHEMES);
    const currentIndex = schemes.indexOf(themeSettings.colorScheme);
    const nextIndex = (currentIndex + 1) % schemes.length;
    updateThemeSettings({ colorScheme: schemes[nextIndex] });
  };

  const updateThemeSettings = (updates) => {
    setThemeSettings(prev => ({ ...prev, ...updates }));
  };

  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const isDarkMode = () => {
    if (themeSettings.mode === 'auto') {
      return getSystemTheme() === 'dark';
    }
    return themeSettings.mode === 'dark';
  };

  const getThemeIcon = () => {
    if (themeSettings.mode === 'auto') {
      return isDarkMode() ? Moon : Sun;
    }
    return themeSettings.mode === 'dark' ? Sun : Moon;
  };

  const getThemeLabel = () => {
    switch (themeSettings.mode) {
      case 'light': return 'Clair';
      case 'dark': return 'Sombre';
      case 'auto': return `Auto ${isDarkMode() ? '🌙' : '☀️'}`;
      default: return 'Auto';
    }
  };

  const getCurrentScheme = () => COLOR_SCHEMES[themeSettings.colorScheme];

  const handleAddSale = (saleData) => {
    const newSale = addSale(saleData);
    setSales(prevSales => [...prevSales, newSale]);

    // Update low stock alert
    const lowStock = getLowStockItems();
    setLowStockAlert(lowStock);

    return newSale;
  };

  const handleDeleteSale = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      deleteSale(id);
      setSales(prevSales => prevSales.filter(sale => sale.id !== id));

      // Update low stock alert
      const lowStock = getLowStockItems();
      setLowStockAlert(lowStock);
    }
  };

  const tabs = [
    { id: 'sales', name: 'Ventes', icon: DollarSign },
    { id: 'reports', name: 'Rapports', icon: BarChart3 },
    { id: 'inventory', name: 'Stock', icon: Package }
  ];

  // CSV Export Test Function
  const testCSVExport = () => {
    const csvData = [
      ['Date', 'Jour', 'Produit', 'Catégorie', 'Quantité', 'Prix', 'Total'],
      ['01/09/2024', 'Dimanche', 'Marteau 500g', 'Outils', '2', '25.00', '50.00'],
      ['02/09/2024', 'Lundi', 'Peinture Blanche 5L', 'Peinture', '1', '120.00', '120.00'],
      ['03/09/2024', 'Mardi', 'Vis 4x50mm (Boîte 100)', 'Quincaillerie', '3', '15.00', '45.00']
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'quincaillerie_jamal_ventes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('✅ Export CSV réussi! Fichier téléchargé: quincaillerie_jamal_ventes.csv');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" style={{borderBottomColor: 'var(--primary)'}}></div>
          <p className="text-slate-600 dark:text-slate-300">Chargement du système...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-blue-600" style={{color: 'var(--primary)'}} />
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Paramètres de Thème</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Theme Mode */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Mode de Thème
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'auto'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateThemeSettings({ mode })}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        themeSettings.mode === mode
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                      style={{
                        borderColor: themeSettings.mode === mode ? 'var(--primary)' : undefined,
                        backgroundColor: themeSettings.mode === mode ? (isDarkMode() ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)') : undefined
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {mode === 'light' && <Sun className="h-5 w-5" />}
                        {mode === 'dark' && <Moon className="h-5 w-5" />}
                        {mode === 'auto' && <Monitor className="h-5 w-5" />}
                        <span className="text-sm font-medium capitalize">
                          {mode === 'light' ? 'Clair' : mode === 'dark' ? 'Sombre' : 'Auto'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Schemes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Palette de Couleurs
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                    <button
                      key={key}
                      onClick={() => updateThemeSettings({ colorScheme: key })}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        themeSettings.colorScheme === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                      style={{
                        borderColor: themeSettings.colorScheme === key ? scheme.colors.primary : undefined,
                        backgroundColor: themeSettings.colorScheme === key ? (isDarkMode() ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.5)') : undefined
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full" style={{backgroundColor: scheme.colors.primary}}></div>
                          <div className="w-4 h-4 rounded-full" style={{backgroundColor: scheme.colors.accent}}></div>
                        </div>
                        <span className="text-sm font-medium">{scheme.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility Options */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Accessibilité
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeSettings.highContrast}
                      onChange={(e) => updateThemeSettings({ highContrast: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                      style={{accentColor: 'var(--primary)'}}
                    />
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">Contraste Élevé</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Améliore la lisibilité avec des contrastes plus marqués</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeSettings.reducedMotion}
                      onChange={(e) => updateThemeSettings({ reducedMotion: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                      style={{accentColor: 'var(--primary)'}}
                    />
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">Mouvement Réduit</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Réduit les animations pour une expérience plus confortable</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeSettings.animations}
                      onChange={(e) => updateThemeSettings({ animations: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                      style={{accentColor: 'var(--primary)'}}
                    />
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">Animations Améliorées</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Active les micro-interactions et animations fluides</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Raccourcis Clavier
                </label>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Changer le mode de thème</span>
                    <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-xs">Ctrl+Shift+T</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Changer la palette</span>
                    <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-xs">Ctrl+Shift+C</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ouvrir les paramètres</span>
                    <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-xs">Ctrl+Shift+S</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fermer les paramètres</span>
                    <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-xs">Échap</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-lg border-b border-slate-200 dark:border-slate-700 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 transition-all duration-300 hover:scale-110" style={{color: 'var(--primary)'}} />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  Quincaillerie Jamal
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Système de Gestion des Ventes - Quincaillerie & Construction
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                   style={{backgroundColor: isDarkMode() ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', borderColor: 'var(--primary)'}}>
                <div className="text-sm text-slate-500 dark:text-slate-400">Total Ventes</div>
                <div className="text-xl font-bold transition-colors duration-300" style={{color: 'var(--primary)'}}>
                  {sales.reduce((sum, sale) => sum + sale.totalPrice, 0).toFixed(2)} MAD
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="text-sm text-slate-500 dark:text-slate-400">Transactions</div>
                <div className="text-xl font-bold text-slate-700 dark:text-slate-200">{sales.length}</div>
              </div>
              <div className="bg-violet-50 dark:bg-violet-900/30 p-3 rounded-xl border border-violet-100 dark:border-violet-800 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                   style={{backgroundColor: isDarkMode() ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)', borderColor: 'var(--accent)'}}>
                <div className="text-sm text-slate-500 dark:text-slate-400">Articles Vendus</div>
                <div className="text-xl font-bold transition-colors duration-300" style={{color: 'var(--accent)'}}>
                  {sales.reduce((sum, sale) => sum + (sale.quantity || 1), 0)}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-xl border border-orange-100 dark:border-orange-800 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="text-sm text-slate-500 dark:text-slate-400">Stock Faible</div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{lowStockAlert.length}</div>
              </div>
            </div>
            {/* Enhanced Controls */}
            <div className="mt-4 lg:mt-0 flex gap-2 flex-wrap">
              <button
                onClick={cycleThemeMode}
                className="bg-slate-600 dark:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-300 flex items-center gap-2 shadow-sm min-w-[100px] hover:scale-105 hover:shadow-md"
                title={`Mode actuel: ${getThemeLabel()}. Cliquer pour changer. (Ctrl+Shift+T)`}
              >
                {React.createElement(getThemeIcon(), { className: "h-4 w-4 transition-transform duration-300" })}
                {getThemeLabel()}
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="bg-slate-600 dark:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-300 flex items-center gap-2 shadow-sm hover:scale-105 hover:shadow-md"
                title="Paramètres de thème (Ctrl+Shift+S)"
              >
                <Settings className="h-4 w-4 transition-transform duration-300 hover:rotate-90" />
                Thèmes
              </button>

              <button
                onClick={startDemo}
                className="text-white px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 shadow-sm hover:scale-105 hover:shadow-md"
                style={{backgroundColor: 'var(--primary)'}}
                disabled={demoMode}
              >
                <Play className="h-4 w-4" />
                Démo Auto
              </button>
              <button
                onClick={testCSVExport}
                className="bg-emerald-600 dark:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all duration-300 flex items-center gap-2 shadow-sm hover:scale-105 hover:shadow-md"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Test CSV
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="text-white px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 shadow-sm hover:scale-105 hover:shadow-md"
                style={{backgroundColor: 'var(--accent)'}}
              >
                <BarChart3 className="h-4 w-4" />
                Rapports
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className="bg-slate-600 dark:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-300 flex items-center gap-2 shadow-sm hover:scale-105 hover:shadow-md"
              >
                <Package className="h-4 w-4" />
                Stock
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
                    clearAllData();
                    window.location.reload();
                  }
                }}
                className="bg-red-600 dark:bg-red-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300 flex items-center gap-2 shadow-sm hover:scale-105 hover:shadow-md"
              >
                <Trash2 className="h-4 w-4" />
                Vider
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Low Stock Alert */}
      {lowStockAlert.length > 0 && activeTab !== 'inventory' && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 mx-4 mt-4 rounded-xl shadow-sm alert-enter hover:shadow-md transition-all duration-300">
          <div className="flex">
            <div className="py-1">
              <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400 mr-4 scheme-animation" />
            </div>
            <div>
              <p className="font-bold">Alerte Stock Faible!</p>
              <p className="text-sm">
                {lowStockAlert.length} article{lowStockAlert.length > 1 ? 's' : ''} en stock faible.
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="underline ml-1 hover:text-red-800 dark:hover:text-red-200 transition-all duration-300 hover:scale-105"
                >
                  Voir l'inventaire
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Demo Progress Indicator */}
      {demoMode && (
        <div className="bg-violet-50 dark:bg-violet-900/30 border-l-4 border-violet-500 dark:border-violet-400 text-violet-700 dark:text-violet-300 p-4 mx-4 rounded-r-xl shadow-sm hover:shadow-md transition-all duration-500 alert-enter"
             style={{backgroundColor: isDarkMode() ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)', borderLeftColor: 'var(--accent)'}}>
          <div className="flex items-center">
            <div className="loading-pulse">
              <Play className="h-5 w-5 scheme-animation" style={{color: 'var(--accent)'}} />
            </div>
            <div className="ml-3">
              <p className="font-bold">Mode Démonstration Active</p>
              <p className="text-sm">
                Étape {demoStep + 1}/{demoSteps.length}: {demoSteps[demoStep]?.title || 'En cours...'}
              </p>
              <div className="progress-bar mt-2" style={{width: `${((demoStep + 1) / demoSteps.length) * 100}%`}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 tab-indicator active'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 tab-indicator'
                  } whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm transition-all duration-300 ${
                    demoMode ? 'loading-pulse' : ''
                  } flex items-center gap-2 rounded-t-lg hover:scale-105 card-hover`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    backgroundColor: activeTab === tab.id ? (isDarkMode() ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)') : undefined,
                    color: activeTab === tab.id ? 'var(--primary)' : undefined
                  }}
                >
                  <Icon className="h-4 w-4 scheme-animation transition-transform duration-300 hover:rotate-12" />
                  {tab.name}
                  {demoMode && activeTab === tab.id && (
                    <span className="ml-2 inline-block w-2 h-2 rounded-full loading-pulse" style={{backgroundColor: 'var(--accent)'}}></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'sales' && (
          <>
            {/* Sales Form */}
            <SalesForm onAddSale={handleAddSale} />

            {/* Sales Statistics */}
            <SalesStats sales={sales} />

            {/* Sales List */}
            <SalesList sales={sales} onDeleteSale={handleDeleteSale} />
          </>
        )}

        {activeTab === 'reports' && (
          <Reports sales={sales} />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12 shadow-lg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-slate-500 dark:text-slate-400">
            <p>&copy; 2024 Quincaillerie Jamal - Système de Gestion des Ventes</p>
            <p className="text-sm mt-1">
              Version Professionnelle - Quincaillerie & Construction
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
