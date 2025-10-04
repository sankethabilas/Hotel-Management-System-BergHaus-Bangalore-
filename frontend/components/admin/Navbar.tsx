// components/admin/Navbar.jsx
"use client";
import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  active: string;
}

export default function Navbar({ active }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClass = (key: string) =>
    `px-3 py-2 rounded transition-colors duration-200 ${
      active === key
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
    }`;

  const mobileLinkClass = (key: string) =>
    `block px-3 py-2 rounded text-base font-medium transition-colors duration-200 ${
      active === key
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
    }`;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="font-bold text-lg sm:text-xl text-gray-800">
                Inventory Admin
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  href="/admin/inventory"
                  className={linkClass("dashboard")}
                >
                  Dashboard
                </Link>
                <Link href="/admin/inventory/items" className={linkClass("inventory")}>
                  Inventory
                </Link>
                <Link href="/admin/alerts" className={linkClass("alerts")}>
                  Alerts
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t">
            <Link
              href="/admin/inventory"
              className={mobileLinkClass("dashboard")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/inventory/items"
              className={mobileLinkClass("inventory")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Inventory
            </Link>
            <Link
              href="/admin/alerts"
              className={mobileLinkClass("alerts")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Alerts
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
