import { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Filter } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { getMonthlyData, getYearlyData, generateCSV } from '../utils/storage';
import Papa from 'papaparse';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const Reports = ({ sales }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [reportType, setReportType] = useState('monthly');

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Get available years from sales data
  const availableYears = [...new Set(sales.map(sale => new Date(sale.date).getFullYear()))].sort((a, b) => b - a);

  // Monthly data preparation
  const getMonthlyChartData = () => {
    const monthlyData = Array(12).fill(0);
    const monthlyQuantity = Array(12).fill(0);
    const monthlyTransactions = Array(12).fill(0);

    sales.forEach(sale => {
      if (!sale || !sale.date) return; // Skip invalid sales

      const saleDate = new Date(sale.date);
      if (isNaN(saleDate.getTime())) return; // Skip invalid dates

      if (saleDate.getFullYear() === selectedYear) {
        const month = saleDate.getMonth();
        const totalPrice = parseFloat(sale.totalPrice) || 0;
        const quantity = parseInt(sale.quantity) || 0;

        monthlyData[month] += totalPrice;
        monthlyQuantity[month] += quantity;
        monthlyTransactions[month] += 1;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Chiffre d\'Affaires (MAD)',
          data: monthlyData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2
        }
      ]
    };
  };

  // Daily data for selected month
  const getDailyChartData = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dailyData = Array(daysInMonth).fill(0);
    const dailyQuantity = Array(daysInMonth).fill(0);

    sales.forEach(sale => {
      if (!sale || !sale.date) return; // Skip invalid sales

      const saleDate = new Date(sale.date);
      if (isNaN(saleDate.getTime())) return; // Skip invalid dates

      if (saleDate.getFullYear() === selectedYear && saleDate.getMonth() === selectedMonth) {
        const day = saleDate.getDate() - 1;
        const totalPrice = parseFloat(sale.totalPrice) || 0;
        const quantity = parseInt(sale.quantity) || 0;

        if (day >= 0 && day < daysInMonth) {
          dailyData[day] += totalPrice;
          dailyQuantity[day] += quantity;
        }
      }
    });

    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

    return {
      labels,
      datasets: [
        {
          label: 'Ventes Journalières (MAD)',
          data: dailyData,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Articles Vendus',
          data: dailyQuantity,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Category breakdown
  const getCategoryChartData = () => {
    const categoryData = {};

    sales.forEach(sale => {
      if (!sale || !sale.date || !sale.category) return; // Skip invalid sales

      const saleDate = new Date(sale.date);
      if (isNaN(saleDate.getTime())) return; // Skip invalid dates

      if (reportType === 'monthly' &&
          (saleDate.getFullYear() !== selectedYear || saleDate.getMonth() !== selectedMonth)) {
        return;
      }
      if (reportType === 'yearly' && saleDate.getFullYear() !== selectedYear) {
        return;
      }

      if (!categoryData[sale.category]) {
        categoryData[sale.category] = 0;
      }
      const totalPrice = parseFloat(sale.totalPrice) || 0;
      categoryData[sale.category] += totalPrice;
    });

    const colors = [
      '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6b7280'
    ];

    return {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
          backgroundColor: colors.slice(0, Object.keys(categoryData).length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  };

  // Export monthly report
  const exportMonthlyReport = () => {
    const monthlyData = getMonthlyData(selectedYear, selectedMonth);
    if (monthlyData.length === 0) {
      alert('Aucune donnée pour ce mois');
      return;
    }

    const csvData = generateCSV(monthlyData, 'sales');
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport_mensuel_${months[selectedMonth]}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export yearly report
  const exportYearlyReport = () => {
    const yearlyData = getYearlyData(selectedYear);
    if (yearlyData.length === 0) {
      alert('Aucune donnée pour cette année');
      return;
    }

    const csvData = generateCSV(yearlyData, 'sales');
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport_annuel_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics
  const getStats = () => {
    let filteredSales = sales;

    if (reportType === 'monthly') {
      filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getFullYear() === selectedYear && saleDate.getMonth() === selectedMonth;
      });
    } else {
      filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getFullYear() === selectedYear;
      });
    }

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalQuantity = filteredSales.reduce((sum, sale) => sum + (sale.quantity || 1), 0);
    const totalTransactions = filteredSales.length;
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalQuantity,
      totalTransactions,
      avgTransactionValue
    };
  };

  const stats = getStats();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: reportType === 'monthly'
          ? `Rapport ${months[selectedMonth]} ${selectedYear}`
          : `Rapport Annuel ${selectedYear}`
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Rapports et Analyses
        </h2>
        <div className="text-center py-8 text-gray-500">
          <p>Aucune donnée disponible pour générer des rapports.</p>
          <p>Ajoutez des ventes pour voir les analyses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        Rapports et Analyses
      </h2>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            Type de Rapport
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="monthly">Mensuel</option>
            <option value="yearly">Annuel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            Année
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {reportType === 'monthly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mois
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-end">
          <button
            onClick={reportType === 'monthly' ? exportMonthlyReport : exportYearlyReport}
            className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter Rapport
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.totalRevenue.toFixed(2)} MAD</div>
          <div className="text-sm text-blue-800">Chiffre d'Affaires</div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <div className="text-2xl font-bold text-indigo-600">{stats.totalTransactions}</div>
          <div className="text-sm text-indigo-800">Transactions</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{stats.totalQuantity}</div>
          <div className="text-sm text-purple-800">Articles Vendus</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="text-2xl font-bold text-amber-600">{stats.avgTransactionValue.toFixed(2)} MAD</div>
          <div className="text-sm text-amber-800">Panier Moyen</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportType === 'yearly' ? (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution Mensuelle</h3>
            <Bar data={getMonthlyChartData()} options={chartOptions} />
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution Journalière</h3>
            <Line data={getDailyChartData()} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  grid: {
                    drawOnChartArea: false,
                  },
                }
              }
            }} />
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Catégorie</h3>
          <Doughnut
            data={getCategoryChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                title: {
                  display: true,
                  text: 'Ventes par Catégorie'
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
