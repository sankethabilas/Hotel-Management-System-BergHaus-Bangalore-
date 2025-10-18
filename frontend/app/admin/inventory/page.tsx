// app/admin/inventory/page.tsx
"use client";
import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../../components/admin/Navbar";
import StatCardsRow from "../../../components/admin/StatCardsRow";
import MoneyCardsRow from "../../../components/admin/MoneyCardsRow";
import BarChartComponent from "../../../components/admin/BarChartComponent";
import PieChartComponent from "../../../components/admin/PieChartComponent";
import SupplierChartComponent from "../../../components/admin/SupplierChartComponent";
import { getItems } from "../../../lib/inventoryApi";
import { getRequests } from "../../../lib/alertApi";

//  Import jsPDF and autoTable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Types
interface InventoryItem {
  _id: string;
  name?: string;
  itemName?: string;
  quantity: number;
  category: string;
  price: number;
  supplierName?: string;
}

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
}

export default function InventoryDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<StaffRequest[]>([]);
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

  const fetchRequests = async () => {
    try {
      const res = await getRequests();
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  useEffect(() => { 
    fetchItems(); 
    fetchRequests();
  }, []);

  //  Generate Inventory Report
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
      const allocated = (item as any).allocated || 0;
      const damaged = (item as any).damaged || 0;
      const price = item.price || 0;
      const availableStock = quantity - allocated - damaged;
      
      totalInventoryValue += quantity * price;
      totalConsumedValue += (allocated + damaged) * price;
      
      return [
        item.name || item.itemName || "N/A",
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

  //  Generate Staff Requests Report
  const downloadStaffRequestsReport = () => {
    const doc = new jsPDF();
    doc.text("Staff Requests Report", 14, 15);

    const tableData = requests.map((req) => [
      req.staffName,
      req.staffEmail,
      req.itemName,
      req.quantity.toString(),
      req.reason,
      req.category,
      req.concern || "-",
      req.isDone ? "Done" : "Pending",
    ]);

    autoTable(doc, {
      head: [
        [
          "Staff Name",
          "Email",
          "Item",
          "Qty",
          "Reason",
          "Category",
          "Concern",
          "Status",
        ],
      ],
      body: tableData,
      startY: 25,
    });

    doc.save("staff_requests_report.pdf");
  };


  // Derived stats
  const totalProducts = items.length;
  const stocksBelowFive = items.filter(i => {
    const availableStock = (i.quantity || 0) - (((i as any).allocated || 0) + ((i as any).damaged || 0));
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

  // count of unread staff requests 
  const staffRequests = requests.filter(req => !req.isDone).length;

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
    return items
      .filter(it => barFilterCategory === "All" || it.category === barFilterCategory)
      .map(item => ({
        name: item.name || item.itemName || 'Unnamed',
        quantity: item.quantity,
        category: item.category,
        price: item.price
      }));
  }, [items, barFilterCategory]);

  // data for pie chart (sum quantities per category)
  const pieData = useMemo(() => {
    const categories: { Kitchen: number; Housekeeping: number; Maintenance: number } = { 
      Kitchen: 0, 
      Housekeeping: 0, 
      Maintenance: 0 
    };
    for (const it of items) {
      const cat = it.category;
      if (cat === "Kitchen" || cat === "Housekeeping" || cat === "Maintenance") {
        categories[cat] += Number(it.quantity || 0);
      }
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
      entry.itemSet.add(it.name || it.itemName || 'Unnamed');
      entry.totalQuantity += Number(it.quantity || 0);
    }
    return Array.from(map.values()).map(e => ({
      supplier: e.supplier,
      distinctItems: e.itemSet.size,
      totalQuantity: e.totalQuantity
    }));
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar active="dashboard" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Inventory Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Monitor your inventory, suppliers, and staff requests in real-time
          </p>
        </div>

        {/* Stats Cards */}
        <StatCardsRow
          totalProducts={totalProducts}
          stocksBelowFive={stocksBelowFive}
          totalSuppliers={totalSuppliers}
          staffRequests={staffRequests}
        />

        {/* Money Cards */}
        <MoneyCardsRow
          currentMoneyAvailable={currentMoneyAvailable}
          totalInventoryValue={totalInventoryValue}
          daysLeftToMonthEnd={daysLeftToMonthEnd}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar chart with category filter */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Item Levels (by Quantity)</h2>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <select
                  value={barFilterCategory}
                  onChange={(e) => setBarFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <BarChartComponent items={barDataItems} />
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Category Distribution</h2>
            <div className="flex justify-center">
              <PieChartComponent data={pieData} />
            </div>
          </div>

          {/* Supplier chart */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Supplier Analytics</h2>
            <div className="overflow-x-auto">
              <SupplierChartComponent stats={supplierStats} />
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
            <button
              onClick={downloadStaffRequestsReport}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>👥</span>
              <span>Download Staff Requests Report</span>
            </button>
          </div>
        </div>
        {/* Quick Actions Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/admin/inventory/items")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>�</span>
              <span>Manage Inventory Items</span>
            </button>
            <button
              onClick={() => router.push("/admin/inventory/add")}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>➕</span>
              <span>Add New Item</span>
            </button>
            <button
              onClick={() => router.push("/admin/alerts")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>🚨</span>
              <span>Staff Requests & Alerts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}