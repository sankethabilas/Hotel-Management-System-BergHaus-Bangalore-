import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, MessageSquareIcon, AwardIcon, TagIcon, UsersIcon, BellIcon, BarChartIcon, ClipboardListIcon } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 h-full bg-navy-blue text-white flex flex-col">
      {/* Logo */}
      <div className="p-5 flex items-center border-b border-navy-blue-light">
        <div className="text-gold font-bold text-xl">LUXURY HOTEL</div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 pt-5">
        <NavItem to="/dashboard" icon={<HomeIcon size={20} />} label="Dashboard" />
        <NavItem to="/feedback" icon={<MessageSquareIcon size={20} />} label="Feedback" />
        <NavItem to="/loyalty" icon={<AwardIcon size={20} />} label="Loyalty Program" />
        <NavItem to="/offers" icon={<TagIcon size={20} />} label="Offers & Discounts" />
        <NavItem to="/guests" icon={<UsersIcon size={20} />} label="Guest History" />
        <NavItem to="/notifications" icon={<BellIcon size={20} />} label="Notifications" />
        <NavItem to="/analytics" icon={<BarChartIcon size={20} />} label="Analytics" />
        <NavItem to="/reports" icon={<ClipboardListIcon size={20} />} label="Reports" />
      </nav>
      {/* User profile */}
      <div className="p-4 border-t border-navy-blue-light flex items-center">
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy-blue font-bold">
          M
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium">Manager</div>
          <div className="text-xs text-gray-300">manager@luxuryhotel.com</div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center px-5 py-3 text-sm ${
          isActive 
            ? 'bg-navy-blue-dark text-gold border-l-4 border-gold' 
            : 'text-gray-300 hover:bg-navy-blue-light'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

export default Sidebar;