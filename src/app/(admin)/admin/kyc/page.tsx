import KycVerificationPanel from "@/components/features/admin/kyc/KycVerificationPanel";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";

export const metadata = { title: "KYC Verification — Admin Portal | ICJ Enterprise" };

export default function KycPage() {
  return (
    <AdminPageShell
      title="KYC Verification"
      subtitle="Review and action advocate onboarding applications"
    >
      <KycVerificationPanel />
    </AdminPageShell>
  );
}
