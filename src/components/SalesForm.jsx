import { useState } from 'react';
import { Plus, Calendar, Tag, Package2, DollarSign } from 'lucide-react';

const SalesForm = ({ onAddSale }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dayName: '',
    productName: '',
    price: '',
    quantity: 1,
    category: ''
  });

  const categories = [
    'Outils', 'Construction', 'Électricité', 'Plomberie',
    'Peinture', 'Nettoyage', 'Quincaillerie', 'Autres'
  ];

  const dayNames = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi',
    'Vendredi', 'Samedi', 'Dimanche'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.price || !formData.category || !formData.quantity) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const saleData = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      dayName: formData.dayName || getDayName(formData.date)
    };

    onAddSale(saleData);

    // Reset form but keep date
    setFormData({
      ...formData,
      productName: '',
      price: '',
      quantity: 1,
      category: ''
    });
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayIndex];
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setFormData({
      ...formData,
      date: newDate,
      dayName: getDayName(newDate)
    });
  };

  const totalPrice = (parseFloat(formData.price) || 0) * (parseInt(formData.quantity) || 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        Ajouter une Vente
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={handleDateChange}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Jour
          </label>
          <select
            value={formData.dayName}
            onChange={(e) => setFormData({ ...formData, dayName: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="">Auto-détecté</option>
            {dayNames.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Package2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Nom du Produit *
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            placeholder="Ex: Marteau, Peinture blanche, Vis, Tuyau..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Catégorie *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Quantité *
          </label>
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Prix Unitaire (MAD) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            placeholder="0.00"
            required
          />
        </div>

        <div className="md:col-span-3 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <div className="text-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Prix Total</span>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {totalPrice.toFixed(2)} MAD
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 mt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Ajouter la Vente - {totalPrice.toFixed(2)} MAD
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;
