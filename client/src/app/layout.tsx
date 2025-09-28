import '@/styles/globals.css'
import { CartProvider } from '@/contexts/CartContext'

export const metadata = {
  title: 'BergHaus Hotel Management System',
  description: 'Food & Beverage Management Module',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
