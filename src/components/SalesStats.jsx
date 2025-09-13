const SalesStats = ({ sales }) => {
  if (sales.length === 0) {
    return null;
  }

  // Calculate daily totals
  const dailyTotals = sales.reduce((acc, sale) => {
    if (!sale || !sale.date) return acc; // Skip invalid sales

    const date = sale.date;
    if (!acc[date]) {
      acc[date] = { total: 0, count: 0, dayName: sale.dayName || '' };
    }
    const totalPrice = parseFloat(sale.totalPrice) || 0;
    acc[date].total += totalPrice;
    acc[date].count += 1;
    return acc;
  }, {});

  // Calculate category totals
  const categoryTotals = sales.reduce((acc, sale) => {
    if (!sale || !sale.category) return acc; // Skip invalid sales

    const category = sale.category;
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 };
    }
    const totalPrice = parseFloat(sale.totalPrice) || 0;
    acc[category].total += totalPrice;
    acc[category].count += 1;
    return acc;
  }, {});

  // Get recent days (last 7 days with sales)
  const recentDays = Object.entries(dailyTotals)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .slice(0, 7);

  // Get top categories
  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 5);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Daily Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-4">
          Ventes par Jour (7 derniers)
        </h3>
        <div className="space-y-3">
          {recentDays.map(([date, data]) => (
            <div key={date} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-100 dark:border-green-800">
              <div>
                <div className="font-medium text-gray-900 dark:text-slate-100">
                  {formatDate(date)} - {data.dayName}
                </div>
                <div className="text-sm text-gray-600 dark:text-slate-400">
                  {data.count} vente{data.count > 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {data.total.toFixed(2)} MAD
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-4">
          Top Catégories
        </h3>
        <div className="space-y-3">
          {topCategories.map(([category, data]) => (
            <div key={category} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-100 dark:border-blue-800">
              <div>
                <div className="font-medium text-gray-900 dark:text-slate-100">{category}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">
                  {data.count} vente{data.count > 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {data.total.toFixed(2)} MAD
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesStats;
