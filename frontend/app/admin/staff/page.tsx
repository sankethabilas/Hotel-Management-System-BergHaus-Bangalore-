import StaffList from "@/components/StaffList";

export default function AdminStaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
        <p className="text-sm text-gray-600">Manage hotel staff members</p>
      </div>
      <StaffList basePathPrefix="/admin" />
    </div>
  );
}