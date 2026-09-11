import roleFormsData from "@/data/roleForms.json";
import type { FormFieldConfig, StepMetaConfig } from "@/types/onboarding-form";

export const FRANCHISE_STEP4_CONFIG: StepMetaConfig = {
  stepNumber: roleFormsData.franchise.step4.stepNumber,
  titleHi: roleFormsData.franchise.step4.titleHi,
  titleEn: roleFormsData.franchise.step4.titleEn,
  descriptionHi: roleFormsData.franchise.step4.descriptionHi,
  descriptionEn: roleFormsData.franchise.step4.descriptionEn,
  badgeLabel: roleFormsData.franchise.step4.badgeLabel,
  fields: roleFormsData.franchise.step4.fields as FormFieldConfig[],
};

export const FRANCHISE_STEP5_CONFIG: StepMetaConfig = {
  stepNumber: roleFormsData.franchise.step5.stepNumber,
  titleHi: roleFormsData.franchise.step5.titleHi,
  titleEn: roleFormsData.franchise.step5.titleEn,
  descriptionHi: roleFormsData.franchise.step5.descriptionHi,
  descriptionEn: roleFormsData.franchise.step5.descriptionEn,
  badgeLabel: roleFormsData.franchise.step5.badgeLabel,
  fields: roleFormsData.franchise.step5.fields as FormFieldConfig[],
};
