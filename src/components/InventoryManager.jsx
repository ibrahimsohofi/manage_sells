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
  Building2
} from 'lucide-react';
import {
  loadInventory,
  addInventoryItem,
  getLowStockItems,
  generateCSV,
  findProductByBarcode,
  updateInventoryStock
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

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load data using storage-api functions
      const [inventoryData, storesData, categoriesData] = await Promise.all([
        loadInventory(),
        api.getStores(),
        api.getCategories()
      ]);

      setInventory(inventoryData);
      setStores(storesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
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
        sellingPrice: parseFloat(formData.sellingPrice) || 0
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

  const handleStockAdjustment = async (itemId, adjustment) => {
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;

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
    if (!barcode.trim()) return;

    try {
      const product = await findProductByBarcode(barcode);
      if (product) {
        setSearchTerm(product.name);
      } else {
        alert('Aucun produit trouvé avec ce code-barres');
      }
    } catch (error) {
      console.error('Error searching by barcode:', error);
    }
  };

  const exportToCSV = () => {
    const csvData = generateCSV(filteredInventory, 'inventory');
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventaire_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const editItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      barcode: item.barcode || '',
      stock: item.stock.toString(),
      minStock: item.minStock?.toString() || '5',
      costPrice: item.costPrice?.toString() || '',
      sellingPrice: item.sellingPrice?.toString() || '',
      storeId: item.storeId || selectedStore
    });
    setShowAddForm(true);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.barcode && item.barcode.includes(searchTerm));
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = filteredInventory.filter(item =>
    item.stock <= (item.minStock || 5)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement de l'inventaire...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Gestion de l'Inventaire
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {inventory.length} produits • {lowStockItems.length} en stock faible
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter Produit
          </button>
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Store Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Magasin
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Recherche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Nom du produit ou code-barres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Catégorie
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-red-700 dark:text-red-300">
              Stock Faible ({lowStockItems.length} produits)
            </h3>
          </div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.slice(0, 6).map(item => (
              <div key={item.id} className="text-sm text-red-600 dark:text-red-400">
                {item.name}: {item.stock} restant (min: {item.minStock || 5})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {item.name}
                      </div>
                      {item.barcode && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          Code: {item.barcode}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {item.category}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.stock}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStockAdjustment(item.id, -1)}
                          className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs flex items-center justify-center"
                          disabled={item.stock <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleStockAdjustment(item.id, 1)}
                          className="w-6 h-6 bg-green-100 hover:bg-green-200 text-green-600 rounded text-xs flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Min: {item.minStock || 5}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="text-slate-900 dark:text-slate-100">
                        {item.sellingPrice?.toFixed(2)} MAD
                      </div>
                      {item.costPrice && (
                        <div className="text-slate-500 dark:text-slate-400">
                          Coût: {item.costPrice.toFixed(2)} MAD
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.stock <= (item.minStock || 5)
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {item.stock <= (item.minStock || 5) ? 'Stock Faible' : 'Disponible'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => editItem(item)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Aucun produit trouvé
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {editingItem ? 'Modifier le Produit' : 'Ajouter un Produit'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom du Produit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Ex: Marteau 500g"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Catégorie *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Code-barres
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Ex: 1234567890"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Stock Initial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Stock Minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Prix d'Achat (MAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Prix de Vente (MAD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {editingItem ? 'Mettre à Jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
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

export default InventoryManager;
