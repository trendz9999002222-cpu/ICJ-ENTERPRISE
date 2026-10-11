import MappedCommonFieldsPage from "@/components/features/admin/shared/MappedCommonFieldsPage";
import HonorableAdvisoryActions from "../HonorableAdvisoryActions";

export default function HonorableCommonFields() {
  return (
    <MappedCommonFieldsPage
      formCode="HONORABLE_ADVISORY"
      title="Honorable Advisory Common Fields"
      subtitle="Configure which global common fields are active and required for Honorable Advisory Onboarding."
      actions={<HonorableAdvisoryActions />}
    />
  );
}
