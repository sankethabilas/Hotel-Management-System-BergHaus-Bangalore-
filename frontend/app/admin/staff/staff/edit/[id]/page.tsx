"use client";
import StaffForm from "@/components/StaffForm";
import { useParams } from "next/navigation";

export default function AdminEditStaffPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Staff</h1>
      {id && <StaffForm staffId={id} isEdit basePathPrefix="/admin" />}
    </div>
  );
}


