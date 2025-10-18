"use client";

import { useState } from 'react';
import { ReservationFilters } from '@/services/reservationService';

interface ReservationFiltersProps {
  filters: ReservationFilters;
  onFilterChange: (filters: Partial<ReservationFilters>) => void;
}

export default function ReservationFiltersComponent({ filters, onFilterChange }: ReservationFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof ReservationFilters, value: string | number) => {
    onFilterChange({ [field]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      page: 1,
      limit: 10,
      status: undefined,
      paymentStatus: undefined,
      startDate: undefined,
      endDate: undefined,
      roomType: undefined,
      search: undefined,
      createdBy: undefined
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.status ||
      filters.paymentStatus ||
      filters.startDate ||
      filters.endDate ||
      filters.roomType ||
      filters.search ||
      filters.createdBy
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? 'Hide' : 'Show'} advanced
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Guest name, email, or ID..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked-in</option>
            <option value="checked-out">Checked-out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus || ''}
            onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Payment Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Type
          </label>
          <select
            value={filters.roomType || ''}
            onChange={(e) => handleInputChange('roomType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Room Types</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
            <option value="presidential">Presidential</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in From
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in To
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Created By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created By
              </label>
              <select
                value={filters.createdBy || ''}
                onChange={(e) => handleInputChange('createdBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sources</option>
                <option value="guest">Guest</option>
                <option value="frontdesk">Front Desk</option>
                <option value="admin">Admin</option>
                <option value="agent">Travel Agent</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div>
          {hasActiveFilters() ? (
            <span className="text-blue-600">Filters applied</span>
          ) : (
            <span>No filters applied</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Per page
            </label>
            <select
              value={filters.limit || 10}
              onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
