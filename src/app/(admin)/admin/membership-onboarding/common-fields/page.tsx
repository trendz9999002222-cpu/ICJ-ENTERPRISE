import MappedCommonFieldsPage from "@/components/features/admin/shared/MappedCommonFieldsPage";

export default function MembershipCommonFields() {
  return (
    <MappedCommonFieldsPage
      formCode="MEMBERSHIP"
      title="Membership Common Fields"
      subtitle="Configure which global common fields are active and required for Membership Onboarding."
    />
  );
}
