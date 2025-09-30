import React, { useState } from 'react';
import LoyaltyDashboard from './LoyaltyDashboard';
import EnrollmentForm from './EnrollmentForm';
import PointsTracker from './PointsTracker';
const LoyaltyProgram = () => {
  const [view, setView] = useState('dashboard'); // dashboard, enrollment, points
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Loyalty Program</h1>
        <div className="flex space-x-3">
          <button onClick={() => setView('enrollment')} className="bg-navy-blue hover:bg-navy-blue-dark text-white py-2 px-4 rounded-md text-sm">
            Enroll New Guest
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex space-x-4">
          <button onClick={() => setView('dashboard')} className={`px-4 py-2 text-sm font-medium rounded-md ${view === 'dashboard' ? 'bg-navy-blue text-white' : 'text-gray-500 hover:text-gray-700 bg-white'}`}>
            Loyalty Dashboard
          </button>
          <button onClick={() => setView('points')} className={`px-4 py-2 text-sm font-medium rounded-md ${view === 'points' ? 'bg-navy-blue text-white' : 'text-gray-500 hover:text-gray-700 bg-white'}`}>
            Points Management
          </button>
        </div>
      </div>
      {view === 'dashboard' && <LoyaltyDashboard onEnrollNew={() => setView('enrollment')} />}
      {view === 'enrollment' && <EnrollmentForm onSubmit={() => setView('dashboard')} onCancel={() => setView('dashboard')} />}
      {view === 'points' && <PointsTracker />}
    </div>;
};
export default LoyaltyProgram;