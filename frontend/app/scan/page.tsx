'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AttendanceScanner from '@/components/AttendanceScanner';
import Link from 'next/link';

function ScanContent() {
  const searchParams = useSearchParams();
  const qrId = searchParams.get('qrId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-blue-600">
            Berghaus Bungalow
          </h1>
          <p className="text-lg text-gray-600">Staff Attendance System</p>
          <p className="text-sm text-gray-500 mt-2">
            Mark your check-in and check-out times
          </p>
        </div>
        
        <AttendanceScanner qrId={qrId || undefined} />
        
        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            This is a secure attendance marking system. Your check-in/check-out data is recorded for hotel management purposes. 
            Only authorized hotel staff can access this system.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading attendance system...</p>
        </div>
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}
