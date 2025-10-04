"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, memo, useState } from "react";

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

const AdminSidebar = memo(function AdminSidebar() {
  const pathname = usePathname();
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [isKitchenDropdownOpen, setIsKitchenDropdownOpen] = useState(false);
  const [isInventoryDropdownOpen, setIsInventoryDropdownOpen] = useState(false);

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

  return (
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
          </div>
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-white/15 text-xs text-white/85">
          <div className="font-medium">Berghaus Bungalow</div>
          <div className="opacity-80">v1.0 Admin UI</div>
        </div>
      </div>
    </aside>
  );
});

export default AdminSidebar;
