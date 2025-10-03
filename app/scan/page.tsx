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
          {qrId && (
            <p className="text-sm text-gray-500 mt-2">
              QR Session: {qrId.substring(0, 12)}...
            </p>
          )}
        </div>
        
        <AttendanceScanner qrId={qrId || undefined} />
        
        <div className="mt-8 text-center space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm max-w-md mx-auto">
            <h3 className="font-semibold text-gray-800 mb-2">💡 Quick Access</h3>
            <p className="text-sm text-gray-600 mb-3">
              Bookmark this page for easy attendance marking
            </p>
            <Link 
              href="/scan" 
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Direct Attendance Page
            </Link>
          </div>
          
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
