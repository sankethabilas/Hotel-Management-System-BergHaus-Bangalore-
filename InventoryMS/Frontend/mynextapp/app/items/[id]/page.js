"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/admin/Navbar";
import Link from "next/link";

export default function ItemOverview() {
  const { id } = useParams(); // get item ID from URL
  const [item, setItem] = useState(null);

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await fetch(`http://localhost:8000/getOneitem/${id}`);
        const data = await res.json();
        if (data.success) {
          setItem(data.item);
        }
      } catch (err) {
        console.error("Error fetching item:", err);
      }
    }
    fetchItem();
  }, [id]);

  if (!item) return <p className="p-4">Loading...</p>;

  return (
    <div>
        <Navbar active="inventory" />
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header part */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">{item.name}</h1>
        <p className="text-gray-600 text-sm sm:text-base">Detailed inventory overview and management information</p>
        <div className="mt-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium">
            ← Back to Inventory
          </Link>
        </div>
      </div>

      {/* Main Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        
        {/* Left Column - Image and Basic Info */}
        <div className="space-y-6">
          {/* Image of the item */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-12">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-64 sm:h-80 object-cover"
                />
              ) : (
                <div className="w-full h-64 sm:h-80 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
            </div>
          </div>

          {/* Item Category and Basic Details */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Item Details</h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="font-medium text-gray-600">Category:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mt-1 sm:mt-0">
                  {item.category}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="font-medium text-gray-600">Item ID:</span>
                <span className="text-gray-800 font-mono text-sm mt-1 sm:mt-0">{item._id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          
          {/* Stock Status Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-lg p-4 sm:p-6 border border-blue-200">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4">Current Stock Status</h2>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">{item.quantity}</div>
              <p className="text-blue-700 font-medium">Units Available in Stock</p>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-lg p-4 sm:p-6 border border-green-200">
            <h2 className="text-lg sm:text-xl font-semibold text-green-800 mb-4">Pricing Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-900">
                  LKR {item.price ? item.price.toLocaleString() : '0'}
                </div>
                <p className="text-green-700 text-sm">Price per Unit</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-900">
                  LKR {item.price && item.quantity ? (item.price * item.quantity).toLocaleString() : '0'}
                </div>
                <p className="text-green-700 text-sm">Total Stock Value</p>
              </div>
            </div>
          </div>

          {/* Item Status Grid */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Item Status Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200 text-center">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">Allocated</h3>
                <p className="text-xl sm:text-2xl font-bold text-yellow-900">{item.allocated || 0}</p>
                <p className="text-xs text-yellow-700">Currently in use</p>
              </div>
              
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200 text-center">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Damaged</h3>
                <p className="text-xl sm:text-2xl font-bold text-red-900">{item.damaged || 0}</p>
                <p className="text-xs text-red-700">Unusable items</p>
              </div>
              
              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200 text-center">
                <h3 className="text-sm font-semibold text-purple-800 mb-1">Returned</h3>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">{item.returned || 0}</p>
                <p className="text-xs text-purple-700">Back in stock</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description part */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border border-amber-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-amber-800 mb-4">Item Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {item.description || 'No description available for this item. Please contact the administrator to add item details.'}
            </p>
          </div>
        </div>
      </div>

      {/* Supplier Information part */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border border-indigo-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-800 mb-6">Supplier Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">Supplier Name</label>
                <p className="text-gray-800 font-semibold text-base sm:text-lg">
                  {item.supplierName || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">Contact Email</label>
                <p className="text-gray-800">
                  {item.supplierEmail ? (
                    <a href={`mailto:${item.supplierEmail}`} className="text-indigo-600 hover:text-indigo-800 underline">
                      {item.supplierEmail}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-800 mb-2">Supply Partnership</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                This item is supplied by our trusted partner. For any supply-related inquiries, 
                reorders, or quality concerns, please contact the supplier directly using the 
                information provided above.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href={`/items/${item._id}/edit`}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-center transition duration-300"
        >
          Edit Item Details
        </Link>
        <Link 
          href="/"
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold text-center transition duration-300"
        >
          Back to Inventory
        </Link>
      </div>
    </div>
    </div>
  );
}