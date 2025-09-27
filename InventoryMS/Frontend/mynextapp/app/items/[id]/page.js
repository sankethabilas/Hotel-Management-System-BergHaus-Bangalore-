"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/admin/Navbar";
import Link from "next/link";

export default function ItemOverview() {
  const { id } = useParams(); // get item ID from URL
  const [item, setItem] = useState(null);
  const [isSupplierExpanded, setIsSupplierExpanded] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: ''
  });
  const [emailSending, setEmailSending] = useState(false);

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

  const handleEmailChange = (e) => {
    setEmailForm({ ...emailForm, [e.target.name]: e.target.value });
  };

  const handleSendEmail = async () => {
    if (!item.supplierEmail || !emailForm.subject || !emailForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    setEmailSending(true);
    
    try {
      // Using mailto as a fallback - this will open the user's default email client
      const mailtoLink = `mailto:${item.supplierEmail}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.message)}%0D%0A%0D%0ASent from: admin@gmail.com`;
      window.location.href = mailtoLink;
      
      // Reset form and close modal
      setEmailForm({ subject: '', message: '' });
      setShowEmailModal(false);
      
      // Show success alert message
      alert('Email client opened successfully! Please send the email from your email application.');
    } catch (error) {
      console.error('Error opening email client:', error);
      alert('Error opening email client. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };

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

      {/* Supplier Information part which is Expandable */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-lg border border-indigo-200 overflow-hidden">
          {/* Supplier's Header - Always Visible */}
          <div 
            className="p-4 sm:p-6 cursor-pointer hover:bg-indigo-100 transition-colors duration-200"
            onClick={() => setIsSupplierExpanded(!isSupplierExpanded)}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold text-indigo-800">
                Supplier Information
              </h2>
              <div className="flex items-center space-x-2">
                <svg 
                  className={`w-6 h-6 text-indigo-600 transform transition-transform duration-200 ${isSupplierExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* Basic supplier info - always visible */}
            <div className="mt-2">
              <p className="text-indigo-700 font-medium">
                {item.supplierName || 'Not specified'} 
                {item.supplierEmail && (
                  <span className="text-indigo-600 ml-2">({item.supplierEmail})</span>
                )}
              </p>
            </div>
          </div>

          {/* Expanded Content */}
          {isSupplierExpanded && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-indigo-200 bg-white/30">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Supplier Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Supplier Name</label>
                    <p className="text-gray-800 font-semibold text-base sm:text-lg bg-white rounded-lg p-3 border">
                      {item.supplierName || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Contact Email</label>
                    <p className="text-gray-800 bg-white rounded-lg p-3 border">
                      {item.supplierEmail ? (
                        <a href={`mailto:${item.supplierEmail}`} className="text-indigo-600 hover:text-indigo-800 underline">
                          {item.supplierEmail}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                  
                  {/* Contact Actions */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-indigo-700 mb-2">Quick Actions</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {item.supplierEmail && (
                        <>
                          <button
                            onClick={() => setShowEmailModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Compose Email
                          </button>
                          <a 
                            href={`mailto:${item.supplierEmail}`}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm text-center transition-colors duration-200 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Quick Email
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Partnership Info */}
                <div className="bg-white/70 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Supply Partnership
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    This item is supplied by our trusted partner. For any supply-related inquiries, 
                    reorders, or quality concerns, please contact the supplier directly.
                  </p>
                  
                  {/* Partnership Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs text-green-600 font-medium">Current Stock</p>
                      <p className="text-lg font-bold text-green-800">{item.quantity} units</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium">Stock Value</p>
                      <p className="text-lg font-bold text-blue-800">
                        LKR {item.price && item.quantity ? (item.price * item.quantity).toLocaleString() : '0'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Compose Email
                </h3>
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Email Details */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm">
                    <p><span className="font-medium">From:</span> admin@gmail.com</p>
                    <p><span className="font-medium">To:</span> {item.supplierEmail}</p>
                    <p><span className="font-medium">Item:</span> {item.name}</p>
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={emailForm.subject}
                    onChange={handleEmailChange}
                    placeholder={`Inquiry about ${item.name}`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    name="message"
                    value={emailForm.message}
                    onChange={handleEmailChange}
                    placeholder={`Hello,\n\nI am writing regarding the item "${item.name}" that you supply to our hotel.\n\nBest regards,\nHotel Administration`}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending || !emailForm.subject || !emailForm.message}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    {emailSending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Opening Email Client...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Email
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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