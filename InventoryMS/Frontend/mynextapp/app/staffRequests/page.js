"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addRequest } from "@/lib/api";

export default function StaffRequestsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    staffName: "",
    staffEmail: "",
    itemName: "",
    quantity: 1,
    reason: "Request a new item",
    category: "Kitchen",
    concern: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addRequest(form);
    setForm({
      staffName: "",
      staffEmail: "",
      itemName: "",
      quantity: 1,
      reason: "Request a new item",
      category: "Kitchen",
      concern: "",
    });
    alert("Request submitted successfully!");
  };

  return (
    <div className="p-6">
      {/* Top bar with back button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Staff Requests</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Request Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto space-y-4"
      >
        <h2 className="text-xl font-bold mb-4">Request Item</h2>

        <input
          type="text"
          name="staffName"
          placeholder="Staff Name"
          value={form.staffName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="email"
          name="staffEmail"
          placeholder="Staff Email"
          value={form.staffEmail}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="itemName"
          placeholder="Requesting Item Name"
          value={form.itemName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          min="1"
          required
        />

        {/* Reason Dropdown */}
        <select
          name="reason"
          value={form.reason}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option>Request a new item</option>
          <option>Item was damaged</option>
          <option>Other</option>
        </select>

        {/* Staff Category Dropdown */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option>Kitchen</option>
          <option>Housekeeping</option>
          <option>Maintenance</option>
        </select>

        {/* Optional Concern */}
        <textarea
          name="concern"
          placeholder="Any concern (optional)"
          value={form.concern}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
