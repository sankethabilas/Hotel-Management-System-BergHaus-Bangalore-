import StaffForm from "@/components/StaffForm";

export default function AdminAddStaffPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add Staff</h1>
      <StaffForm basePathPrefix="/admin/staff" />
    </div>
  );
}


