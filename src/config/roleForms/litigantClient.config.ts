import roleFormsData from "@/data/roleForms.json";
import type { FormFieldConfig, StepMetaConfig } from "@/types/onboarding-form";

export const LITIGANT_STEP4_CONFIG: StepMetaConfig = {
  stepNumber: roleFormsData.litigant.step4.stepNumber,
  titleHi: roleFormsData.litigant.step4.titleHi,
  titleEn: roleFormsData.litigant.step4.titleEn,
  descriptionHi: roleFormsData.litigant.step4.descriptionHi,
  descriptionEn: roleFormsData.litigant.step4.descriptionEn,
  badgeLabel: roleFormsData.litigant.step4.badgeLabel,
  fields: roleFormsData.litigant.step4.fields as FormFieldConfig[],
};

export const LITIGANT_STEP5_CONFIG: StepMetaConfig = {
  stepNumber: roleFormsData.litigant.step5.stepNumber,
  titleHi: roleFormsData.litigant.step5.titleHi,
  titleEn: roleFormsData.litigant.step5.titleEn,
  descriptionHi: roleFormsData.litigant.step5.descriptionHi,
  descriptionEn: roleFormsData.litigant.step5.descriptionEn,
  badgeLabel: roleFormsData.litigant.step5.badgeLabel,
  fields: roleFormsData.litigant.step5.fields as FormFieldConfig[],
};
