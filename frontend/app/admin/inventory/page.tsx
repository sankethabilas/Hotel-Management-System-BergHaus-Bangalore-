"use client";
import { useEffect, useMemo, useState } from "react";
import { getItems, getDashboardStats } from "../../../lib/inventoryApi";
import Link from "next/link";

// Import jsPDF and autoTable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  allocated: number;
  damaged: number;
  returned: number;
  category: string;
  price: number;
  supplierName?: string;
  imageUrl?: string;
}

export default function InventoryDashboardPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [barFilterCategory, setBarFilterCategory] = useState("All");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getItems();
      setItems(res.data.existingItems || []);
    } catch (err) {
      console.error("Failed to fetch items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchItems(); 
  }, []);

  // Generate Inventory Report
  const downloadInventoryReport = () => {
    const doc = new jsPDF();
    
    // Get current month and year
    const currentDate = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    
    // Report header with month
    doc.setFontSize(16);
    doc.text(`Inventory Report - ${currentMonth} ${currentYear}`, 14, 15);
    
    // Calculate totals
    let totalInventoryValue = 0;
    let totalConsumedValue = 0;
    
    const tableData = items.map((item) => {
      const quantity = item.quantity || 0;
      const allocated = item.allocated || 0;
      const damaged = item.damaged || 0;
      const price = item.price || 0;
      const availableStock = quantity - allocated - damaged;
      
      totalInventoryValue += quantity * price;
      totalConsumedValue += (allocated + damaged) * price;
      
      return [
        item.name || "N/A",
        item.category || "N/A",
        quantity,
        allocated,
        damaged,
        availableStock,
        `LKR ${price.toFixed(2)}`,
        `LKR ${(quantity * price).toFixed(2)}`,
        item.supplierName || "N/A",
      ];
    });

    autoTable(doc, {
      head: [["Item Name", "Category", "Total Qty", "Allocated", "Damaged", "Available", "Unit Price", "Total Value", "Supplier"]],
      body: tableData,
      startY: 30,
    });
    
    // Add summary at the end
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Inventory Value: LKR ${totalInventoryValue.toFixed(2)}`, 14, finalY);
    doc.text(`Total Consumed Items Value: LKR ${totalConsumedValue.toFixed(2)}`, 14, finalY + 7);
    doc.text(`Net Available Value: LKR ${(totalInventoryValue - totalConsumedValue).toFixed(2)}`, 14, finalY + 14);

    doc.save(`inventory_report_${currentMonth}_${currentYear}.pdf`);
  };

  // Derived stats
  const totalProducts = items.length;
  const stocksBelowFive = items.filter(i => {
    const availableStock = (i.quantity || 0) - ((i.allocated || 0) + (i.damaged || 0));
    return availableStock <= 5;
  }).length;

  // total suppliers (distinct supplierName, ignoring empty)
  const totalSuppliers = useMemo(() => {
    const set = new Set();
    for (const it of items) {
      if (it.supplierName && it.supplierName.trim()) set.add(it.supplierName.trim());
    }
    return set.size;
  }, [items]);

  // currently available money 
  const currentMoneyAvailable = 35000;

  // total price of all items 
  const totalInventoryValue = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);

  // days left to end of month
  const daysLeftToMonthEnd = useMemo(() => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); // last day of current month
    const diff = Math.ceil((lastDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, []);

  // data for bar chart (filtered by category)
  const barDataItems = useMemo(() => {
    return items.filter(it => barFilterCategory === "All" || it.category === barFilterCategory);
  }, [items, barFilterCategory]);

  // data for pie chart (sum quantities per category)
  const pieData = useMemo(() => {
    const categories = { Kitchen: 0, Housekeeping: 0, Maintenance: 0 };
    for (const it of items) {
      const cat = it.category || "Uncategorized";
      if (categories[cat as keyof typeof categories] === undefined) continue;
      categories[cat as keyof typeof categories] += Number(it.quantity || 0);
    }
    return categories;
  }, [items]);

  // Supplier stats: group by supplierName
  const supplierStats = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const supplier = (it.supplierName || 'Unknown').trim();
      if (!map.has(supplier)) {
        map.set(supplier, { supplier, itemSet: new Set(), totalQuantity: 0 });
      }
      const entry = map.get(supplier);
      entry.itemSet.add(it.name || 'Unnamed');
      entry.totalQuantity += Number(it.quantity || 0);
    }
    return Array.from(map.values()).map((e: any) => ({
      supplier: e.supplier,
      distinctItems: e.itemSet.size,
      totalQuantity: e.totalQuantity
    }));
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Inventory Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Monitor your inventory, suppliers, and stock levels in real-time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{stocksBelowFive}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">LKR {totalInventoryValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Download Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">📊 Generate Reports</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={downloadInventoryReport}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>Download Inventory Report</span>
            </button>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/inventory/items"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>📦</span>
              <span>Manage Items</span>
            </Link>
            <Link
              href="/admin/inventory/add"
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>➕</span>
              <span>Add New Item</span>
            </Link>
            <Link
              href="/admin/inventory/suppliers"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>🏢</span>
              <span>View Suppliers</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
