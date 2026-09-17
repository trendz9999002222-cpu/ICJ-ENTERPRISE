import { Suspense } from "react";
// import OnboardingWizard from "@/components/features/onboarding/ProfessionalRegistration";
import OnboardingWizard from "@/components/features/onboarding/onboarding-file/RegistrationFlow";

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingWizard />
    </Suspense>
  );
}
