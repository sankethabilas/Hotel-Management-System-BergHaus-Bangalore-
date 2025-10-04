'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { formatCurrency } from '@/utils/currency';

interface OrderItem {
  menuItem: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
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
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export default function GuestOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [billGenerating, setBillGenerating] = useState<string | null>(null);
  const [billMessages, setBillMessages] = useState<{[key: string]: string}>({});

  // Get guest info from localStorage (you might want to implement proper guest session management)
  const [guestInfo, setGuestInfo] = useState<{name: string, roomNumber: string, phone: string} | null>(null);

  useEffect(() => {
    // Get guest info from localStorage or session
    if (typeof window !== 'undefined') {
      const savedGuestInfo = localStorage.getItem('guestInfo');
      if (savedGuestInfo) {
        setGuestInfo(JSON.parse(savedGuestInfo));
      }
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all orders from the API
      const response = await fetch('http://localhost:5000/api/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Handle orders with null menuItem by providing fallback data
        const validOrders = (data.data || []).map((order: any) => ({
          ...order,
          items: order.items.map((item: any) => {
            if (!item.menuItem) {
              console.warn('Order item with null menuItem found:', item);
              // Provide fallback data for null menuItem
              return {
                ...item,
                menuItem: {
                  _id: 'unknown',
                  name: 'Unknown Item',
                  price: item.price || 0,
                  image: null
                }
              };
            }
            return item;
          })
        }));
        
        setOrders(validOrders);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh orders
        fetchOrders();
        alert('Order cancelled successfully! The cancelled order has been removed from your list.');
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const generateBill = async (orderId: string) => {
    setBillGenerating(orderId);
    setBillMessages(prev => ({ ...prev, [orderId]: '' }));
    
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
        const message = `Bill ${data.data.billNumber} generated successfully!`;
        setBillMessages(prev => ({ ...prev, [orderId]: message }));
        // Open the PDF in a new tab for download
        const pdfUrl = `http://localhost:5000/api/bills/pdf/${data.data.billId}`;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `bill-${data.data.billNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setBillMessages(prev => ({ ...prev, [orderId]: data.message || 'Failed to generate bill' }));
      }
    } catch (error: any) {
      console.error('Error generating bill:', error);
      setBillMessages(prev => ({ ...prev, [orderId]: 'Failed to generate bill. Please try again.' }));
    } finally {
      setBillGenerating(null);
      setTimeout(() => {
        setBillMessages(prev => ({ ...prev, [orderId]: '' }));
      }, 5000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Clock className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customerInfo.roomNumber && order.customerInfo.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    
    // Hide cancelled orders by default unless user specifically filters for them
    const isNotCancelledOrSpecificallyFiltered = order.status !== 'cancelled' || filterStatus === 'cancelled';
    
    return matchesSearch && matchesFilter && isNotCancelledOrSpecificallyFiltered;
  });

  const canCancelOrder = (status: string) => {
    return status === 'pending' || status === 'confirmed';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-gray-600">Track and manage your food orders</p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by order number, name, or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Eye className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No orders match your search criteria.'
                  : 'You haven\'t placed any orders yet.'}
              </p>
              <button
                onClick={() => router.push('/guest/menu')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Room: {order.customerInfo.roomNumber || 'N/A'} • {order.customerInfo.name}</p>
                          <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
                          <p>Payment: {order.paymentMethod} • Total: {formatCurrency(order.totalAmount)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 sm:mt-0 flex gap-2">
                        {canCancelOrder(order.status) && (
                          <button
                            onClick={() => cancelOrder(order._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                          >
                            <X className="w-4 h-4" />
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h4 className="font-medium text-gray-900 mb-3">Order Items:</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                          {item.menuItem?.image && (
                            <img
                              src={`http://localhost:5000${item.menuItem.image}`}
                              alt={item.menuItem.name || 'Menu item'}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900">{item.menuItem?.name || 'Unknown Item'}</h5>
                                <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatCurrency(item.menuItem?.price || 0)}</p>
                                <p className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</p>
                              </div>
                            </div>
                            
                            {/* Customizations */}
                            {item.customization && (
                              <div className="mt-2 p-2 bg-white rounded text-xs border">
                                <div className="font-medium text-gray-700 mb-1">Customizations:</div>
                                {item.customization.portionSize && item.customization.portionSize !== 'regular' && (
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
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => generateBill(order._id)}
                          disabled={billGenerating === order._id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center"
                        >
                          {billGenerating === order._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generating...
                            </>
                          ) : (
                            '📄 Generate Bill'
                          )}
                        </button>
                      </div>
                      {billMessages[order._id] && (
                        <div className={`mt-2 text-sm p-2 rounded ${
                          billMessages[order._id].includes('successfully') 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {billMessages[order._id]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back to Menu */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/guest/menu')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
