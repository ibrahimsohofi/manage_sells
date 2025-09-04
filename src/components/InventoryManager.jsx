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
  saveInventory,
  getLowStockItems,
  generateCSV
} from '../utils/storage';
import Papa from 'papaparse';

const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: '',
    minStock: 5,
    costPrice: '',
    sellingPrice: ''
  });

  const categories = [
    'Médicaments', 'Vitamines', 'Cosmétiques', 'Protection',
    'Accessoires', 'Hygiène', 'Pansements', 'Autres'
  ];

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = () => {
    const data = loadInventory();
    setInventory(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category || formData.stock === '') {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingItem) {
      // Update existing item
      const updatedInventory = inventory.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              ...formData,
              stock: parseInt(formData.stock),
              minStock: parseInt(formData.minStock),
              costPrice: parseFloat(formData.costPrice) || 0,
              sellingPrice: parseFloat(formData.sellingPrice) || 0,
              lastUpdated: new Date().toISOString()
            }
          : item
      );
      setInventory(updatedInventory);
      saveInventory(updatedInventory);
      setEditingItem(null);
    } else {
      // Add new item
      const newItem = {
        ...formData,
        id: Date.now().toString(),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        costPrice: parseFloat(formData.costPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      const updatedInventory = [...inventory, newItem];
      setInventory(updatedInventory);
      saveInventory(updatedInventory);
    }

    // Reset form
    setFormData({
      name: '',
      category: '',
      stock: '',
      minStock: 5,
      costPrice: '',
      sellingPrice: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      stock: item.stock.toString(),
      minStock: item.minStock.toString(),
      costPrice: item.costPrice?.toString() || '',
      sellingPrice: item.sellingPrice?.toString() || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article du stock ?')) {
      const updatedInventory = inventory.filter(item => item.id !== id);
      setInventory(updatedInventory);
      saveInventory(updatedInventory);
    }
  };

  const updateStock = (id, newStock) => {
    const updatedInventory = inventory.map(item =>
      item.id === id
        ? { ...item, stock: Math.max(0, newStock), lastUpdated: new Date().toISOString() }
        : item
    );
    setInventory(updatedInventory);
    saveInventory(updatedInventory);
  };

  const exportInventory = () => {
    if (inventory.length === 0) {
      alert('Aucun article en stock à exporter');
      return;
    }

    const csvData = generateCSV(inventory, 'inventory');
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventaire_droguerie_jamal_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInventory = inventory.filter(item => {
    const categoryMatch = !filterCategory || item.category === filterCategory;
    const searchMatch = !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const lowStockItems = getLowStockItems();
  const totalValue = inventory.reduce((sum, item) =>
    sum + (item.stock * (item.costPrice || 0)), 0
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-slate-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 lg:mb-0 flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          Gestion des Stocks ({inventory.length} articles)
        </h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingItem(null);
              setFormData({
                name: '',
                category: '',
                stock: '',
                minStock: 5,
                costPrice: '',
                sellingPrice: ''
              });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {showAddForm ? (
              <>
                <X className="h-4 w-4" />
                Annuler
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Ajouter Article
              </>
            )}
          </button>
          <button
            onClick={exportInventory}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exporter Stock
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alerte Stock Faible ({lowStockItems.length} articles)
          </h3>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(item => (
              <span
                key={item.id}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {item.name} ({item.stock} restant)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{inventory.length}</div>
          <div className="text-sm text-blue-800">Articles Différents</div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg text-center border border-indigo-200">
          <div className="text-2xl font-bold text-indigo-600">
            {inventory.reduce((sum, item) => sum + item.stock, 0)}
          </div>
          <div className="text-sm text-indigo-800">Unités en Stock</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
          <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
          <div className="text-sm text-red-800">Stock Faible</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{totalValue.toFixed(2)} MAD</div>
          <div className="text-sm text-purple-800">Valeur Stock</div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {editingItem ? (
              <>
                <Edit2 className="h-5 w-5 text-blue-600" />
                Modifier Article
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-blue-600" />
                Ajouter Nouvel Article
              </>
            )}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du Produit *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Marteau 500g"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner catégorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Initial *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Minimum
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix d'Achat (MAD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix de Vente (MAD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-3 flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                {editingItem ? 'Mettre à Jour' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            Rechercher
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nom du produit..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            Filtrer par catégorie
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('');
            }}
            className="w-full p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" />
            Effacer Filtres
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      {filteredInventory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>Aucun article en stock.</p>
          <p>Ajoutez votre premier article ci-dessus.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-blue-50 border border-blue-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Min
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Prix Achat
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Prix Vente
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                    {item.name}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => updateStock(item.id, item.stock - 1)}
                        className="w-6 h-6 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 flex items-center justify-center"
                        disabled={item.stock <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-medium w-8 text-center">{item.stock}</span>
                      <button
                        onClick={() => updateStock(item.id, item.stock + 1)}
                        className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded text-xs hover:bg-emerald-200 flex items-center justify-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">
                    {item.minStock}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">
                    {item.costPrice ? `${item.costPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">
                    {item.sellingPrice ? `${item.sellingPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {item.stock <= item.minStock ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Stock Faible
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
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
      )}
    </div>
  );
};

export default InventoryManager;
