import React from 'react';
import { MenuIcon, BellIcon, SearchIcon } from 'lucide-react';

const Header = ({ setSidebarOpen }) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            type="button" 
            className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold" 
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 md:ml-0 ml-2">
            Hotel Management System
          </h1>
        </div>
        <div className="flex items-center">
          <div className="max-w-lg w-full lg:max-w-xs mr-4 hidden md:block">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                id="search" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gold focus:border-gold sm:text-sm" 
                placeholder="Search" 
                type="search" 
              />
            </div>
          </div>
          <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;