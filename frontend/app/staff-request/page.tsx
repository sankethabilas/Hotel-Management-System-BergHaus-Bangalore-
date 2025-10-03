"use client";
import { useState } from "react";
import StaffRequestForm from "../../components/StaffRequestForm";

export default function StaffRequestPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Staff Request System</h1>
          <p className="text-lg text-gray-600 mb-6">
            Submit requests for items or report issues to the administration
          </p>
          
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Submit New Request
          </button>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Item Requests</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Request new items for your department or report damaged equipment that needs replacement.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Quick Response</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Your requests will be reviewed by the administration and processed as quickly as possible.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Track Status</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Monitor the status of your requests and receive updates on their progress.
            </p>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Guidelines</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <p>Provide accurate information about the items you need, including quantity and category.</p>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <p>Select the appropriate reason for your request (new item, damaged item, or other).</p>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <p>Include any additional concerns or special requirements in the concern field.</p>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <p>Ensure your contact information is correct for follow-up communications.</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need immediate assistance? Contact the administration at{" "}
            <a href="mailto:admin@berghausbungalow.com" className="text-blue-600 hover:text-blue-800 font-medium">
              admin@berghausbungalow.com
            </a>
          </p>
        </div>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <StaffRequestForm
          onRequestSubmitted={() => setShowForm(false)}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
