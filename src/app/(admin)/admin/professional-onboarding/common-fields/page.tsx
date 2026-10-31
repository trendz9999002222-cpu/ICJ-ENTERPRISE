import MappedCommonFieldsPage from "@/components/features/admin/shared/MappedCommonFieldsPage";

export default function ProfessionalCommonFields() {
  return (
    <MappedCommonFieldsPage
      formCode="PROFESSIONAL"
      title="Common Fields"
      subtitle="Configure which global common fields are active and required for Member Onboarding."
    />
  );
}
