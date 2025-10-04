'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { initializeGlobalFetch } from '@/lib/globalFetch';
import { useEffect } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Initialize global fetch with safe JSON parsing
  useEffect(() => {
    initializeGlobalFetch();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
