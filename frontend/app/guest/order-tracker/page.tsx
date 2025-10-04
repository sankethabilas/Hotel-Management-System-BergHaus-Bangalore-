'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { formatCurrency } from '@/utils/currency';
import { 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Truck, 
  XCircle,
  Search,
  ArrowLeft
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    roomNumber?: string;
  };
  items: Array<{
    menuItem: {
      _id: string;
      name: string;
      price: number;
      image?: string;
    };
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  status: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Received', icon: Clock },
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderTrackerPage() {
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get('orderNumber');
  const [orderNumber, setOrderNumber] = useState(orderNumberParam || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (orderNum: string) => {
    if (!orderNum.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/orders/track/${orderNum}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        setError('Order not found');
        setOrder(null);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  useEffect(() => {
    if (orderNumberParam) {
      fetchOrder(orderNumberParam);
    }
  }, [orderNumberParam]);

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'ready': return 'text-green-600 bg-green-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isDelayed = order?.estimatedDelivery && 
    order.status !== 'delivered' && 
    new Date() > new Date(order.estimatedDelivery);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <Link href="/guest/menu" className="flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Search Form */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Track Your Order</h1>
              <form onSubmit={handleSearch} className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Enter your order number (e.g., BH20250120001)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? 'Searching...' : 'Track'}
                </button>
              </form>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Order Details */}
            {order && (
              <div className="space-y-6">
                {/* Order Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
                      <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status === 'cancelled' ? (
                        <XCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </div>

                  {isDelayed && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                      <p className="font-medium">Order Delayed</p>
                      <p className="text-sm">Your order is taking longer than expected. We apologize for the delay.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Customer</p>
                      <p className="font-medium">{order.customerInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{order.customerInfo.phone}</p>
                    </div>
                    {order.customerInfo.roomNumber && (
                      <div>
                        <p className="text-gray-600">Room</p>
                        <p className="font-medium">{order.customerInfo.roomNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Order Progress</h3>
                  
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-6">
                      {statusSteps.map((step, index) => {
                        const currentStatusIndex = getStatusIndex(order.status);
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="relative flex items-start">
                            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-green-100 text-green-600' 
                                : isCurrent
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="ml-4 flex-1">
                              <p className={`font-medium ${
                                isCompleted ? 'text-green-900' : isCurrent ? 'text-blue-900' : 'text-gray-500'
                              }`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {order.status === 'delivered' && order.actualDelivery
                                    ? `Delivered at ${new Date(order.actualDelivery).toLocaleString()}`
                                    : order.estimatedDelivery
                                    ? `Estimated: ${new Date(order.estimatedDelivery).toLocaleString()}`
                                    : 'In progress...'}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.menuItem.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Need Help?</h3>
                  <p className="text-blue-800 mb-4">
                    If you have any questions about your order, please contact our customer service.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/guest/menu"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      Order More Food
                    </Link>
                    <button
                      onClick={() => window.print()}
                      className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Print Receipt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}