import roleFormsData from "@/data/roleForms.json";
import type { FormFieldConfig, StepMetaConfig } from "@/types/onboarding-form";

function stepConfig(key: "step2" | "step3" | "step4" | "step5"): StepMetaConfig {
  const block = roleFormsData.advocate[key];
  return {
    stepNumber: block.stepNumber,
    titleHi: block.titleHi,
    titleEn: block.titleEn,
    descriptionHi: block.descriptionHi,
    descriptionEn: block.descriptionEn,
    badgeLabel: block.badgeLabel,
    fields: block.fields as FormFieldConfig[],
  };
}

export const ADVOCATE_STEP2_CONFIG = stepConfig("step2");
export const ADVOCATE_STEP3_CONFIG = stepConfig("step3");
export const ADVOCATE_STEP4_CONFIG = stepConfig("step4");
export const ADVOCATE_STEP5_CONFIG = stepConfig("step5");
