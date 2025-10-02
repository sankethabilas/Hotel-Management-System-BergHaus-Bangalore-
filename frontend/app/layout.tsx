import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import ClientOnly from '@/components/ClientOnly'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Berghaus Bungalow - Hotel Management System',
  description: 'Experience luxury hospitality at Berghaus Bungalow. Seamless booking, exceptional service, and unforgettable memories await.',
  keywords: 'hotel, management, booking, hospitality, luxury, reservation',
  authors: [{ name: 'HMS Team' }],
  openGraph: {
    title: 'Berghaus Bungalow - Hotel Management System',
    description: 'Experience luxury hospitality at Berghaus Bungalow.',
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientOnly>
          <Providers>
            {children}
          </Providers>
        </ClientOnly>
      </body>
    </html>
  )
}
