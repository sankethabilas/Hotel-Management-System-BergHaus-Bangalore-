import AdminSidebar from "@/components/AdminSidebar";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex bg-[var(--background)] text-[var(--foreground)]">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}


