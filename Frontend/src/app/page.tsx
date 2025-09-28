import StaffList from '@/components/StaffList';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Quick Access Links */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Hotel Management System - BergHaus Bangalore
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin"
            className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Admin Portal</h3>
            <p className="text-sm text-blue-700">
              Manage staff, payments, attendance, and leave requests
            </p>
          </Link>
          <Link
            href="/payment-history"
            className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <h3 className="text-lg font-semibold text-green-900 mb-2">Payment History</h3>
            <p className="text-sm text-green-700">
              View individual employee payment history and salary records
            </p>
          </Link>
          <Link
            href="/scan"
            className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
          >
            <h3 className="text-lg font-semibold text-purple-900 mb-2">QR Scanner</h3>
            <p className="text-sm text-purple-700">
              Scan employee QR codes for attendance or quick access
            </p>
          </Link>
        </div>
      </div>
      
      <StaffList />
    </div>
  );
}
