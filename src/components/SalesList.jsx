import { useState } from 'react';
import { generateCSV } from '../utils/storage';
import Papa from 'papaparse';

const SalesList = ({ sales, onDeleteSale }) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const categories = [
    'Outils', 'Construction', 'Électricité', 'Plomberie',
    'Peinture', 'Nettoyage', 'Quincaillerie', 'Autres'
  ];

  const filteredSales = sales.filter(sale => {
    const dateMatch = !filterDate || sale.date === filterDate;
    const categoryMatch = !filterCategory || sale.category === filterCategory;
    return dateMatch && categoryMatch;
  });

  const totalAmount = filteredSales.reduce((sum, sale) => {
    const totalPrice = parseFloat(sale.totalPrice) || 0;
    return sum + totalPrice;
  }, 0);

  const totalQuantity = filteredSales.reduce((sum, sale) => {
    const quantity = parseInt(sale.quantity) || 0;
    return sum + quantity;
  }, 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const exportToCSV = () => {
    const csvData = generateCSV(filteredSales, 'sales');
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ventes_quincaillerie_jamal_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFilteredToCSV = () => {
    if (filteredSales.length === 0) {
      alert('Aucune vente à exporter');
      return;
    }

    const csvData = generateCSV(filteredSales, 'sales');
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    let filename = 'ventes_filtrées';
    if (filterDate) filename += `_${filterDate}`;
    if (filterCategory) filename += `_${filterCategory}`;
    filename += `_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterCategory('');
  };

  if (sales.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-4">Historique des Ventes</h2>
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">
          <p>Aucune vente enregistrée pour le moment.</p>
          <p>Ajoutez votre première vente ci-dessus.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-4 lg:mb-0">
          Historique des Ventes ({filteredSales.length})
        </h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            📊 Exporter Tout (CSV)
          </button>
          <button
            onClick={exportFilteredToCSV}
            disabled={filteredSales.length === 0}
            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
          >
            📁 Exporter Filtrées (CSV)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Filtrer par date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Filtrer par catégorie
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full p-2 bg-gray-600 dark:bg-slate-600 text-white rounded-md hover:bg-gray-700 dark:hover:bg-slate-500 transition-colors"
          >
            Effacer Filtres
          </button>
        </div>
      </div>

      {/* Summary */}
      {(filterDate || filterCategory) && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800 dark:text-green-400">{filteredSales.length}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Ventes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800 dark:text-green-400">{totalQuantity}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Articles vendus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800 dark:text-green-400">{totalAmount.toFixed(2)} MAD</div>
              <div className="text-sm text-green-600 dark:text-green-400">Montant total</div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {/* Table Header */}
        <table className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Nom du Produit
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Quantité
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Prix (MAD)
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {formatDate(sale.date)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {sale.dayName}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {sale.productName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {sale.category}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {sale.quantity || 1}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                    {(sale.totalPrice || 0)} MAD
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {(sale.price || 0)} MAD/unité
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => onDeleteSale(sale.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-sm transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Supprimer cette vente"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-md border border-gray-200 dark:border-slate-600">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-700 dark:text-slate-300">Total Ventes</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{sales.length}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-medium text-gray-700 dark:text-slate-300">Articles Vendus</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {sales.reduce((sum, sale) => sum + (sale.quantity || 1), 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-medium text-gray-700 dark:text-slate-300">Chiffre d'Affaires</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0)} MAD
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesList;
