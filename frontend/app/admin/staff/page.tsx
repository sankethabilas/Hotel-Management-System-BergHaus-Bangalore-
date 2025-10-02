import StaffList from "@/components/StaffList";

export default function AdminStaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff</h1>
        <p className="text-sm text-gray-600">Manage hotel staff</p>
      </div>
      <StaffList basePathPrefix="/admin" />
    </div>
  );
}


