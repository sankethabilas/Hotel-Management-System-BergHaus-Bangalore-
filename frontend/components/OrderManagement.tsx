'use client';

import React, { useState, useEffect } from 'react';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: string;
  preparationTime: number;
  calories?: number;
  isPopular: boolean;
  discount: number;
  tags: string[];
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  price: number;
  totalPrice: number;
  customization?: {
    dietaryRestrictions: string[];
    portionSize: 'small' | 'regular' | 'large';
    modifications: string[];
    specialInstructions: string;
    cookingPreferences: string[];
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    roomNumber?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  paymentMethod: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  notes?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();
      
      if (data.success && data.data) {
        setOrders(data.data);
      } else {
        setError('Failed to load orders');
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Order status updated successfully!');
        await loadOrders();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update order status');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const generateBill = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bills/generate/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceChargePercentage: 10,
          vatPercentage: 15,
          discount: 0,
          discountReason: '',
          notes: ''
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Bill ${data.data.billNumber} generated successfully!`);
        // Open PDF in new tab
        window.open(`http://localhost:5000/api/bills/pdf/${data.data.billId}`, '_blank');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to generate bill');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error: any) {
      console.error('Error generating bill:', error);
      setError('Failed to generate bill');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🍽️';
      case 'delivered': return '🚚';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Manage customer orders and track their status</p>
        </div>
        <button
          onClick={loadOrders}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}

      {/* Orders Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">📋</span>
                        {order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.customerInfo.name}</div>
                        <div className="text-gray-500">{order.customerInfo.email}</div>
                        <div className="text-gray-500">📞 {order.customerInfo.phone}</div>
                        <div className="text-gray-500">🏠 Room: {order.customerInfo.roomNumber || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1 max-w-xs">
                        {order.items.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium">{item.menuItem?.name || 'Unknown Item'}</span>
                                <div className="text-right">
                                  <div className="text-gray-500">x{item.quantity}</div>
                                  <div className="font-medium">{formatCurrency(item.totalPrice)}</div>
                                </div>
                              </div>
                              
                              {/* Display Customizations */}
                              {item.customization && (
                                <div className="mt-2 p-2 bg-white rounded text-xs border">
                                  <div className="font-medium text-gray-700 mb-1">Customizations:</div>
                                  
                                  {item.customization.portionSize !== 'regular' && (
                                    <div className="text-gray-600">• Portion: {item.customization.portionSize}</div>
                                  )}
                                  
                                  {item.customization.dietaryRestrictions && item.customization.dietaryRestrictions.length > 0 && (
                                    <div className="text-gray-600">• Dietary: {item.customization.dietaryRestrictions.join(', ')}</div>
                                  )}
                                  
                                  {item.customization.modifications && item.customization.modifications.length > 0 && (
                                    <div className="text-gray-600">• Modifications: {item.customization.modifications.join(', ')}</div>
                                  )}
                                  
                                  {item.customization.specialInstructions && (
                                    <div className="text-gray-600">• Special Instructions: {item.customization.specialInstructions}</div>
                                  )}
                                </div>
                              )}
                            </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCurrency(order.totalAmount)}</div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(order.subtotal)} + {formatCurrency(order.tax)} tax + {formatCurrency(order.serviceCharge)} service
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(order.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="confirmed">✅ Confirmed</option>
                        <option value="preparing">👨‍🍳 Preparing</option>
                        <option value="ready">🍽️ Ready</option>
                        <option value="delivered">🚚 Delivered</option>
                        <option value="completed">✅ Completed</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                      <button
                        onClick={() => generateBill(order._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                        title="Generate Bill"
                      >
                        📄 Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Orders will appear here when customers place them.</p>
            </div>
          )}
        </div>
      )}

      {/* Order Statistics */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                <div className="text-sm text-gray-500">Total Orders</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏳</div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-2xl mr-3">👨‍🍳</div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {orders.filter(o => o.status === 'preparing').length}
                </div>
                <div className="text-sm text-gray-500">Preparing</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🍽️</div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'ready').length}
                </div>
                <div className="text-sm text-gray-500">Ready</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
