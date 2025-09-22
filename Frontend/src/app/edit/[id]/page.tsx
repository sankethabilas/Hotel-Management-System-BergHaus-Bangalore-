import StaffForm from '@/components/StaffForm';

interface EditStaffPageProps {
  params: {
    id: string;
  };
}

export default function EditStaffPage({ params }: EditStaffPageProps) {
  return <StaffForm staffId={params.id} isEdit={true} />;
}
