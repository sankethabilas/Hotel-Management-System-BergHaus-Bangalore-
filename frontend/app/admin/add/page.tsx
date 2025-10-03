'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAddRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct staff add page
    router.replace('/admin/staff/add');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600">Redirecting to staff registration...</p>
      </div>
    </div>
  );
}