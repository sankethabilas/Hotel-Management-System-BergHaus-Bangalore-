'use client';

import React from 'react';
import BannerManagement from '@/components/BannerManagement';

export default function AdminBannersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BannerManagement />
      </div>
    </div>
  );
}
