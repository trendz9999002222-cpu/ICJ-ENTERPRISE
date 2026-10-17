import { Suspense } from "react";
import OnboardingWizard from "@/components/features/onboarding/onboarding-file/RegistrationFlow";

export const metadata = {
  title: "Join as Professional | International Consortium of Jurists (ICJ)",
  description:
    "Register and join the International Consortium of Jurists (ICJ) nationwide panel of advocates, legal consultants, and professionals.",
};

export default function JoinProfessionalPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingWizard />
    </Suspense>
  );
}
