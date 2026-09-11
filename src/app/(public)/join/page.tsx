import { Suspense } from "react";
import OnboardingWizard from "@/components/features/onboarding/OnboardingWizard";

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingWizard />
    </Suspense>
  );
}
