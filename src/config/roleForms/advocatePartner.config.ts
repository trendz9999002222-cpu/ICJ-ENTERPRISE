import roleFormsData from "@/data/roleForms.json";
import type { FormFieldConfig, StepMetaConfig } from "@/types/onboarding-form";

export const ADVOCATE_STEP4_CONFIG: StepMetaConfig = {
  stepNumber: roleFormsData.advocate.step4.stepNumber,
  titleHi: roleFormsData.advocate.step4.titleHi,
  titleEn: roleFormsData.advocate.step4.titleEn,
  descriptionHi: roleFormsData.advocate.step4.descriptionHi,
  descriptionEn: roleFormsData.advocate.step4.descriptionEn,
  badgeLabel: roleFormsData.advocate.step4.badgeLabel,
  fields: roleFormsData.advocate.step4.fields as FormFieldConfig[],
};

export const ADVOCATE_STEP5_CONFIG: StepMetaConfig = {
  stepNumber: roleFormsData.advocate.step5.stepNumber,
  titleHi: roleFormsData.advocate.step5.titleHi,
  titleEn: roleFormsData.advocate.step5.titleEn,
  descriptionHi: roleFormsData.advocate.step5.descriptionHi,
  descriptionEn: roleFormsData.advocate.step5.descriptionEn,
  badgeLabel: roleFormsData.advocate.step5.badgeLabel,
  fields: roleFormsData.advocate.step5.fields as FormFieldConfig[],
};
