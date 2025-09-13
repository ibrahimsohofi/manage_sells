import { useState, useEffect } from 'react';
import { loadCustomers, addCustomer, saveCustomers, loadSales } from '../utils/storage';
import Papa from 'papaparse';

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const customerData = loadCustomers();
    const salesData = loadSales();

    // Calculate customer statistics
    const customersWithStats = customerData.map(customer => {
      const customerSales = salesData.filter(sale => sale.customerId === customer.id);
      const totalAmount = customerSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
      const totalPurchases = customerSales.length;
      const lastPurchase = customerSales.length > 0
        ? Math.max(...customerSales.map(sale => new Date(sale.date).getTime()))
        : null;

      return {
        ...customer,
        totalAmount,
        totalPurchases,
        lastPurchase: lastPurchase ? new Date(lastPurchase).toISOString() : null
      };
    });

    setCustomers(customersWithStats);
    setSales(salesData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert('Veuillez remplir le nom et le téléphone');
      return;
    }

    if (editingCustomer) {
      // Update existing customer
      const updatedCustomers = customers.map(customer =>
        customer.id === editingCustomer.id
          ? { ...customer, ...formData, lastUpdated: new Date().toISOString() }
          : customer
      );
      setCustomers(updatedCustomers);
      saveCustomers(updatedCustomers);
      setEditingCustomer(null);
    } else {
      // Add new customer
      const newCustomer = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        totalPurchases: 0,
        totalAmount: 0,
        lastPurchase: null
      };

      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);
      saveCustomers(updatedCustomers);
    }

    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      const updatedCustomers = customers.filter(customer => customer.id !== id);
      setCustomers(updatedCustomers);
      saveCustomers(updatedCustomers);
    }
  };

  const exportCustomers = () => {
    if (customers.length === 0) {
      alert('Aucun client à exporter');
      return;
    }

    const headers = ['Nom', 'Téléphone', 'Email', 'Adresse', 'Total Achats', 'Montant Total (MAD)', 'Dernière Visite', 'Notes'];
    const rows = customers.map(customer => [
      customer.name,
      customer.phone || '',
      customer.email || '',
      customer.address || '',
      customer.totalPurchases,
      (customer.totalAmount || 0).toFixed(2),
      customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('fr-FR') : 'Jamais',
      customer.notes || ''
    ]);

    const csvData = [headers, ...rows];
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_droguerie_jamal_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewCustomerDetails = (customer) => {
    const customerSales = sales.filter(sale => sale.customerId === customer.id);
    setSelectedCustomer({ ...customer, sales: customerSales });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.totalPurchases > 0).length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalAmount, 0);
  const avgCustomerValue = activeCustomers > 0 ? totalRevenue / activeCustomers : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-800 mb-4 lg:mb-0">
          👥 Gestion Clients ({totalCustomers} clients)
        </h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingCustomer(null);
              setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                notes: ''
              });
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            {showAddForm ? '❌ Annuler' : '➕ Ajouter Client'}
          </button>
          <button
            onClick={exportCustomers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            📊 Exporter Clients
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{totalCustomers}</div>
          <div className="text-sm text-green-800">Total Clients</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{activeCustomers}</div>
          <div className="text-sm text-blue-800">Clients Actifs</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{totalRevenue.toFixed(2)} MAD</div>
          <div className="text-sm text-purple-800">CA Total Clients</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{avgCustomerValue.toFixed(2)} MAD</div>
          <div className="text-sm text-orange-800">Valeur Moyenne</div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingCustomer ? 'Modifier Client' : 'Ajouter Nouveau Client'}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom Complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Ahmed Benali"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: 0612345678"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="client@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Adresse complète"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Notes sur le client..."
                rows="3"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {editingCustomer ? 'Mettre à Jour' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCustomer(null);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rechercher Client
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nom ou téléphone..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun client trouvé.</p>
          <p>Ajoutez votre premier client ci-dessus.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-green-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-green-800 uppercase tracking-wider">
                  Achats
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-green-800 uppercase tracking-wider">
                  Total (MAD)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                  Dernière Visite
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      {customer.email && (
                        <div className="text-gray-500 text-xs">{customer.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div>
                      <div>{customer.phone}</div>
                      {customer.address && (
                        <div className="text-gray-500 text-xs">{customer.address}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                    {customer.totalPurchases}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right font-bold text-green-600">
                    {(customer.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {customer.lastPurchase
                      ? new Date(customer.lastPurchase).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => viewCustomerDetails(customer)}
                        className="text-green-600 hover:text-green-800 text-sm"
                        title="Voir détails"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-green-800">
                Détails Client: {selectedCustomer.name}
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ❌
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Informations Contact</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Téléphone:</span> {selectedCustomer.phone}</div>
                  {selectedCustomer.email && (
                    <div><span className="font-medium">Email:</span> {selectedCustomer.email}</div>
                  )}
                  {selectedCustomer.address && (
                    <div><span className="font-medium">Adresse:</span> {selectedCustomer.address}</div>
                  )}
                  {selectedCustomer.notes && (
                    <div><span className="font-medium">Notes:</span> {selectedCustomer.notes}</div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Statistiques</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Total Achats:</span> {selectedCustomer.totalPurchases}</div>
                  <div><span className="font-medium">Montant Total:</span> {(selectedCustomer.totalAmount || 0).toFixed(2)} MAD</div>
                  <div><span className="font-medium">Panier Moyen:</span> {
                    selectedCustomer.totalPurchases > 0
                      ? ((selectedCustomer.totalAmount || 0) / selectedCustomer.totalPurchases).toFixed(2)
                      : '0.00'
                  } MAD</div>
                  <div><span className="font-medium">Dernière Visite:</span> {
                    selectedCustomer.lastPurchase
                      ? new Date(selectedCustomer.lastPurchase).toLocaleDateString('fr-FR')
                      : 'Jamais'
                  }</div>
                </div>
              </div>
            </div>

            {selectedCustomer.sales && selectedCustomer.sales.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">
                  Historique des Achats ({selectedCustomer.sales.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">Produit</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase">Qté</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedCustomer.sales.map((sale, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {new Date(sale.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">{sale.productName}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-right">{sale.quantity || 1}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium">
                            {(sale.totalPrice || 0).toFixed(2)} MAD
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
