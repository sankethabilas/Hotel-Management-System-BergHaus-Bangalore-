"use client";
import { useEffect, useState } from "react";
import { getRequests, markRequestDone, deleteRequest, getItems } from "../../../lib/alertApi";
import Link from "next/link";
import Navbar from "../../../components/admin/Navbar";

interface StaffRequest {
  _id: string;
  staffName: string;
  staffEmail: string;
  itemName: string;
  quantity: number;
  reason: string;
  category: string;
  concern?: string;
  isDone: boolean;
  createdAt: string;
}

interface LowStockAlert {
  id: string;
  name: string;
  safeRemaining: number;
  category: string;
  supplierName?: string;
}

export default function AlertsPage() {
  const [requests, setRequests] = useState<StaffRequest[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await getRequests();
      setRequests(res.data.requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await getItems();
      const allItems = res.data.existingItems || [];
      setItems(allItems);
      // compute low stock value = quantity - (allocated + damaged)
      const critical = allItems
        .map((it: any) => ({
          id: it._id,
          name: it.name,
          safeRemaining: (it.quantity || 0) - ((it.allocated || 0) + (it.damaged || 0)),
          category: it.category,
          supplierName: it.supplierName,
        }))
        .filter((r: LowStockAlert) => r.safeRemaining <= 5);
      setLowStockAlerts(critical);
    } catch (e) {
      console.error("Failed to fetch items", e);
    }
  };

  useEffect(() => { 
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchItems()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleMarkDone = async (id: string) => {
    try {
      await markRequestDone(id);
      fetchRequests();
    } catch (error) {
      console.error("Error marking request as done:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRequest(id);
      fetchRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar active="alerts" />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading alerts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="alerts" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Alert Management</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Monitor low stock alerts and staff requests</p>
        </div>

        {/* Low Stock Alerts Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Low Stock Alerts
              </h2>
            </div>
            <div className="p-6">
              {lowStockAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-600 font-medium">No critical stock alerts at the moment.</p>
                  <p className="text-gray-500 text-sm mt-1">All inventory items are well stocked.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 rounded-lg border-2 bg-red-50 border-red-200 hover:bg-red-100 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-red-800">{alert.name}</h3>
                          <p className="text-red-700 mt-1">
                            Remaining usable stock: <span className="font-bold text-xl">{alert.safeRemaining}</span>
                          </p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span>Category: <span className="font-medium">{alert.category || 'N/A'}</span></span>
                            {alert.supplierName && (
                              <span>Supplier: <span className="font-medium">{alert.supplierName}</span></span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-0 sm:ml-4">
                          <Link 
                            href="/admin/inventory/items"
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Manage Inventory
                          </Link>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-red-600 italic">
                        Auto clears when stock is above 5 units.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Staff Requests Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Staff Requests
            </h2>
          </div>
          <div className="overflow-x-auto">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 font-medium">No staff requests at the moment.</p>
                <p className="text-gray-400 text-sm mt-1">Staff requests will appear here when submitted.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{request.staffName}</span>
                            <span className="text-sm text-gray-500">({request.staffEmail})</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Requested:</span> {request.itemName} × {request.quantity}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Reason:</span> {request.reason}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Category:</span> {request.category}
                          </div>
                          {request.concern && (
                            <div className="text-sm">
                              <span className="font-medium">Concern:</span> <em className="text-gray-600">{request.concern}</em>
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.isDone 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.isDone ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {!request.isDone && (
                            <button
                              onClick={() => handleMarkDone(request._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mark Done
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(request._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/admin/inventory/items"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8-4" />
            </svg>
            Manage Inventory
          </Link>
          <Link
            href="/admin/staff"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Manage Staff
          </Link>
        </div>
      </div>
    </div>
  );
}
