"use client";
import { useEffect, useState } from "react";
import { getRequests, markRequestDone, deleteRequest, getItems } from "@/lib/api";
import Navbar from "@/components/admin/Navbar";
import Link from "next/link";

export default function AlertsPage() {
  const [requests, setRequests] = useState([]);
  const [items, setItems] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  const fetchRequests = async () => {
    const res = await getRequests();
    setRequests(res.data.requests);
  };

  const fetchItems = async () => {
    try {
      const res = await getItems();
      const allItems = res.data.existingItems || [];
      setItems(allItems);
      // compute low stock value = quantity - (allocated + damaged)
      const critical = allItems
        .map(it => ({
          id: it._id,
          name: it.name,
          safeRemaining: (it.quantity || 0) - ((it.allocated || 0) + (it.damaged || 0)),
          category: it.category,
          supplierName: it.supplierName,
        }))
        .filter(r => r.safeRemaining <= 5);
      setLowStockAlerts(critical);
    } catch (e) {
      console.error("Failed to fetch items", e);
    }
  };

  useEffect(() => { fetchRequests(); fetchItems(); }, []);

  const handleMarkDone = async (id) => {
    await markRequestDone(id);
    fetchRequests();
  };

  const handleDelete = async (id) => {
    await deleteRequest(id);
    fetchRequests();
  };

  return (
    <div>
        <Navbar active="alerts" />
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Low Stock Alerts</h1>

      {/* Low Stock Alerts */}
      <div className="mb-6">
        {lowStockAlerts.length === 0 && (
          <p className="text-sm text-green-600">No critical stock alerts at the moment.</p>
        )}
        {lowStockAlerts.length > 0 && (
          <ul className="space-y-3">
            {lowStockAlerts.map(a => (
              <li key={a.id} className="p-6 rounded border-2 bg-red-600/10 border-red-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[1.1em] text-red-800">{a.name}</p>
                    <p className="text-[0.9em] text-red-700">Remaining usable stock: <span className="font-bold">{a.safeRemaining}</span></p>
                    <p className="text-[0.9em] text-gray-600">Category: {a.category || 'N/A'} {a.supplierName && <>| Supplier: {a.supplierName}</>}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-[0.9em] text-red-700 italic">Auto clears when stock is above 5.</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Staff Requests Table */}
      <h1 className="text-xl font-bold mb-4">Staff Requests</h1>

      <table className="w-full border">
        <thead className="bg-[#FEE3B3]">
          <tr>
            <th className="p-2 border">Alert</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req._id} className="text-left">
              <td className={`p-3 border rounded ${req.isDone ? "bg-gray-200" : "bg-gradient-to-r from-[#FEE3B3] to-white"}`}>
                <strong>{req.staffName}</strong> ({req.staffEmail}) requested <strong>{req.itemName}</strong> × {req.quantity} <br/>
                Reason: {req.reason} | Category: {req.category} <br/>
                {req.concern && <em>Concern: {req.concern}</em>} <br/>
                <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</span>
              </td>
              <td className="p-3 ">
                {!req.isDone && (
                  <button onClick={() => handleMarkDone(req._id)} className="bg-[#2FA0DF] text-white px-2 py-1 rounded mr-2">
                    Mark as Done
                  </button>
                )}
                <button onClick={() => handleDelete(req._id)} className="bg-red-500 text-white px-2 py-1 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
