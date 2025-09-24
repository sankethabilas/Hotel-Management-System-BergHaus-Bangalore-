// app/admin/dashboard/page.js
"use client";
import { useRouter } from "next/navigation"; //temporary to display button

import { useEffect, useMemo, useState } from "react";
import Navbar from "../../../components/admin/Navbar";
import StatCardsRow from "../../../components/admin/StatCardsRow";
import MoneyCardsRow from "../../../components/admin/MoneyCardsRow";
import BarChartComponent from "../../../components/admin/BarChartComponent";
import PieChartComponent from "../../../components/admin/PieChartComponent";
import SupplierChartComponent from "../../../components/admin/SupplierChartComponent";
import { getItems, getRequests } from "../../../lib/api";

//  Import jsPDF and autoTable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
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
    doc.text("Inventory Items Report", 14, 15);

    const tableData = items.map((item) => [
      item.itemName,
      item.category,
      item.quantity,
      `LKR ${item.price}`,
      item.supplierName || "N/A",
    ]);

    autoTable(doc, {
      head: [["Item Name", "Category", "Quantity", "Price", "Supplier"]],
      body: tableData,
      startY: 25,
    });

    doc.save("inventory_report.pdf");
  };

  //  Generate Staff Requests Report
  const downloadStaffRequestsReport = () => {
    const doc = new jsPDF();
    doc.text("Staff Requests Report", 14, 15);

    const tableData = requests.map((req) => [
      req.staffName,
      req.staffEmail,
      req.itemName,
      req.quantity,
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
  const stocksBelowFive = items.filter(i => i.quantity <= 5).length;

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
    const diff = Math.ceil((lastDay - today) / (1000 * 60 * 60 * 24));
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
      if (categories[cat] === undefined) continue;
      categories[cat] += Number(it.quantity || 0);
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
    <div>
      <Navbar active="dashboard" />
      <div className="max-w-7xl mx-auto p-6">
        {/* Top cards (4) */}
        <StatCardsRow
          totalProducts={totalProducts}
          stocksBelowFive={stocksBelowFive}
          totalSuppliers={totalSuppliers}
          staffRequests={staffRequests}
        />

        {/* Money + other cards (4) */}
        <MoneyCardsRow
          currentMoneyAvailable={currentMoneyAvailable}
          totalInventoryValue={totalInventoryValue}
          daysLeftToMonthEnd={daysLeftToMonthEnd}
        />

        {/* Bar chart with category filter */}
        <div className="mt-6 bg-white rounded shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Item Levels (by Quantity)</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Category:</label>
              <select
                value={barFilterCategory}
                onChange={(e) => setBarFilterCategory(e.target.value)}
                className="border p-1 rounded"
              >
                <option value="All">All</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <BarChartComponent items={barDataItems} />
        </div>

        {/* Pie chart */}
        <div className="mt-6 bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-4">Category Distribution (by Quantity)</h2>
          <PieChartComponent data={pieData} />
        </div>

        {/* Supplier chart */}
        <div className="mt-6 bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-4">Suppliers: Distinct Items & Total Quantity</h2>
          <SupplierChartComponent stats={supplierStats} />
        </div>
      
      {/* Report Download Buttons */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={downloadInventoryReport}
            className="bg-green-600 text-white px-4 rounded py-2"
          >
            Download Inventory Report
          </button>
          <button
            onClick={downloadStaffRequestsReport}
            className="bg-purple-600 text-white px-4 rounded py-2"
          >
            Download Staff Requests Report
          </button>
        </div>
      </div>
      {/* Temporary part. Example existing content */}
      <div className="space-y-4">
        {/*  New Button for Staff Requests */}
        <button
          onClick={() => router.push("/staffRequests")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go to Staff Requests
        </button>
      </div>
    </div>
  );
}
