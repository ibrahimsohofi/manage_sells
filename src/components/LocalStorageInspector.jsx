import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Code, Eye, Calendar, Package } from 'lucide-react';
import { loadDailySales, loadInventory, loadStores, loadSettings } from '../utils/storage';

const LocalStorageInspector = () => {
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState('daily_sales');

  const refreshData = () => {
    const dailySales = loadDailySales();
    const inventory = loadInventory();
    const stores = loadStores();
    const settings = loadSettings();

    setData({
      daily_sales: dailySales,
      inventory: inventory.slice(0, 3), // Show first 3 items
      stores: stores,
      settings: settings
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const tabs = [
    { id: 'daily_sales', name: 'Ventes Journalières', icon: Calendar, color: 'bg-blue-500' },
    { id: 'inventory', name: 'Inventaire', icon: Package, color: 'bg-green-500' },
    { id: 'stores', name: 'Magasins', icon: Database, color: 'bg-purple-500' },
    { id: 'settings', name: 'Paramètres', icon: Eye, color: 'bg-orange-500' }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-blue-600" style={{color: 'var(--primary)'}} />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            LocalStorage Inspector - Nouvelle Structure
          </h2>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* New Structure Explanation */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
          <Code className="h-5 w-5" />
          Structure: day_id + (item1_name + item1_price) + (item2_name + item2_price) + total_prices
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Les ventes sont maintenant groupées par jour avec des articles multiples et un total consolidé.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? `${tab.color} text-white shadow-md`
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Data Display */}
      <div className="space-y-4">
        {activeTab === 'daily_sales' && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
              📊 Structure Day-Based Sales (droguerie_jamal_daily_sales)
            </h3>
            {data.daily_sales?.length > 0 ? (
              <div className="space-y-4">
                {data.daily_sales.map((day, index) => (
                  <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-700 px-4 py-3 border-b border-slate-200 dark:border-slate-600">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                        🗓️ {day.day_id} ({day.day_name}) - Total: {day.total_prices} MAD
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {day.items?.length || 0} articles
                      </p>
                    </div>
                    <div className="p-4">
                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {formatJSON(day)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">Aucune donnée de vente journalière</p>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
              📦 Inventaire (Premier 3 articles)
            </h3>
            <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {formatJSON(data.inventory)}
            </pre>
          </div>
        )}

        {activeTab === 'stores' && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
              🏪 Magasins
            </h3>
            <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {formatJSON(data.stores)}
            </pre>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
              ⚙️ Paramètres
            </h3>
            <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {formatJSON(data.settings)}
            </pre>
          </div>
        )}
      </div>

      {/* Storage Keys Info */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
        <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-2">🔑 Clés localStorage utilisées:</h4>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li><code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">droguerie_jamal_daily_sales</code> - Ventes par jour (nouvelle structure)</li>
          <li><code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">droguerie_jamal_inventory</code> - Inventaire produits</li>
          <li><code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">droguerie_jamal_stores</code> - Informations magasins</li>
          <li><code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">droguerie_jamal_settings</code> - Paramètres application</li>
        </ul>
      </div>
    </div>
  );
};

export default LocalStorageInspector;
