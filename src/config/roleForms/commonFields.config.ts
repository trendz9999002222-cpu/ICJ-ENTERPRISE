import roleFormsData from "@/data/roleForms.json";
import type { FormFieldConfig, StepMetaConfig } from "@/types/onboarding-form";

export const STEP2_PERSONAL_CONFIG: StepMetaConfig = {
  stepNumber: roleFormsData.step2Personal.stepNumber,
  titleHi: roleFormsData.step2Personal.titleHi,
  titleEn: roleFormsData.step2Personal.titleEn,
  descriptionHi: roleFormsData.step2Personal.descriptionHi,
  descriptionEn: roleFormsData.step2Personal.descriptionEn,
  badgeLabel: roleFormsData.step2Personal.badgeLabel,
  fields: roleFormsData.step2Personal.fields as FormFieldConfig[],
};

export const STEP3_CONTACT_EXTRA_FIELDS: FormFieldConfig[] =
  roleFormsData.step3ContactExtra as FormFieldConfig[];
