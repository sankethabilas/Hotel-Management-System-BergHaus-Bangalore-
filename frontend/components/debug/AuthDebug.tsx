'use client';

import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const [tokens, setTokens] = useState<any>({});

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const staffToken = localStorage.getItem('staffToken');
    const authToken = localStorage.getItem('authToken');

    setTokens({
      adminToken: adminToken ? `${adminToken.substring(0, 20)}...` : 'Not found',
      staffToken: staffToken ? `${staffToken.substring(0, 20)}...` : 'Not found',
      authToken: authToken ? `${authToken.substring(0, 20)}...` : 'Not found',
      hasAnyToken: !!(adminToken || staffToken || authToken)
    });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-xs z-50 max-w-sm">
      <div className="font-bold mb-2">Auth Debug Info</div>
      <div className="space-y-1">
        <div>Admin Token: <span className={tokens.adminToken !== 'Not found' ? 'text-green-400' : 'text-red-400'}>{tokens.adminToken}</span></div>
        <div>Staff Token: <span className={tokens.staffToken !== 'Not found' ? 'text-green-400' : 'text-red-400'}>{tokens.staffToken}</span></div>
        <div>Auth Token: <span className={tokens.authToken !== 'Not found' ? 'text-green-400' : 'text-red-400'}>{tokens.authToken}</span></div>
        <div className="pt-2 mt-2 border-t border-gray-700">
          Status: <span className={tokens.hasAnyToken ? 'text-green-400' : 'text-red-400'}>
            {tokens.hasAnyToken ? '✓ Authenticated' : '✗ Not Authenticated'}
          </span>
        </div>
      </div>
    </div>
  );
}
