import onboardingData from "@/data/onboarding.json";

export type OnboardingRole = "citizen" | "advocate" | "franchise";

export type OnboardingStep = {
  id: number;
  titleHi: string;
  titleEn: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = onboardingData.steps;

export type OnboardingRoleOption = {
  id: OnboardingRole;
  stepLabel: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  color: string;
  border: string;
  bg: string;
  chipBg: string;
  chipColor: string;
  icon: "citizen" | "advocate" | "franchise";
};

export const ONBOARDING_ROLES: OnboardingRoleOption[] = onboardingData.roles as OnboardingRoleOption[];

export type ApplicantType = "individual" | "organisation";

export type AdvocateIdentityFormData = {
  applicantType: ApplicantType;
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  yearOfBirth: string;
  orgName: string;
  entityType: string;
  authPersonName: string;
  estYear: string;
};

export const INITIAL_ADVOCATE_IDENTITY_DATA: AdvocateIdentityFormData = {
  applicantType: "individual",
  prefix: "Adv. (अधिवक्ता)",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "Male (पुरुष)",
  yearOfBirth: "1990",
  orgName: "",
  entityType: "Law Firm (लॉ फर्म)",
  authPersonName: "",
  estYear: "2015",
};

export const PREFIX_OPTIONS: string[] = onboardingData.prefixOptions;
export const GENDER_OPTIONS: string[] = onboardingData.genderOptions;

/** Years of birth from 2007 down to 1945 */
export const YEAR_OF_BIRTH_OPTIONS = Array.from({ length: 63 }, (_, i) => String(2007 - i));

/** Entity types for Organisation / Firm */
export const ENTITY_TYPE_OPTIONS: string[] = onboardingData.entityTypeOptions;

export const ESTABLISHMENT_YEAR_OPTIONS = Array.from({ length: 75 }, (_, i) => String(2025 - i));

/* -------------------------------------------------------------------------- */
/* Step 3: Contact & Password                                                 */
/* -------------------------------------------------------------------------- */
export type AdvocateContactFormData = {
  primaryMobile: string;
  whatsappNumber: string;
  officialEmail: string;
  password: string;
  confirmPassword: string;
};

export const INITIAL_ADVOCATE_CONTACT_DATA: AdvocateContactFormData = {
  primaryMobile: "",
  whatsappNumber: "",
  officialEmail: "",
  password: "",
  confirmPassword: "",
};

/* -------------------------------------------------------------------------- */
/* Step 4: Professional Practice & Matter                                     */
/* -------------------------------------------------------------------------- */
export type AdvocatePracticeFormData = {
  professionalCategory: string;
  regNumber: string;
  experienceLevel: string;
};

export const INITIAL_ADVOCATE_PRACTICE_DATA: AdvocatePracticeFormData = {
  professionalCategory: "Core Legal & Court Practitioners",
  regNumber: "",
  experienceLevel: "Senior Professional (5 - 10 Years)",
};

export const PROFESSIONAL_CATEGORIES: string[] = onboardingData.professionalCategories;
export const EXPERIENCE_LEVELS: string[] = onboardingData.experienceLevels;

/* -------------------------------------------------------------------------- */
/* Step 5: Jurisdiction & Address                                             */
/* -------------------------------------------------------------------------- */
export type AdvocateAddressFormData = {
  state: string;
  district: string;
  cityTehsil: string;
  pincode: string;
  policeStation: string;
};

export const INITIAL_ADVOCATE_ADDRESS_DATA: AdvocateAddressFormData = {
  state: "Delhi",
  district: "New Delhi",
  cityTehsil: "",
  pincode: "",
  policeStation: "",
};

export const INDIAN_STATES: string[] = onboardingData.states;
export const STATE_DISTRICTS_MAP: Record<string, string[]> = onboardingData.stateDistrictsMap;
