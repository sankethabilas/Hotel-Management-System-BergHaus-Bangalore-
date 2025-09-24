"use client";
import { useState } from "react";
import { addItem } from "../lib/api";

export default function AddItemForm({ onAdded, onClose }) {
  const [form, setForm] = useState({
    name: "",
    quantity: 0,
    imageUrl: "",
    description: "",
    supplierName: "",
    supplierEmail: "",
    category: "", // new field
    price: 0,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addItem(form);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black-50 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add New Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="number"
            name="price"
            placeholder="Unit price (LKR)"
            value={form.price}
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            name="imageUrl"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <select name="category" value={form.category} onChange={handleChange} className="w-full border p-2 rounded" required>
            <option value="">Select Category</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <input
            type="text"
            name="supplierName"
            placeholder="Supplier Name"
            value={form.supplierName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="email"
            name="supplierEmail"
            placeholder="Supplier Email"
            value={form.supplierEmail}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
