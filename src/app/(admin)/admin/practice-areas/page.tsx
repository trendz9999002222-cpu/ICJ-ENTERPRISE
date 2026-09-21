import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import OnboardingHubDashboard from "@/components/features/admin/professional-onboarding/OnboardingHubDashboard";

export const metadata = {
  title: "Professional Onboarding — Admin Portal | ICJ Enterprise",
};

export default function Page() {
  return (
    <AdminPageShell
      title="Professional Onboarding"
      subtitle="Configure categories, groups, professions, fields, and documents for professional onboarding."
    >
      <OnboardingHubDashboard />
    </AdminPageShell>
  );
}
