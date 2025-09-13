import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  X,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  TrendingUp,
  BarChart3,
  Store,
  CheckCircle,
  AlertCircle,
  Users,
  Package,
  DollarSign,
  Calendar,
  Eye,
  Settings
} from 'lucide-react';
import api from '../utils/api';
import { getStoreComparison, getSalesByStore } from '../utils/storage-api';

const StoreManager = () => {
  const [stores, setStores] = useState([]);
  const [storeComparison, setStoreComparison] = useState([]);
  const [storeStats, setStoreStats] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [activeTab, setActiveTab] = useState('stores');
  const [loading, setLoading] = useState(true);
  const [selectedStores, setSelectedStores] = useState([]);
  const [comparisonPeriod, setComparisonPeriod] = useState('7');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    isMain: false
  });

  useEffect(() => {
    loadStoresData();
    if (activeTab === 'comparison') {
      loadStoreComparison();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'comparison') {
      loadStoreComparison();
    }
  }, [activeTab, comparisonPeriod]);

  const loadStoresData = async () => {
    try {
      const data = await api.getStores();
      setStores(data);

      // Load stats for each store
      const stats = {};
      for (const store of data) {
        try {
          const storeSales = await getSalesByStore(store.id);
          const totalSales = storeSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
          const totalTransactions = storeSales.length;
          const inventory = await api.getInventory(store.id);
          const totalProducts = inventory.length;

          stats[store.id] = {
            totalSales,
            totalTransactions,
            totalProducts,
            averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0
          };
        } catch (error) {
          console.error(`Error loading stats for store ${store.id}:`, error);
          stats[store.id] = {
            totalSales: 0,
            totalTransactions: 0,
            totalProducts: 0,
            averageTransaction: 0
          };
        }
      }
      setStoreStats(stats);
    } catch (error) {
      console.error('Error loading stores:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStoreComparison = async () => {
    try {
      const data = await getStoreComparison();
      setStoreComparison(data);
    } catch (error) {
      console.error('Error loading store comparison:', error);
      setStoreComparison([]);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Le nom du magasin est requis');
      return;
    }

    try {
      const storeData = {
        id: formData.name.toLowerCase().replace(/\s+/g, '_'),
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        description: formData.description,
        is_main: formData.isMain
      };

      await api.addStore(storeData);
      await loadStoresData();

      // Reset form
      setFormData({
        name: '',
        address: '',
        phone: '',
        description: '',
        isMain: false
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding store:', error);
      alert('Erreur lors de l\'ajout du magasin');
    }
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();

    try {
      await api.updateStore(editingStore.id, {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        description: formData.description,
        is_main: formData.isMain
      });

      await loadStoresData();
      setEditingStore(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error updating store:', error);
      alert('Erreur lors de la mise à jour du magasin');
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (storeId === 'main') {
      alert('Impossible de supprimer le magasin principal');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce magasin ?')) {
      return;
    }

    try {
      await api.deleteStore(storeId);
      await loadStoresData();
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Erreur lors de la suppression du magasin');
    }
  };

  const editStore = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address || '',
      phone: store.phone || '',
      description: store.description || '',
      isMain: store.is_main || false
    });
    setShowAddForm(true);
  };

  const toggleStoreSelection = (storeId) => {
    setSelectedStores(prev =>
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const getComparisonData = () => {
    if (selectedStores.length === 0) return [];

    return selectedStores.map(storeId => {
      const store = stores.find(s => s.id === storeId);
      const stats = storeStats[storeId] || {};
      const comparison = storeComparison.find(c => c.store_id === storeId) || {};

      return {
        id: storeId,
        name: store?.name || storeId,
        ...stats,
        ...comparison
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des magasins...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Gestion des Magasins
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {stores.length} magasin{stores.length > 1 ? 's' : ''} configuré{stores.length > 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter Magasin
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'stores', name: 'Magasins', icon: Store },
            { id: 'comparison', name: 'Comparaison', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Stores List */}
      {activeTab === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const stats = storeStats[store.id] || {};
            return (
              <div
                key={store.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      store.is_main
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {store.name}
                        {store.is_main && (
                          <CheckCircle className="h-4 w-4 text-green-500" title="Magasin principal" />
                        )}
                      </h3>
                      {store.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {store.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => editStore(store)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {!store.is_main && (
                      <button
                        onClick={() => handleDeleteStore(store.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Store Details */}
                <div className="space-y-2 mb-4">
                  {store.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4" />
                      {store.address}
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Phone className="h-4 w-4" />
                      {store.phone}
                    </div>
                  )}
                </div>

                {/* Store Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Ventes</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {stats.totalSales?.toFixed(2) || '0.00'} MAD
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Transactions</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {stats.totalTransactions || 0}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Produits</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {stats.totalProducts || 0}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Moy/Trans</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {stats.averageTransaction?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>

                {/* Selection for Comparison */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(store.id)}
                      onChange={() => toggleStoreSelection(store.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Inclure dans la comparaison
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Store Comparison */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Comparison Controls */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Comparaison des Performances
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedStores.length} magasin{selectedStores.length > 1 ? 's' : ''} sélectionné{selectedStores.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex gap-3">
                <select
                  value={comparisonPeriod}
                  onChange={(e) => setComparisonPeriod(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                >
                  <option value="7">7 derniers jours</option>
                  <option value="30">30 derniers jours</option>
                  <option value="90">90 derniers jours</option>
                  <option value="365">1 an</option>
                </select>

                <button
                  onClick={loadStoreComparison}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Actualiser
                </button>
              </div>
            </div>
          </div>

          {selectedStores.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Aucun magasin sélectionné
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Sélectionnez au moins un magasin dans l'onglet "Magasins" pour voir la comparaison
              </p>
              <button
                onClick={() => setActiveTab('stores')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Aller aux Magasins
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Magasin
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Ventes Totales
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Ticket Moyen
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Produits
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {getComparisonData().map((store, index) => {
                      const maxSales = Math.max(...getComparisonData().map(s => s.totalSales || 0));
                      const salesPercentage = maxSales > 0 ? ((store.totalSales || 0) / maxSales) * 100 : 0;

                      return (
                        <tr key={store.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                index === 0
                                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                              }`}>
                                <Building2 className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  {store.name}
                                </div>
                                {index === 0 && (
                                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                    Meilleur performant
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {(store.totalSales || 0).toFixed(2)} MAD
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-slate-700 dark:text-slate-300">
                              {store.totalTransactions || 0}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-slate-700 dark:text-slate-300">
                              {(store.averageTransaction || 0).toFixed(2)} MAD
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-slate-700 dark:text-slate-300">
                              {store.totalProducts || 0}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                              <div className="w-full max-w-20 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${salesPercentage}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                {salesPercentage.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Store Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {editingStore ? 'Modifier le Magasin' : 'Ajouter un Magasin'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingStore(null);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={editingStore ? handleUpdateStore : handleAddStore} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom du Magasin *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Ex: Quincaillerie Jamal - Annexe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Ex: 123 Rue Mohammed V, Casablanca"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Ex: 0522-123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Description optionnelle du magasin..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isMain"
                  checked={formData.isMain}
                  onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isMain" className="text-sm text-slate-700 dark:text-slate-300">
                  Magasin principal
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {editingStore ? 'Mettre à Jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingStore(null);
                  }}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 py-2 px-4 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManager;
