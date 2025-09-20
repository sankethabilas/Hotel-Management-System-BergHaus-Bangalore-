import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-hms-primary/20">
              <Image
                src="/logo.jpg"
                alt="HMS Logo"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <span className="text-xl font-bold text-hms-primary group-hover:text-hms-secondary transition-colors duration-200">
             Berghaus Bungalow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-hms-primary transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link 
              href="/rooms" 
              className="text-gray-700 hover:text-hms-primary transition-colors duration-200 font-medium"
            >
              Rooms
            </Link>
            <Link 
              href="/reservations" 
              className="text-gray-700 hover:text-hms-primary transition-colors duration-200 font-medium"
            >
              Reservations
            </Link>
            <Link 
              href="/facilities" 
              className="text-gray-700 hover:text-hms-primary transition-colors duration-200 font-medium"
            >
              Facilities
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-hms-primary transition-colors duration-200 font-medium"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-700 hover:text-hms-primary transition-colors duration-200 font-medium"
            >
              Contact
            </Link>
            <Link href="/auth">
              <Button className="bg-hms-primary hover:bg-hms-primary/90 text-white transition-all duration-200 hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-gray-700 hover:text-hms-primary"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-700 hover:text-hms-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/rooms"
                className="block px-3 py-2 text-gray-700 hover:text-hms-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Rooms
              </Link>
              <Link
                href="/reservations"
                className="block px-3 py-2 text-gray-700 hover:text-hms-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Reservations
              </Link>
              <Link
                href="/facilities"
                className="block px-3 py-2 text-gray-700 hover:text-hms-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Facilities
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-gray-700 hover:text-hms-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-hms-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="px-3 py-2">
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-hms-primary hover:bg-hms-primary/90 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
