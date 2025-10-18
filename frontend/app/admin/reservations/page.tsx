"use client";

import { useState, useEffect } from 'react';
import { reservationService, Reservation, ReservationStats, ReservationFilters } from '@/services/reservationService';
import ReservationStatsComponent from '@/components/reservations/ReservationStats';
import ReservationTable from '@/components/reservations/ReservationTable';
import ReservationFiltersComponent from '@/components/reservations/ReservationFilters';
import ReservationDetailModal from '@/components/reservations/ReservationDetailModal';
import ReservationFormModal from '@/components/reservations/ReservationFormModal';
import CancelReservationModal from '@/components/reservations/CancelReservationModal';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReservationFilters>({
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching reservation data with filters:', filters);

      const [reservationsResponse, statsResponse] = await Promise.all([
        reservationService.getAllReservations(filters),
        reservationService.getReservationStats()
      ]);

      console.log('📊 Reservations response:', reservationsResponse);
      console.log('📈 Stats response:', statsResponse);

      if (reservationsResponse.success) {
        console.log('✅ Reservations data received:', reservationsResponse.data);
        setReservations(reservationsResponse.data.reservations);
        setTotal(reservationsResponse.data.total);
        setTotalPages(reservationsResponse.data.pages);
      } else {
        console.error('❌ Reservations API failed:', reservationsResponse);
      }

      if (statsResponse.success) {
        console.log('✅ Stats data received:', statsResponse.data);
        setStats(statsResponse.data);
      } else {
        console.error('❌ Stats API failed:', statsResponse);
      }
    } catch (err) {
      console.error('💥 Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<ReservationFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setShowFormModal(true);
  };

  const handleCancelReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation? This action cannot be undone.')) {
      return;
    }

    try {
      await reservationService.deleteReservation(id);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error deleting reservation:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete reservation');
    }
  };

  const handleFormSubmit = async (data: Partial<Reservation>) => {
    try {
      if (editingReservation) {
        await reservationService.updateReservation(editingReservation._id, data);
      } else {
        await reservationService.createReservation(data);
      }
      
      setShowFormModal(false);
      setEditingReservation(null);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error saving reservation:', err);
      alert(err instanceof Error ? err.message : 'Failed to save reservation');
    }
  };

  const handleCancelSubmit = async (reason: string) => {
    if (!selectedReservation) return;

    try {
      await reservationService.cancelReservation(selectedReservation._id, reason);
      setShowCancelModal(false);
      setSelectedReservation(null);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert(err instanceof Error ? err.message : 'Failed to cancel reservation');
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export functionality will be implemented');
  };

  if (loading && reservations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reservation Management</h1>
          <p className="mt-2 text-gray-600">Manage hotel reservations, bookings, and guest information</p>
        </div>

        {/* Stats Cards */}
        {stats && <ReservationStatsComponent stats={stats} />}

        {/* Filters */}
        <div className="mb-6">
          <ReservationFiltersComponent
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              setEditingReservation(null);
              setShowFormModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Reservation
          </button>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow">
          <ReservationTable
            reservations={reservations}
            loading={loading}
            onView={handleViewReservation}
            onEdit={handleEditReservation}
            onCancel={handleCancelReservation}
            onDelete={handleDeleteReservation}
            currentPage={filters.page || 1}
            totalPages={totalPages}
            total={total}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Modals */}
        {showDetailModal && selectedReservation && (
          <ReservationDetailModal
            reservation={selectedReservation}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedReservation(null);
            }}
            onEdit={handleEditReservation}
            onCancel={handleCancelReservation}
          />
        )}

        {showFormModal && (
          <ReservationFormModal
            reservation={editingReservation}
            onClose={() => {
              setShowFormModal(false);
              setEditingReservation(null);
            }}
            onSubmit={handleFormSubmit}
          />
        )}

        {showCancelModal && selectedReservation && (
          <CancelReservationModal
            reservation={selectedReservation}
            onClose={() => {
              setShowCancelModal(false);
              setSelectedReservation(null);
            }}
            onSubmit={handleCancelSubmit}
          />
        )}
      </div>
    </div>
  );
}
