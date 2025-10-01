import StaffForm from '@/components/StaffForm';
import { use } from 'react';

interface EditStaffPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditStaffPage({ params }: EditStaffPageProps) {
  const resolvedParams = use(params);
  return <StaffForm staffId={resolvedParams.id} isEdit={true} />;
}
