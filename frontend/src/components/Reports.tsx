import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ReportData {
  summary: {
    totalRevenue: string;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: string;
    completionRate: string;
  };
  categoryBreakdown: Record<string, number>;
  topSellingItems: [string, number][];
  hourlySales: Record<string, number>;
  paymentMethods: Record<string, number>;
  orders: any[];
}

interface WasteReportData {
  summary: {
    totalWasteValue: string;
    wastePercentage: string;
    cancelledOrders: number;
    totalOrders: number;
  };
  wasteByCategory: Record<string, number>;
  topWastedItems: [string, number][];
  recommendations: string[];
}

interface ForecastData {
  period: string;
  summary: {
    totalOrdersAnalyzed: number;
    uniqueIngredients: number;
    averageDailyOrders: string;
  };
  ingredientUsage: Record<string, number>;
  topIngredients: [string, number][];
  categoryTrends: Record<string, number>;
  forecasts: {
    next7Days: Record<string, number>;
  };
  recommendations: string[];
}

export default function Reports() {
  const [activeReport, setActiveReport] = useState<'sales' | 'waste' | 'forecast'>('sales');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Report data states
  const [salesData, setSalesData] = useState<ReportData | null>(null);
  const [wasteData, setWasteData] = useState<WasteReportData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  
  // Date filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch report data
  const fetchReportData = async (reportType: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      let url = '';
      
      switch (reportType) {
        case 'sales':
          url = `http://localhost:5001/api/reports/daily-sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          break;
        case 'waste':
          url = `http://localhost:5001/api/reports/food-waste?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          break;
        case 'forecast':
          const days = Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24));
          url = `http://localhost:5001/api/reports/ingredient-forecast?days=${days}`;
          break;
      }

      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        switch (reportType) {
          case 'sales':
            setSalesData(data.data);
            break;
          case 'waste':
            setWasteData(data.data);
            break;
          case 'forecast':
            setForecastData(data.data);
            break;
        }
      } else {
        setError(data.message || 'Failed to fetch report data');
      }
    } catch (err) {
      console.error('Report fetch error:', err);
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or date range changes
  useEffect(() => {
    fetchReportData(activeReport);
  }, [activeReport, dateRange]);

  // Export to CSV function
  const exportToCSV = (data: any, filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.entries(data).map(([key, value]) => `${key},${value}`).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">F&B Analytics & Reports</h2>
        <p className="text-gray-600">Generate comprehensive reports for food and beverage operations</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Date Range
          </h3>
          <button
            onClick={() => fetchReportData(activeReport)}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'sales', label: 'Daily Sales', icon: BarChart3 },
              { id: 'waste', label: 'Food Waste', icon: AlertTriangle },
              { id: 'forecast', label: 'Ingredient Forecast', icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveReport(id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeReport === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading report data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Daily Sales Report */}
          {activeReport === 'sales' && salesData && (
            <div className="space-y-6">
              {/* No Data Message */}
              {salesData.summary.totalOrders === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <div className="text-yellow-600 text-4xl mb-2">📊</div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Sales Data Found</h3>
                  <p className="text-yellow-700">
                    No orders found for the selected date range. Create some orders to see analytics data.
                  </p>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-900">${salesData.summary.totalRevenue}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingCart className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-900">{salesData.summary.totalOrders}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Avg Order Value</p>
                      <p className="text-2xl font-bold text-purple-900">${salesData.summary.averageOrderValue}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-orange-900">{salesData.summary.completionRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Category Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(salesData.categoryBreakdown).map(([category, amount]) => (
                    <div key={category} className="text-center">
                      <p className="text-sm text-gray-600 capitalize">{category}</p>
                      <p className="text-lg font-bold text-gray-900">${amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Selling Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Top Selling Items</h4>
                <div className="space-y-2">
                  {(salesData.topSellingItems || []).slice(0, 5).map(([item, quantity]) => (
                    <div key={item} className="flex justify-between items-center">
                      <span className="text-gray-700">{item}</span>
                      <span className="font-semibold text-gray-900">{quantity} sold</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => exportToCSV(salesData.summary, 'daily-sales-report')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
          )}

          {/* Food Waste Report */}
          {activeReport === 'waste' && wasteData && (
            <div className="space-y-6">
              {/* No Data Message */}
              {wasteData.summary.totalOrders === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <div className="text-yellow-600 text-4xl mb-2">🚫</div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Waste Data Found</h3>
                  <p className="text-yellow-700">
                    No orders found for the selected date range. Create some orders to see waste analysis.
                  </p>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-600">Total Waste Value</p>
                      <p className="text-2xl font-bold text-red-900">${wasteData.summary.totalWasteValue}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-600">Waste Percentage</p>
                      <p className="text-2xl font-bold text-yellow-900">{wasteData.summary.wastePercentage}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingCart className="w-8 h-8 text-gray-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Cancelled Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{wasteData.summary.cancelledOrders}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Wasted Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Most Wasted Items</h4>
                <div className="space-y-2">
                  {(wasteData.topWastedItems || []).slice(0, 5).map(([item, quantity]) => (
                    <div key={item} className="flex justify-between items-center">
                      <span className="text-gray-700">{item}</span>
                      <span className="font-semibold text-red-600">{quantity} wasted</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Recommendations</h4>
                <ul className="space-y-2">
                  {(wasteData.recommendations || []).map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => exportToCSV(wasteData.summary, 'food-waste-report')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
          )}

          {/* Ingredient Forecast Report */}
          {activeReport === 'forecast' && forecastData && (
            <div className="space-y-6">
              {/* No Data Message */}
              {forecastData.summary.totalOrdersAnalyzed === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <div className="text-yellow-600 text-4xl mb-2">🔮</div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Forecast Data Found</h3>
                  <p className="text-yellow-700">
                    No completed orders found for analysis. Complete some orders to see ingredient forecasting.
                  </p>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Orders Analyzed</p>
                      <p className="text-2xl font-bold text-green-900">{forecastData.summary.totalOrdersAnalyzed}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Unique Ingredients</p>
                      <p className="text-2xl font-bold text-blue-900">{forecastData.summary.uniqueIngredients}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Avg Daily Orders</p>
                      <p className="text-2xl font-bold text-purple-900">{forecastData.summary.averageDailyOrders}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Ingredients */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Top Ingredients by Usage</h4>
                <div className="space-y-2">
                  {(forecastData.topIngredients || []).slice(0, 8).map(([ingredient, usage]) => (
                    <div key={ingredient} className="flex justify-between items-center">
                      <span className="text-gray-700">{ingredient}</span>
                      <span className="font-semibold text-gray-900">{usage.toFixed(2)} units</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7-Day Forecast */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">7-Day Ingredient Forecast</h4>
                <div className="space-y-2">
                  {Object.entries(forecastData.forecasts?.next7Days || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([ingredient, forecast]) => (
                    <div key={ingredient} className="flex justify-between items-center">
                      <span className="text-gray-700">{ingredient}</span>
                      <span className="font-semibold text-blue-600">{forecast} units needed</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Recommendations</h4>
                <ul className="space-y-2">
                  {forecastData.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => exportToCSV(forecastData.summary, 'ingredient-forecast-report')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
