import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import FeedbackManagement from './components/feedback/FeedbackManagement';
import LoyaltyProgram from './components/loyalty/LoyaltyProgram';
import OffersManagement from './components/offers/OffersManagement';
import GuestHistory from './components/guests/GuestHistory';
import NotificationCenter from './components/notifications/NotificationCenter';
import FeedbackAnalytics from './components/analytics/FeedbackAnalytics';
import MobileSidebar from './components/layout/MobileSidebar';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      {/* Mobile sidebar */}
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Routes>
            <Route path="/dashboard" element={<ManagerDashboard />} />
            <Route path="/feedback" element={<FeedbackManagement />} />
            <Route path="/loyalty" element={<LoyaltyProgram />} />
            <Route path="/offers" element={<OffersManagement />} />
            <Route path="/guests" element={<GuestHistory />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/analytics" element={<FeedbackAnalytics />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}