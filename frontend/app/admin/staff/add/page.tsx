import StaffForm from "@/components/StaffForm";

export default function AdminAddStaffPage() {
  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-semibold">Staff Registration</h1>
        <p className="text-sm text-gray-600">Create a new staff member profile</p>
      </div>
      <div className="flex-1 min-h-0">
        <StaffForm basePathPrefix="/admin" />
      </div>
    </div>
  );
}