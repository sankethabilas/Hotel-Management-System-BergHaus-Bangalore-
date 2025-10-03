"use client";

import HRLeaveManagement from "@/components/HRLeaveManagement";

export default function AdminLeaveRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leave Requests</h1>
      </div>
      <HRLeaveManagement />
    </div>
  );
}


