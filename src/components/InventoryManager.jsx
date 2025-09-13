import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  X,
  FileSpreadsheet,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Minus,
  Building2,
  Download,
  Upload,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import {
  loadInventory,
  addInventoryItem,
  getLowStockItems,
  generateCSV,
  findProductByBarcode,
  updateInventoryStock,
  loadStores
} from '../utils/storage-api';
import api from '../utils/api';
import Papa from 'papaparse';

const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('main');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockAlert, setStockAlert] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    barcode: '',
    stock: '',
    minStock: 5,
    costPrice: '',
    sellingPrice: '',
    storeId: 'main'
  });

  useEffect(() => {
    loadInitialData();
  }, [selectedStore]);

  useEffect(() => {
    loadLowStockAlert();
  }, [inventory]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load data using storage-api functions
      const [inventoryData, storesData, categoriesData] = await Promise.all([
        loadInventory(),
        loadStores(),
        api.getCategories()
      ]);

      setInventory(inventoryData);
      setStores(storesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Erreur lors du chargement des données');
      // Set default categories if API fails
      setCategories([
        { id: 1, name: 'Outillage' },
        { id: 2, name: 'Quincaillerie' },
        { id: 3, name: 'Peinture' },
        { id: 4, name: 'Électricité' },
        { id: 5, name: 'Plomberie' },
        { id: 6, name: 'Construction' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadLowStockAlert = async () => {
    try {
      const lowStockItems = await getLowStockItems();
      setStockAlert(lowStockItems);
    } catch (error) {
      console.error('Error loading low stock items:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.sellingPrice) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await addInventoryItem({
        ...formData,
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 5,
        costPrice: parseFloat(formData.costPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        storeId: selectedStore
      });

      // Reload inventory
      const updatedInventory = await loadInventory();
      setInventory(updatedInventory);

      // Reset form
      setFormData({
        name: '',
        category: '',
        barcode: '',
        stock: '',
        minStock: 5,
        costPrice: '',
        sellingPrice: '',
        storeId: selectedStore
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding inventory item:', error);
      alert('Erreur lors de l\'ajout du produit');
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();

    try {
      await api.updateProduct(editingItem.id, {
        ...formData,
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 5,
        costPrice: parseFloat(formData.costPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0
      });

      // Reload inventory
      const updatedInventory = await loadInventory();
      setInventory(updatedInventory);

      setEditingItem(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Erreur lors de la mise à jour du produit');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      await api.deleteProduct(itemId, selectedStore);

      // Reload inventory
      const updatedInventory = await loadInventory();
      setInventory(updatedInventory);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      barcode: item.barcode || '',
      stock: item.stock || 0,
      minStock: item.minStock || 5,
      costPrice: item.costPrice || 0,
      sellingPrice: item.sellingPrice || 0,
      storeId: item.storeId || selectedStore
    });
    setShowAddForm(true);
  };

  const handleStockAdjustment = async (itemId, adjustment) => {
    try {
      const item = inventory.find(i => i.id === itemId);
      await updateInventoryStock(item.name, adjustment, selectedStore);

      // Reload inventory
      const updatedInventory = await loadInventory();
      setInventory(updatedInventory);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Erreur lors de l\'ajustement du stock');
    }
  };

  const handleBarcodeSearch = async (barcode) => {
    if (!barcode) return;

    try {
      const product = await findProductByBarcode(barcode);
      if (product) {
        setFormData({
          name: product.name,
          category: product.category,
          barcode: product.barcode,
          stock: product.stock || 0,
          minStock: product.minStock || 5,
          costPrice: product.costPrice || 0,
          sellingPrice: product.sellingPrice || 0,
          storeId: selectedStore
        });
      }
    } catch (error) {
      console.error('Error searching by barcode:', error);
    }
  };

  const handleExportCSV = () => {
    const csvData = generateCSV(filteredInventory, 'inventory');
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `inventaire-${selectedStore}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.barcode && item.barcode.includes(searchTerm));
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Chargement de l'inventaire...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={loadInitialData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Store Selection */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Package className="h-8 w-8 text-blue-600 mr-3" />
          Gestion d'Inventaire
        </h2>

        <div className="flex items-center space-x-4">
          {/* Store Selector */}
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {stores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un Produit
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stockAlert.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              {stockAlert.length} produit(s) en stock faible
            </span>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            {stockAlert.slice(0, 3).map(item => item.name).join(', ')}
            {stockAlert.length > 3 && ` et ${stockAlert.length - 3} autres`}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.category}
                </p>
                {item.barcode && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                    {item.barcode}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditItem(item)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Stock Level */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stock:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStockAdjustment(item.id, -1)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className={`font-semibold px-2 py-1 rounded ${
                    item.stock <= item.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.stock}
                  </span>
                  <button
                    onClick={() => handleStockAdjustment(item.id, 1)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Prix d'achat:</span>
                  <p className="font-semibold">{item.costPrice?.toFixed(2)} MAD</p>
                </div>
                <div>
                  <span className="text-gray-600">Prix de vente:</span>
                  <p className="font-semibold">{item.sellingPrice?.toFixed(2)} MAD</p>
                </div>
              </div>

              {/* Margin */}
              {item.costPrice && item.sellingPrice && (
                <div className="text-sm">
                  <span className="text-gray-600">Marge:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              {/* Low Stock Warning */}
              {item.stock <= item.minStock && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Stock faible (Min: {item.minStock})
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterCategory ? 'Essayez de modifier vos filtres' : 'Commencez par ajouter des produits à votre inventaire'}
          </p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Modifier le Produit' : 'Ajouter un Produit'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du Produit *
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
                    Catégorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code-barres
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => {
                      setFormData({...formData, barcode: e.target.value});
                      handleBarcodeSearch(e.target.value);
                    }}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock Initial
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock Minimum
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prix d'Achat (MAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prix de Vente (MAD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
