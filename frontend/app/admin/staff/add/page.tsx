import StaffForm from "@/components/StaffForm";

export default function AdminAddStaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Staff</h1>
        <p className="text-sm text-gray-600">Create a new staff member profile</p>
      </div>
      <StaffForm basePathPrefix="/admin" />
    </div>
  );
}