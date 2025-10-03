'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
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
