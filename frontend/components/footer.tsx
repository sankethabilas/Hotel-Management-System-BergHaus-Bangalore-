import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hotel Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-hms-primary/20">
                <Image
                  src="/logo.jpg"
                  alt="HMS Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold text-hms-secondary">Berghaus Bungalow</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Located in the beautiful hills of Ella, Sri Lanka. Experience comfort, 
              warm hospitality, and stunning mountain views in our family-friendly accommodation.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-hms-primary rounded-full flex items-center justify-center hover:bg-hms-secondary transition-colors duration-200 cursor-pointer">
                <span className="text-white text-sm font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-hms-primary rounded-full flex items-center justify-center hover:bg-hms-secondary transition-colors duration-200 cursor-pointer">
                <span className="text-white text-sm font-bold">t</span>
              </div>
              <div className="w-8 h-8 bg-hms-primary rounded-full flex items-center justify-center hover:bg-hms-secondary transition-colors duration-200 cursor-pointer">
                <span className="text-white text-sm font-bold">in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-hms-secondary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-hms-accent transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-hms-accent transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="text-gray-300 hover:text-hms-accent transition-colors duration-200">
                  Rooms & Suites
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-hms-accent transition-colors duration-200">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-hms-accent transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-hms-secondary">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/spa" className="text-gray-300 hover:text-hms-accent transition-colors duration-200">
                  Spa & Wellness
                </Link>
              </li>
              <li>
                <Link href="/restaurant" className="text-gray-300 hover:text-hms-accent transition-colors duration-200">
                  Fine Dining
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-hms-accent transition-colors duration-200">
                  Events & Conferences
                </Link>
              </li>
              <li>
                <Link href="/transport" className="text-gray-300 hover:text-hms-accent transition-colors duration-200">
                  Airport Transfer
                </Link>
              </li>
              <li>
                <Link href="/concierge" className="text-gray-300 hover:text-hms-accent transition-colors duration-200">
                  Concierge Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-hms-secondary">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-hms-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    No 80, Netherville Road<br />
                    Ella, Demodara<br />
                    90080 Ella, Sri Lanka
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-hms-accent flex-shrink-0" />
                <p className="text-gray-300 text-sm">+94 XX XXX XXXX</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-hms-accent flex-shrink-0" />
                <p className="text-gray-300 text-sm">info@berghausbungalow.com</p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-hms-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    Check-in: 3:00 PM<br />
                    Check-out: 11:00 AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Berghaus Bungalow. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-hms-accent text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-hms-accent text-sm transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-hms-accent text-sm transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
