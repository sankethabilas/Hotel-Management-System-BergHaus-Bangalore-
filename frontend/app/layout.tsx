import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HMS - Hotel Management System',
  description: 'Experience luxury hospitality with our comprehensive Hotel Management System. Seamless booking, exceptional service, and unforgettable memories await.',
  keywords: 'hotel, management, booking, hospitality, luxury, reservation',
  authors: [{ name: 'HMS Team' }],
  openGraph: {
    title: 'HMS - Hotel Management System',
    description: 'Experience luxury hospitality with our comprehensive Hotel Management System.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
