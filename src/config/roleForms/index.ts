import type { OnboardingRole } from "@/constants/onboarding";
import type { StepMetaConfig } from "@/types/onboarding-form";
import { STEP2_PERSONAL_CONFIG } from "./commonFields.config";
import { LITIGANT_STEP4_CONFIG, LITIGANT_STEP5_CONFIG } from "./litigantClient.config";
import {
  ADVOCATE_STEP2_CONFIG,
  ADVOCATE_STEP3_CONFIG,
  ADVOCATE_STEP4_CONFIG,
  ADVOCATE_STEP5_CONFIG,
} from "./advocatePartner.config";
import { FRANCHISE_STEP4_CONFIG, FRANCHISE_STEP5_CONFIG } from "./districtFranchise.config";

export function getRoleStepConfig(role: OnboardingRole, step: number): StepMetaConfig | null {
  if (step === 2) {
    if (role === "advocate") return ADVOCATE_STEP2_CONFIG;
    return STEP2_PERSONAL_CONFIG;
  }

  if (step === 3) {
    if (role === "advocate") return ADVOCATE_STEP3_CONFIG;
    return {
      stepNumber: 3,
      titleHi: "संपर्क विवरण एवं स्थायी पता",
      titleEn: "Address & Contact Information",
      descriptionHi: "कृपया पत्राचार व आधिकारिक संपर्क हेतु सही पता व प्राथमिकताएं दर्ज करें।",
      descriptionEn: "Provide your permanent residential or official jurisdiction address and communication preferences.",
      badgeLabel: "Contact & Jurisdiction",
      fields: [],
    };
  }

  if (step === 4) {
    if (role === "citizen") return LITIGANT_STEP4_CONFIG;
    if (role === "advocate") return ADVOCATE_STEP4_CONFIG;
    if (role === "franchise") return FRANCHISE_STEP4_CONFIG;
  }

  if (step === 5) {
    if (role === "citizen") return LITIGANT_STEP5_CONFIG;
    if (role === "advocate") return ADVOCATE_STEP5_CONFIG;
    if (role === "franchise") return FRANCHISE_STEP5_CONFIG;
  }

  return null;
}
