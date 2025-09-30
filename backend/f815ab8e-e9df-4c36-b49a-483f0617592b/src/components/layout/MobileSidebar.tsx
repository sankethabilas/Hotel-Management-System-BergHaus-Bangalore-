import React from 'react';
import { XIcon } from 'lucide-react';
import Sidebar from './Sidebar';
const MobileSidebar = ({
  isOpen,
  setIsOpen
}) => {
  return <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)} />}
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button type="button" className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setIsOpen(false)}>
            <span className="sr-only">Close sidebar</span>
            <XIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        <Sidebar />
      </div>
    </>;
};
export default MobileSidebar;