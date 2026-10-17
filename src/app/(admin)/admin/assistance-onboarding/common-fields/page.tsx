import MappedCommonFieldsPage from "@/components/features/admin/shared/MappedCommonFieldsPage";

export default function SeekAssistanceCommonFieldsPage() {
  return (
    <MappedCommonFieldsPage
      formCode="SEEKER_ASSISTANT"
      title="Citizen Details"
      subtitle="Configure which global citizen fields are active and required for Seek Assistance intake form."
    />
  );
}
