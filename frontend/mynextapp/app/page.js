"use client";
import { useEffect, useState } from "react";
import { getItems, updateItem, deleteItem } from "../lib/api";
import AddItemForm from "../components/AddItemForm";
import EditItemForm from "../components/EditItemForm";
import Navbar from "../components/admin/Navbar";
import Link from "next/link";

export default function Page() {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all items from backend
  const fetchItems = async () => {
    const res = await getItems();
    setItems(res.data.existingItems);
  };

  useEffect(() => { 
    fetchItems(); 
  }, []);

  const handleDelete = async (id) => {
    await deleteItem(id);
    fetchItems();
  };

  const handleIncrement = async (id, field) => {
    const item = items.find(i => i._id === id);
    await updateItem(id, { [field]: item[field] + 1 });
    fetchItems();
  };

  const handleDecrement = async (id, field) => {
    const item = items.find(i => i._id === id);
    if (item[field] > 0) {
      await updateItem(id, { [field]: item[field] - 1 });
      fetchItems();
    }
  };

  // Filtered items based on selected category and search term
  const filteredItems = items.filter(item => {
    const matchesCategory = filterCategory === "All" || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <Navbar active="inventory" />
    <div className="p-4 sm:p-6">
      {/* Header + Search + Filter + Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
        <h1 className="text-lg sm:text-xl font-bold">Inventory Items</h1>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search items by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full sm:w-64 text-sm sm:text-base"
          />

          {/* Category Filter Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border p-2 rounded w-full sm:w-auto"
          >
            <option value="All">All</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          {/* Add Item Button */}
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            + Add Item
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full border min-w-[800px]">
          <thead className="bg-[#FEE3B3]">
            <tr>
              <th className="p-1 sm:p-2 border text-xs sm:text-sm">Name</th>
              <th className="p-1 sm:p-2 border text-xs sm:text-sm">Quantity</th>
              <th className="p-1 sm:p-2 border text-xs sm:text-sm">Allocated</th>
              <th className="p-1 sm:p-2 border text-xs sm:text-sm">Damaged</th>
              <th className="p-1 sm:p-2 border text-xs sm:text-sm">Returned</th>
              <th className="p-1 sm:p-2 border text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item._id} className="text-center">
              <td className="border p-1 sm:p-2 flex items-center space-x-2 sm:space-x-3 min-w-[200px]">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 sm:w-20 sm:h-20 object-cover rounded"/>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded" />
                )}
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-xs sm:text-base">
                    <Link href={`/items/${item._id}`} className="text-blue-600 hover:underline">
                      {item.name}
                    </Link>
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    item.quantity === 0 
                      ? 'text-red-600 bg-red-100' 
                      : 'text-green-600 bg-green-100'
                  }`}>
                    {item.quantity === 0 ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>
              </td>

              <td className="border p-2">
                <div className="flex items-center justify-center space-x-1 sm:space-x-3">
                  <button onClick={() => handleDecrement(item._id, "quantity")} className="px-2 sm:px-3 bg-[#2FA0DF] text-white rounded font-bold text-sm sm:text-lg hover:bg-[#006BB8]">-</button>
                  <span className="mx-1 sm:mx-3 text-lg sm:text-xl font-bold">{item.quantity}</span>
                  <button onClick={() => handleIncrement(item._id, "quantity")} className="px-2 sm:px-3 bg-[#2FA0DF] text-white rounded font-bold text-sm sm:text-lg hover:bg-[#006BB8]">+</button>
                </div>
              </td>

              <td className="border p-2">
                <div className="flex items-center justify-center space-x-1 sm:space-x-3">
                  <button onClick={() => handleDecrement(item._id, "allocated")} className="px-2 sm:px-3 bg-[#2FA0DF] text-white rounded font-bold text-sm sm:text-lg hover:bg-[#006BB8]">-</button>
                  <span className="mx-1 sm:mx-3 text-lg sm:text-xl font-bold">{item.allocated}</span>
                  <button onClick={() => handleIncrement(item._id, "allocated")} className="px-2 sm:px-3 bg-[#2FA0DF] text-white rounded font-bold text-sm sm:text-lg hover:bg-[#006BB8]">+</button>
                </div>
              </td>

              <td className="border p-2">
                <div className="flex items-center justify-center space-x-1 sm:space-x-3">
                  <button onClick={() => handleDecrement(item._id, "damaged")} className="px-2 sm:px-3 bg-[#2FA0DF] text-white rounded font-bold text-sm sm:text-lg hover:bg-[#006BB8]">-</button>
                  <span className="mx-1 sm:mx-3 text-lg sm:text-xl font-bold">{item.damaged}</span>
                  <button onClick={() => handleIncrement(item._id, "damaged")} className="px-2 sm:px-3 bg-[#2FA0DF] text-white rounded font-bold text-sm sm:text-lg hover:bg-[#006BB8]">+</button>
                </div>
              </td>

              <td className="border p-2">
                <div className="flex items-center justify-center space-x-1 sm:space-x-3">
                  <button onClick={() => handleDecrement(item._id, "returned")} className="px-2 sm:px-3 bg-[#2FA0DF] text-white rounded font-bold text-sm sm:text-lg hover:bg-[#006BB8]">-</button>
                  <span className="mx-1 sm:mx-3 text-lg sm:text-xl font-bold">{item.returned}</span>
                  <button onClick={() => handleIncrement(item._id, "returned")} className="px-2 sm:px-3 bg-[#2FA0DF] text-white rounded font-bold text-sm sm:text-lg hover:bg-[#006BB8]">+</button>
                </div>
              </td>

              <td className="border p-1 sm:p-2">
                <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                  <button onClick={() => setEditItem(item)} className="px-2 py-1 bg-green-500 text-white rounded text-xs sm:text-sm">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs sm:text-sm">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && <AddItemForm onAdded={fetchItems} onClose={() => setShowAdd(false)} />}
      {editItem && <EditItemForm item={editItem} onUpdated={fetchItems} onClose={() => setEditItem(null)} />}
    </div>
    </div>
  );
}
