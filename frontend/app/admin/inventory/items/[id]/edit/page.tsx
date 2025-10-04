"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getItem, updateItem } from "../../../../../../lib/inventoryApi";

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    quantity: 0,
    imageUrl: "",
    description: "",
    supplierName: "",
    supplierEmail: "",
    supplierPhone: "",
    allocated: 0,
    damaged: 0,
    returned: 0,
    category: "",
    price: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await getItem(id as string);
        if (res.data.success) {
          setItem(res.data.item);
          setForm({
            name: res.data.item.name || "",
            quantity: res.data.item.quantity || 0,
            imageUrl: res.data.item.imageUrl || "",
            description: res.data.item.description || "",
            supplierName: res.data.item.supplierName || "",
            supplierEmail: res.data.item.supplierEmail || "",
            supplierPhone: res.data.item.supplierPhone || "",
            allocated: res.data.item.allocated || 0,
            damaged: res.data.item.damaged || 0,
            returned: res.data.item.returned || 0,
            category: res.data.item.category || "",
            price: res.data.item.price ?? 0,
          });
        }
      } catch (err) {
        console.error("Error fetching item:", err);
      }
    }
    fetchItem();
  }, [id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!form.name.trim()) newErrors.name = "Item name is required";
    if (!form.category) newErrors.category = "Category is required";
    if (form.quantity < 0) newErrors.quantity = "Quantity cannot be negative";
    if (form.price < 0) newErrors.price = "Price cannot be negative";
    if (form.allocated < 0) newErrors.allocated = "Allocated quantity cannot be negative";
    if (form.damaged < 0) newErrors.damaged = "Damaged quantity cannot be negative";
    if (form.returned < 0) newErrors.returned = "Returned quantity cannot be negative";
    
    // Name validation - only letters and spaces
    if (form.name && !/^[a-zA-Z\s]+$/.test(form.name)) {
      newErrors.name = "Item name should contain only letters and spaces";
    }

    // Supplier name validation - only letters if provided
    if (form.supplierName && !/^[a-zA-Z\s]+$/.test(form.supplierName)) {
      newErrors.supplierName = "Supplier name should contain only letters and spaces";
    }

    // Email validation if provided
    if (form.supplierEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supplierEmail)) {
      newErrors.supplierEmail = "Please enter a valid email address";
    }

    // Phone validation if provided
    if (form.supplierPhone && !/^[0-9+\-\s()]+$/.test(form.supplierPhone)) {
      newErrors.supplierPhone = "Please enter a valid phone number";
    }

    // URL validation
    if (form.imageUrl && !/^https?:\/\/.+/.test(form.imageUrl)) {
      newErrors.imageUrl = "Please enter a valid URL (starting with http:// or https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateItem(id as string, form);
      router.push(`/admin/inventory/items/${id}`);
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return <p className="p-4">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Edit Item: {item.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Update the details below to modify this inventory item
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter item name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="category" 
                    value={form.category} 
                    onChange={handleChange} 
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
              </div>
            </div>

            {/* Inventory Details Section */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Inventory Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter total quantity"
                  />
                  {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price (LKR)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setForm({ ...form, price: value });
                      if (errors.price && value >= 0) {
                        setErrors({ ...errors, price: "" });
                      }
                    }}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter unit price"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
              </div>
            </div>

            {/* Status Tracking Section */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Status Tracking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Allocated */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allocated Quantity
                  </label>
                  <input
                    type="number"
                    name="allocated"
                    value={form.allocated}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.allocated ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Currently allocated"
                  />
                  {errors.allocated && <p className="text-red-500 text-sm mt-1">{errors.allocated}</p>}
                </div>

                {/* Damaged */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damaged Quantity
                  </label>
                  <input
                    type="number"
                    name="damaged"
                    value={form.damaged}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.damaged ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Damaged items"
                  />
                  {errors.damaged && <p className="text-red-500 text-sm mt-1">{errors.damaged}</p>}
                </div>

                {/* Returned */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Returned Quantity
                  </label>
                  <input
                    type="number"
                    name="returned"
                    value={form.returned}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.returned ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Returned items"
                  />
                  {errors.returned && <p className="text-red-500 text-sm mt-1">{errors.returned}</p>}
                </div>
              </div>
            </div>

            {/* Item Details Section */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Item Details
              </h3>
              <div className="space-y-4">
                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.imageUrl ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
                    placeholder="Enter item description (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Supplier Information Section */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Supplier Information (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supplier Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    name="supplierName"
                    value={form.supplierName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.supplierName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter supplier name"
                  />
                  {errors.supplierName && <p className="text-red-500 text-sm mt-1">{errors.supplierName}</p>}
                </div>

                {/* Supplier Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Email
                  </label>
                  <input
                    type="email"
                    name="supplierEmail"
                    value={form.supplierEmail}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.supplierEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="supplier@example.com"
                  />
                  {errors.supplierEmail && <p className="text-red-500 text-sm mt-1">{errors.supplierEmail}</p>}
                </div>

                {/* Supplier Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Phone
                  </label>
                  <input
                    type="text"
                    name="supplierPhone"
                    value={form.supplierPhone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.supplierPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+94 77 123 4567"
                  />
                  {errors.supplierPhone && <p className="text-red-500 text-sm mt-1">{errors.supplierPhone}</p>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push(`/admin/inventory/items/${id}`)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Item...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
