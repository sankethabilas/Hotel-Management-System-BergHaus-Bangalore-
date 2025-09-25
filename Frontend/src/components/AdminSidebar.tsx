"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
};

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/staff", label: "Staff List" },
  { href: "/admin/staff/add", label: "Staff Registration" },
  { href: "/admin/leave-requests", label: "Manage Leaves" },
  { href: "/admin/attendance", label: "Staff Attendance" },
  { href: "/admin/payments", label: "Staff Payments" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-dvh w-64 shrink-0 text-white admin-bg">
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
                  className={`admin-link ${isActive ? "admin-link-active" : "text-white/90"}`}
                >
                  <span className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: isActive ? "#ffc973" : "#fee3b3" }}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-white/15 text-xs text-white/85">
          <div className="font-medium">Hotel BergHaus</div>
          <div className="opacity-80">v1.0 Admin UI</div>
        </div>
      </div>
    </aside>
  );
}


