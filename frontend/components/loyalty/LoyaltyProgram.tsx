'use client';

import React, { useState, useEffect } from 'react';
import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';
import EnrollmentForm from '@/components/loyalty/EnrollmentForm';
import PointsTracker from '@/components/loyalty/PointsTracker';
import RewardsCatalog from '@/components/loyalty/RewardsCatalog';
import AutomatedRules from '@/components/loyalty/AutomatedRules';
import loyaltyService from '@/services/loyaltyService';

interface LoyaltyMember {
  _id: string;
  guestId: string;
  guestName?: string;
  email?: string;
  tier?: string;
  points?: number;
  status?: string;
  enrolledDate?: string;
  userId?: {
    _id: string;
  } | string;
}

const LoyaltyProgram: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'enrollment' | 'points' | 'rewards' | 'rules'>('dashboard');
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all loyalty members on mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loyaltyService.getAllMembers();
      setMembers(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching loyalty members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollGuest = async (userId: string, initialPoints: number) => {
    try {
      setLoading(true);
      setError(null);
      await loyaltyService.enrollGuest(userId, initialPoints);
      await fetchMembers(); // Refresh the list
      setView('dashboard');
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      console.error('Error enrolling guest:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePoints = async (guestId: string, points: number) => {
    try {
      setLoading(true);
      setError(null);
      await loyaltyService.updatePoints(guestId, points);
      await fetchMembers(); // Refresh the list
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating points:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (guestId: string) => {
    if (!window.confirm('Are you sure you want to remove this member from the loyalty program?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await loyaltyService.deleteMember(guestId);
      await fetchMembers(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting member:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Loyalty Program</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setView('dashboard')} 
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              view === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-500 hover:text-gray-700 bg-white'
            }`}
          >
            Loyalty Dashboard
          </button>
          <button 
            onClick={() => setView('points')} 
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              view === 'points' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-500 hover:text-gray-700 bg-white'
            }`}
          >
            Points Management
          </button>
          <button 
            onClick={() => setView('rewards')} 
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              view === 'rewards' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-500 hover:text-gray-700 bg-white'
            }`}
          >
            Rewards Catalog
          </button>
          <button 
            onClick={() => setView('rules')} 
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              view === 'rules' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-500 hover:text-gray-700 bg-white'
            }`}
          >
            Automated Rules
          </button>
        </div>
      </div>

      {view === 'dashboard' && (
        <LoyaltyDashboard 
          members={members}
          loading={loading}
          onEnrollNew={() => setView('enrollment')}
          onDeleteMember={handleDeleteMember}
        />
      )}
      
      {view === 'enrollment' && (
        <EnrollmentForm 
          onSubmit={handleEnrollGuest}
          onCancel={() => setView('dashboard')}
          enrolledMembers={members}
        />
      )}
      
      {view === 'points' && (
        <PointsTracker 
          members={members}
          onUpdatePoints={handleUpdatePoints}
        />
      )}

      {view === 'rewards' && (
        <RewardsCatalog />
      )}

      {view === 'rules' && (
        <AutomatedRules />
      )}
    </div>
  );
};

export default LoyaltyProgram;
