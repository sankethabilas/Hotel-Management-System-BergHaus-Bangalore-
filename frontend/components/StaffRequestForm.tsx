"use client";
import { useState } from "react";
import { addRequest } from "../lib/alertApi";

interface StaffRequestFormProps {
  onRequestSubmitted?: () => void;
  onClose?: () => void;
}

export default function StaffRequestForm({ onRequestSubmitted, onClose }: StaffRequestFormProps) {
  const [form, setForm] = useState({
    staffName: "",
    staffEmail: "",
    itemName: "",
    quantity: 1,
    reason: "Request a new item",
    category: "Kitchen",
    concern: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!form.staffName.trim()) newErrors.staffName = "Staff name is required";
    if (!form.staffEmail.trim()) newErrors.staffEmail = "Staff email is required";
    if (!form.itemName.trim()) newErrors.itemName = "Item name is required";
    if (form.quantity < 1) newErrors.quantity = "Quantity must be at least 1";
    
    // Email validation
    if (form.staffEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.staffEmail)) {
      newErrors.staffEmail = "Please enter a valid email address";
    }

    // Name validation (no numbers or special characters except spaces, hyphens, and apostrophes)
    if (form.staffName && !/^[a-zA-Z\s'-]+$/.test(form.staffName)) {
      newErrors.staffName = "Please enter a valid name (letters, spaces, hyphens, and apostrophes only)";
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
      await addRequest(form);
      alert("Request submitted successfully!");
      setForm({
        staffName: "",
        staffEmail: "",
        itemName: "",
        quantity: 1,
        reason: "Request a new item",
        category: "Kitchen",
        concern: "",
      });
      if (onRequestSubmitted) onRequestSubmitted();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting request:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit request. Please try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-2xl font-bold">Submit Staff Request</h2>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-blue-100 mt-2">Request items or report issues to the administration</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Staff Information Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Staff Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Staff Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="staffName"
                  value={form.staffName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.staffName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.staffName && <p className="text-red-500 text-sm mt-1">{errors.staffName}</p>}
              </div>

              {/* Staff Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="staffEmail"
                  value={form.staffEmail}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.staffEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.staffEmail && <p className="text-red-500 text-sm mt-1">{errors.staffEmail}</p>}
              </div>
            </div>
          </div>

          {/* Item Information Section */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8-4" />
              </svg>
              Item Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={form.itemName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.itemName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter the item name"
                />
                {errors.itemName && <p className="text-red-500 text-sm mt-1">{errors.itemName}</p>}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter quantity needed"
                />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
              </div>
            </div>
          </div>

          {/* Request Details Section */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Request Details
            </h3>
            <div className="space-y-4">
              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select 
                  name="reason" 
                  value={form.reason} 
                  onChange={handleChange} 
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="Request a new item">Request a new item</option>
                  <option value="Item was damaged">Item was damaged</option>
                  <option value="Item was lost">Item was lost</option>
                  <option value="Replacement needed">Replacement needed</option>
                  <option value="Additional quantity needed">Additional quantity needed</option>
                  <option value="Other">Other</option>
                </select>
                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
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
                  <option value="Kitchen">Kitchen</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Front Desk">Front Desk</option>
                  <option value="Administration">Administration</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Concern */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Concern (Optional)
                </label>
                <textarea
                  name="concern"
                  value={form.concern}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
                  placeholder="Provide any additional details or concerns..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            )}
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
                  Submitting Request...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
