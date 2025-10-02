"use client";

import HRLeaveManagement from "@/components/HRLeaveManagement";

export default function AdminLeaveRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leave Requests</h1>
        <p className="text-sm text-gray-600">HR panel for approving/rejecting</p>
      </div>
      <HRLeaveManagement />
    </div>
  );
}


