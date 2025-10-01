import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getTotalItems, isLoaded } = useCart()

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6">
        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">BergHaus</h1>
            <span className="ml-2 text-sm text-gray-500">Food & Menu</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/guest/menu" className="text-gray-700 hover:text-blue-600 transition-colors">
              Menu
            </Link>
            <Link href="/guest/orders" className="text-gray-700 hover:text-blue-600 transition-colors">
              My Orders
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/guest/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {isLoaded && getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/guest/menu" className="text-gray-700 hover:text-blue-600 transition-colors">
                Menu
              </Link>
              <Link href="/guest/orders" className="text-gray-700 hover:text-blue-600 transition-colors">
                My Orders
              </Link>
              <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                <Link href="/guest/cart" className="flex items-center text-gray-700">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart ({isLoaded ? getTotalItems() : 0})
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
