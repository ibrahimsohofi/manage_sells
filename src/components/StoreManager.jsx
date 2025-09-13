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
  Settings,
  RefreshCw,
  ExternalLink,
  Award,
  TrendingDown
} from 'lucide-react';
import { loadStores, addStore, getStoreComparison, getSalesByStore } from '../utils/storage-api';
import api from '../utils/api';

const StoreManager = () => {
  const [stores, setStores] = useState([]);
  const [storeComparison, setStoreComparison] = useState([]);
  const [storeStats, setStoreStats] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [activeTab, setActiveTab] = useState('stores');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStores, setSelectedStores] = useState([]);
  const [comparisonPeriod, setComparisonPeriod] = useState('7');
  const [viewingStore, setViewingStore] = useState(null);

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
  }, [activeTab]);

  const loadStoresData = async () => {
    setLoading(true);
    setError(null);
    try {
      const storesData = await loadStores();
      setStores(storesData);

      // Load individual store stats
      const statsPromises = storesData.map(async (store) => {
        try {
          const sales = await getSalesByStore(store.id);
          const totalSales = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
          const totalTransactions = sales.length;
          const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

          return {
            storeId: store.id,
            totalSales,
            totalTransactions,
            avgTransaction
          };
        } catch (error) {
          console.error(`Error loading stats for store ${store.id}:`, error);
          return {
            storeId: store.id,
            totalSales: 0,
            totalTransactions: 0,
            avgTransaction: 0
          };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap = {};
      statsResults.forEach(stat => {
        statsMap[stat.storeId] = stat;
      });
      setStoreStats(statsMap);

    } catch (error) {
      console.error('Error loading stores data:', error);
      setError('Erreur lors du chargement des magasins');
    } finally {
      setLoading(false);
    }
  };

  const loadStoreComparison = async () => {
    try {
      const comparison = await getStoreComparison();
      setStoreComparison(comparison);
    } catch (error) {
      console.error('Error loading store comparison:', error);
      // Set mock data if API fails
      setStoreComparison([]);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.address) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await addStore({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        description: formData.description,
        isMain: formData.isMain
      });

      // Reload stores
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
        isMain: formData.isMain
      });

      // Reload stores
      await loadStoresData();

      setEditingStore(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error updating store:', error);
      alert('Erreur lors de la mise à jour du magasin');
    }
  };

  const handleDeleteStore = async (storeId) => {
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

  const handleEditStore = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address,
      phone: store.phone || '',
      description: store.description || '',
      isMain: store.isMain || false
    });
    setShowAddForm(true);
  };

  const getStoreStatusColor = (stats) => {
    if (!stats) return 'bg-gray-100 text-gray-800';

    if (stats.totalSales > 10000) return 'bg-green-100 text-green-800';
    if (stats.totalSales > 5000) return 'bg-blue-100 text-blue-800';
    if (stats.totalSales > 1000) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceIcon = (stats) => {
    if (!stats) return <AlertCircle className="h-4 w-4" />;

    if (stats.totalSales > 10000) return <Award className="h-4 w-4 text-green-600" />;
    if (stats.totalSales > 5000) return <TrendingUp className="h-4 w-4 text-blue-600" />;
    if (stats.totalSales > 1000) return <BarChart3 className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Chargement des magasins...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={loadStoresData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Building2 className="h-8 w-8 text-blue-600 mr-3" />
          Gestion des Magasins
        </h2>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Magasin
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('stores')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stores'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Store className="h-5 w-5 inline mr-2" />
            Magasins
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'comparison'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-5 w-5 inline mr-2" />
            Comparaison
          </button>
        </nav>
      </div>

      {/* Stores Tab */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          {/* Store Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Magasins</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stores.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chiffre d'Affaires Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.values(storeStats).reduce((sum, stat) => sum + stat.totalSales, 0).toFixed(2)} MAD
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.values(storeStats).reduce((sum, stat) => sum + stat.totalTransactions, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Panier Moyen</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stores.length > 0
                      ? (Object.values(storeStats).reduce((sum, stat) => sum + stat.avgTransaction, 0) / stores.length).toFixed(2)
                      : '0.00'
                    } MAD
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map(store => {
              const stats = storeStats[store.id] || { totalSales: 0, totalTransactions: 0, avgTransaction: 0 };
              return (
                <div key={store.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {store.name}
                        </h3>
                        {store.isMain && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Principal
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {store.address}
                        </div>
                        {store.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {store.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingStore(store)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditStore(store)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {!store.isMain && (
                        <button
                          onClick={() => handleDeleteStore(store.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Store Performance */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Performance:</span>
                      <div className="flex items-center">
                        {getPerformanceIcon(stats)}
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStoreStatusColor(stats)}`}>
                          {stats.totalSales > 10000 ? 'Excellent' :
                           stats.totalSales > 5000 ? 'Bon' :
                           stats.totalSales > 1000 ? 'Moyen' : 'Faible'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Ventes:</span>
                        <p className="font-semibold">{stats.totalSales.toFixed(2)} MAD</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Transactions:</span>
                        <p className="font-semibold">{stats.totalTransactions}</p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-600">Panier moyen:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        {stats.avgTransaction.toFixed(2)} MAD
                      </span>
                    </div>

                    {store.description && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {store.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {stores.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun magasin configuré
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Commencez par ajouter vos magasins pour gérer votre réseau
              </p>
            </div>
          )}
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Comparison Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Période de comparaison
                </label>
                <select
                  value={comparisonPeriod}
                  onChange={(e) => setComparisonPeriod(e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="7">7 derniers jours</option>
                  <option value="30">30 derniers jours</option>
                  <option value="90">3 derniers mois</option>
                  <option value="365">Année complète</option>
                </select>
              </div>

              <button
                onClick={loadStoreComparison}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comparaison des Performances
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Magasin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Chiffre d'Affaires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Panier Moyen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stores.map((store, index) => {
                    const stats = storeStats[store.id] || { totalSales: 0, totalTransactions: 0, avgTransaction: 0 };
                    return (
                      <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {store.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {store.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {stats.totalSales.toFixed(2)} MAD
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {stats.totalTransactions}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {stats.avgTransaction.toFixed(2)} MAD
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getPerformanceIcon(stats)}
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStoreStatusColor(stats)}`}>
                              #{index + 1}
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
        </div>
      )}

      {/* Store Details Modal */}
      {viewingStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Détails du Magasin
              </h3>
              <button
                onClick={() => setViewingStore(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Store Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Informations Générales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nom
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{viewingStore.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Adresse
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{viewingStore.address}</p>
                  </div>
                  {viewingStore.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Téléphone
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{viewingStore.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {viewingStore.isMain ? 'Magasin Principal' : 'Succursale'}
                    </p>
                  </div>
                </div>
                {viewingStore.description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{viewingStore.description}</p>
                  </div>
                )}
              </div>

              {/* Performance Stats */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Performance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    const stats = storeStats[viewingStore.id] || { totalSales: 0, totalTransactions: 0, avgTransaction: 0 };
                    return (
                      <>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chiffre d'Affaires</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {stats.totalSales.toFixed(2)} MAD
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <Package className="h-6 w-6 text-blue-600" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {stats.totalTransactions}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Panier Moyen</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {stats.avgTransaction.toFixed(2)} MAD
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => setViewingStore(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  handleEditStore(viewingStore);
                  setViewingStore(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingStore ? 'Modifier le Magasin' : 'Nouveau Magasin'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingStore(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingStore ? handleUpdateStore : handleAddStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du Magasin *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isMain"
                  checked={formData.isMain}
                  onChange={(e) => setFormData({...formData, isMain: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="isMain" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Magasin principal
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingStore(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingStore ? 'Mettre à jour' : 'Créer'}
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
