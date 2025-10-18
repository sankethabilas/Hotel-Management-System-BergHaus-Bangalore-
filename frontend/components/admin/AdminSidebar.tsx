"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, memo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
};

type DropdownItem = {
  href: string;
  label: string;
  icon?: ReactNode;
};

type DropdownSection = {
  label: string;
  items: DropdownItem[];
};

const ADMIN_ITEMS: NavItem[] = [
  { 
    href: "/admin", 
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
    )
  },
];

const STAFF_MANAGEMENT_ITEMS: DropdownItem[] = [
  { href: "/admin/staff", label: "Staff List" },
  { href: "/admin/staff/add", label: "Staff Registration" },
  { href: "/admin/leave-requests", label: "Manage Leaves" },
  { href: "/admin/attendance", label: "Staff Attendance" },
  { href: "/admin/payments", label: "Staff Payment" },
];


const KITCHEN_MANAGEMENT_ITEMS: DropdownItem[] = [
  { href: "/admin/banners", label: "Banner List" },
  { href: "/admin/promotions", label: "Promotion List" },
  { href: "/admin/reports", label: "Sales Reports" },
];

const INVENTORY_MANAGEMENT_ITEMS: DropdownItem[] = [
  { href: "/admin/inventory", label: "Inventory Dashboard" },
  { href: "/admin/inventory/items", label: "Manage Items" },
  { href: "/admin/inventory/add", label: "Add New Item" },
  { href: "/admin/inventory/suppliers", label: "Suppliers" },
  { href: "/admin/inventory/reports", label: "Inventory Reports" },
  { 
    href: "/admin/alerts", 
    label: "Alerts",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  },
];

const USER_MANAGEMENT_ITEMS: DropdownItem[] = [
  { 
    href: "/admin/users", 
    label: "User Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    href: "/admin/users/all", 
    label: "All Users",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    )
  },
  { 
    href: "/admin/users/add", 
    label: "Add User",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    )
  },
  { 
    href: "/admin/users/logs", 
    label: "Activity Logs",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
  { 
    href: "/admin/users/analytics", 
    label: "User Analytics",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    href: "/admin/users/communication", 
    label: "Communication Center",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
];

const CRM_MANAGEMENT_ITEMS: DropdownItem[] = [
  { 
    href: "/admin/crm", 
    label: "Contact Messages",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  { 
    href: "/admin/feedback", 
    label: "Guest Feedback",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  },
  { 
    href: "/admin/crm/replies", 
    label: "Reply History",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    )
  },
  { 
    href: "/admin/crm/analytics", 
    label: "CRM Analytics",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
];

const AdminSidebar = memo(function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [isKitchenDropdownOpen, setIsKitchenDropdownOpen] = useState(false);
  const [isInventoryDropdownOpen, setIsInventoryDropdownOpen] = useState(false);
  const [isUserManagementDropdownOpen, setIsUserManagementDropdownOpen] = useState(false);
  const [isCrmDropdownOpen, setIsCrmDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Check if any staff management item is active
  const isStaffManagementActive = STAFF_MANAGEMENT_ITEMS.some(item => 
    pathname === item.href || pathname?.startsWith(item.href)
  );

  // Check if any kitchen management item is active
  const isKitchenManagementActive = KITCHEN_MANAGEMENT_ITEMS.some(item => 
    pathname === item.href || pathname?.startsWith(item.href)
  );

  // Check if any inventory management item is active
  const isInventoryManagementActive = INVENTORY_MANAGEMENT_ITEMS.some(item => 
    pathname === item.href || pathname?.startsWith(item.href)
  );

  // Check if any user management item is active
  const isUserManagementActive = USER_MANAGEMENT_ITEMS.some(item => 
    pathname === item.href || pathname?.startsWith(item.href)
  );

  // Check if any CRM management item is active
  const isCrmManagementActive = CRM_MANAGEMENT_ITEMS.some(item => 
    pathname === item.href || pathname?.startsWith(item.href)
  );

  return (
    <>
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                <p className="text-sm text-gray-600">Are you sure you want to logout?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="h-screen w-64 shrink-0 text-white bg-gradient-to-b from-blue-900 to-blue-800">
        <div className="flex h-full flex-col">
        <div className="px-4 py-5 border-b border-white/15">
          <div className="text-lg font-semibold tracking-wide">BergHaus HMS</div>
          <div className="text-xs text-white/80">Admin Dashboard</div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-3">
          <div className="px-3 pb-1 text-[11px] uppercase tracking-wider text-white/70">Admin</div>
          <div className="space-y-1">
            {ADMIN_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon ? (
                    <span className="flex-shrink-0">
                      {item.icon}
                    </span>
                  ) : (
                    <span className="inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: isActive ? "#ffc973" : "#fee3b3" }}
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Staff Management Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isStaffManagementActive 
                    ? "bg-white/20 text-white" 
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: isStaffManagementActive ? "#ffc973" : "#fee3b3" }}
                  />
                  <span>Staff Management</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isStaffDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Items */}
              {isStaffDropdownOpen && (
                <div className="ml-6 space-y-1">
                  {STAFF_MANAGEMENT_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="inline-flex h-2 w-2 rounded-full"
                          style={{ backgroundColor: isActive ? "#ffc973" : "#fee3b3" }}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Kitchen Management Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsKitchenDropdownOpen(!isKitchenDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isKitchenManagementActive 
                    ? "bg-white/20 text-white" 
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: isKitchenManagementActive ? "#ffc973" : "#fee3b3" }}
                  />
                  <span>Kitchen Management</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isKitchenDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Items */}
              {isKitchenDropdownOpen && (
                <div className="ml-6 space-y-1">
                  {KITCHEN_MANAGEMENT_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="inline-flex h-2 w-2 rounded-full"
                          style={{ backgroundColor: isActive ? "#ffc973" : "#fee3b3" }}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inventory Management Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsInventoryDropdownOpen(!isInventoryDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isInventoryManagementActive 
                    ? "bg-white/20 text-white" 
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: isInventoryManagementActive ? "#ffc973" : "#fee3b3" }}
                  />
                  <span>Inventory Management</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isInventoryDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Items */}
              {isInventoryDropdownOpen && (
                <div className="ml-6 space-y-1">
                  {INVENTORY_MANAGEMENT_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.icon ? (
                          <span className="flex-shrink-0">
                            {item.icon}
                          </span>
                        ) : (
                          <span className="inline-flex h-2 w-2 rounded-full"
                            style={{ backgroundColor: isActive ? "#ffc973" : "#fee3b3" }}
                          />
                        )}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Management Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsUserManagementDropdownOpen(!isUserManagementDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isUserManagementActive 
                    ? "bg-white/20 text-white" 
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: isUserManagementActive ? "#ffc973" : "#fee3b3" }}
                  />
                  <span>User Management</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isUserManagementDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Items */}
              {isUserManagementDropdownOpen && (
                <div className="ml-6 space-y-1">
                  {USER_MANAGEMENT_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.icon ? (
                          <span className="flex-shrink-0">
                            {item.icon}
                          </span>
                        ) : (
                          <span className="inline-flex h-2 w-2 rounded-full"
                            style={{ backgroundColor: isActive ? "#ffc973" : "#fee3b3" }}
                          />
                        )}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CRM Management Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsCrmDropdownOpen(!isCrmDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCrmManagementActive 
                    ? "bg-white/20 text-white" 
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: isCrmManagementActive ? "#ffc973" : "#fee3b3" }}
                  />
                  <span>Customer Relationship Management</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isCrmDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Items */}
              {isCrmDropdownOpen && (
                <div className="ml-6 space-y-1">
                  {CRM_MANAGEMENT_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.icon ? (
                          <span className="flex-shrink-0">
                            {item.icon}
                          </span>
                        ) : (
                          <span className="inline-flex h-2 w-2 rounded-full"
                            style={{ backgroundColor: isActive ? "#ffc973" : "#fee3b3" }}
                          />
                        )}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* User Info and Logout Section */}
        <div className="mt-auto px-4 py-4 border-t border-white/15">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-white/10 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin User'}
              </div>
              <div className="text-xs text-white/70 truncate">
                {user?.email || 'admin@berghaus.com'}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:bg-red-600/20 hover:text-white transition-colors group"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Logout</span>
          </button>

          {/* Footer */}
          <div className="mt-4 text-xs text-white/85">
            <div className="font-medium">Berghaus Bungalow</div>
            <div className="opacity-80">v1.0 Admin UI</div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
});

export default AdminSidebar;
