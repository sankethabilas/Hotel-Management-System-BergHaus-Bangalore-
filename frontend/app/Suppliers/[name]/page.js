"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/admin/Navbar";
import Link from "next/link";

export default function SupplierDetail() {
  const { name } = useParams(); // get supplier name from URL
  const [supplier, setSupplier] = useState(null);
  const [items, setItems] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: ''
  });
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    async function fetchSupplierData() {
      try {
        const decodedName = decodeURIComponent(name);
        
        // Fetch all items to find items supplied by this supplier
        const res = await fetch(`http://localhost:8000/getItems`);
        const data = await res.json();
        
        if (data.success) {
          // Filter items by supplier name
          const supplierItems = data.existingItems.filter(item => 
            item.supplierName && item.supplierName.toLowerCase() === decodedName.toLowerCase()
          );
          
          setItems(supplierItems);
          
          // Get supplier details from the first item (since all items from same supplier should have same details)
          if (supplierItems.length > 0) {
            const firstItem = supplierItems[0];
            setSupplier({
              name: firstItem.supplierName,
              email: firstItem.supplierEmail,
              phone: firstItem.supplierPhone
            });
          }
        }
      } catch (err) {
        console.error("Error fetching supplier data:", err);
      }
    }
    fetchSupplierData();
  }, [name]);

  const handleEmailChange = (e) => {
    setEmailForm({ ...emailForm, [e.target.name]: e.target.value });
  };

  const handleSendEmail = async () => {
    if (!supplier?.email || !emailForm.subject || !emailForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    setEmailSending(true);
    
    try {
      // Using mailto as a fallback - this will open the user's default email client
      const mailtoLink = `mailto:${supplier.email}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.message)}%0D%0A%0D%0ASent from: admin@gmail.com`;
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

  const calculateTotalValue = () => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity || 0);
    }, 0);
  };

  const calculateTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (!supplier && items.length === 0) {
    return (
      <div>
        <Navbar active="inventory" />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Supplier Not Found</h1>
            <p className="text-gray-600 mb-4">No items found for supplier: {decodeURIComponent(name)}</p>
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar active="inventory" />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            {supplier?.name || decodeURIComponent(name)}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Supplier Details and Supply Information</p>
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium">
              ← Back to Inventory
            </Link>
          </div>
        </div>

        {/* Supplier Information Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow-lg p-6 mb-8 border border-indigo-200">
          <h2 className="text-xl font-semibold text-indigo-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">Supplier Name</label>
                <p className="text-gray-800 font-semibold bg-white rounded-lg p-3 border">
                  {supplier?.name || 'Not specified'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">Email Address</label>
                <p className="text-gray-800 bg-white rounded-lg p-3 border">
                  {supplier?.email ? (
                    <a href={`mailto:${supplier.email}`} className="text-indigo-600 hover:text-indigo-800 underline">
                      {supplier.email}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">Phone Number</label>
                <p className="text-gray-800 bg-white rounded-lg p-3 border">
                  {supplier?.phone || 'Not provided'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                {supplier?.email && (
                  <>
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Compose Email
                    </button>
                    
                    <a 
                      href={`mailto:${supplier.email}`}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Quick Email
                    </a>
                  </>
                )}
              </div>

              {/* Supply Statistics */}
              <div className="mt-6 pt-4 border-t border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-3">Supply Statistics</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-xs text-green-600 font-medium">Items Supplied</p>
                    <p className="text-lg font-bold text-green-800">{items.length}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">Total Units</p>
                    <p className="text-lg font-bold text-blue-800">{calculateTotalItems()}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium">Total Value</p>
                    <p className="text-lg font-bold text-purple-800">
                      LKR {calculateTotalValue().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplied Items */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Supplied Items ({items.length})
          </h2>

          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">Item</th>
                    <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">Category</th>
                    <th className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-700">Quantity</th>
                    <th className="border border-gray-200 p-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                    <th className="border border-gray-200 p-3 text-right text-sm font-medium text-gray-700">Total Value</th>
                    <th className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-3">
                        <div className="flex items-center space-x-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded"/>
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <Link href={`/items/${item._id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-500">{item.description?.slice(0, 50)}{item.description?.length > 50 ? '...' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-200 p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {item.category}
                        </span>
                      </td>
                      <td className="border border-gray-200 p-3 text-center font-semibold">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-200 p-3 text-right font-semibold">
                        LKR {item.price ? item.price.toLocaleString() : '0'}
                      </td>
                      <td className="border border-gray-200 p-3 text-right font-semibold">
                        LKR {item.price && item.quantity ? (item.price * item.quantity).toLocaleString() : '0'}
                      </td>
                      <td className="border border-gray-200 p-3 text-center">
                        <Link 
                          href={`/items/${item._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500">No items found for this supplier</p>
            </div>
          )}
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
                      <p><span className="font-medium">To:</span> {supplier?.email}</p>
                      <p><span className="font-medium">Supplier:</span> {supplier?.name}</p>
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
                      placeholder={`Business inquiry - ${supplier?.name}`}
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
                      placeholder={`Hello ${supplier?.name},\n\nI hope this email finds you well. I am writing to discuss our ongoing supply relationship and would like to address a few items.\n\nBest regards,\nHotel Administration`}
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
        <div className="flex justify-center">
          <Link 
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-300"
          >
            Back to Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}