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
        
        {/* Staff Portal Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">🏨 Staff Portal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/staff-login"
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <h4 className="text-lg font-semibold text-blue-900 mb-2">🔐 Staff Login</h4>
              <p className="text-sm text-blue-700">
                Login to your personal staff dashboard with your registered email
              </p>
            </Link>
            <Link
              href="/staff-registration"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <h4 className="text-lg font-semibold text-green-900 mb-2">✍️ Staff Registration</h4>
              <p className="text-sm text-green-700">
                New staff member? Register your account here
              </p>
            </Link>
          </div>
        </div>

        {/* Management Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">⚙️ Management System</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin"
              className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <h4 className="text-lg font-semibold text-purple-900 mb-2">👑 Admin Portal</h4>
              <p className="text-sm text-purple-700">
                Manage staff, payments, attendance, and leave requests
              </p>
            </Link>
            <Link
              href="/payment-history"
              className="block p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
            >
              <h4 className="text-lg font-semibold text-orange-900 mb-2">💰 Payment History</h4>
              <p className="text-sm text-orange-700">
                View individual employee payment history and salary records
              </p>
            </Link>
            <Link
              href="/scan"
              className="block p-4 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
            >
              <h4 className="text-lg font-semibold text-teal-900 mb-2">📱 QR Scanner</h4>
              <p className="text-sm text-teal-700">
                Scan employee QR codes for attendance or quick access
              </p>
            </Link>
          </div>
        </div>
      </div>
      
      <StaffList />
    </div>
  );
}
