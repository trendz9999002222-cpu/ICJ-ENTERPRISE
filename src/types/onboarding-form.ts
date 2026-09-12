import type { OnboardingRole } from "@/constants/onboarding";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "phone"
  | "email"
  | "date"
  | "radio"
  | "file"
  | "address-cascade"
  | "section"
  | "checkbox-group";

export type FormFieldBindTarget = "personal" | "address" | "advocate";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  labelHi?: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;
  gridSize?: { xs?: number; sm?: number; md?: number };
  options?: FieldOption[];
  helperText?: string;
  disabled?: boolean;
  /** Which slice of form state this field maps to (default inferred by step/role). */
  bindTo?: FormFieldBindTarget;
  /** Conditional visibility: only show if formState[section][dependsOn.field] matches value */
  dependsOn?: {
    field: string;
    value: string | string[];
  };
  docKey?: string;
  acceptTypes?: string;
  maxSizeMb?: number;
  phoneMaxDigits?: number;
  phoneShowIndiaPrefix?: boolean;
}

export interface StepMetaConfig {
  stepNumber: number;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  badgeLabel: string;
  fields: FormFieldConfig[];
}

export interface PersonalInfoData {
  fullName: string;
  guardianName: string;
  dateOfBirth: string;
  gender: string;
  mobile: string;
  email: string;
  linkedInPortfolio: string;
}

export interface AddressContactData {
  addressLine: string;
  state: string;
  district: string;
  cityTehsil: string;
  pincode: string;
  alternateMobile: string;
  preferredContact: string; // "Call", "WhatsApp", "Email"
}

export interface LitigantSpecificData {
  matterType: string;
  disputeNature: string;
  description: string;
  currentStatus: string;
  courtJurisdiction: string;
  preferredAssistance: string;
  urgency: string;
  existingCaseNumber: string;
  hasAdvocate: string; // "yes" | "no"
}

export interface AdvocateSpecificData {
  lawSchool: string;
  graduationYear: string;
  degreeEarned: string;
  barAdmissionRegion: string;
  barNumber: string;
  barAdmissionDate: string;
  currentEmployer: string;
  currentJobTitle: string;
  yearsOfExperience: string;
  practiceAreas: string[];
  profileBio: string;
  /** @deprecated retained for review compatibility */
  professionalType: string;
  regNumber: string;
  stateBarCouncil: string;
  practiceArea: string;
  courtJurisdiction: string;
  officeAddress: string;
  professionalEmail: string;
  professionalContact: string;
  languagesKnown: string[];
  availability: string;
}

export interface FranchiseSpecificData {
  orgName: string;
  authorizedPerson: string;
  operatingDistrict: string;
  officeAddress: string;
  businessType: string;
  yearsOfExperience: string;
  teamSize: string;
  hasInfrastructure: string;
  hasEfilingDesk: string;
  hasCallCenter: string;
  hasLegalAidCenter: string;
  expectedServiceArea: string;
  operationalDetails: string;
}

export interface DocumentUploadItem {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  fileBase64?: string;
  /** Present in browser after user selects a file (used for API upload). */
  file?: File;
}

export interface DocumentUploadsData {
  [docKey: string]: DocumentUploadItem | null;
}

export interface OnboardingFormState {
  role: OnboardingRole;
  personal: PersonalInfoData;
  address: AddressContactData;
  litigant: LitigantSpecificData;
  advocate: AdvocateSpecificData;
  franchise: FranchiseSpecificData;
  documents: DocumentUploadsData;
  declarationAgreed: boolean;
}

export const INITIAL_ONBOARDING_FORM_STATE: OnboardingFormState = {
  role: "advocate",
  personal: {
    fullName: "",
    guardianName: "",
    dateOfBirth: "1990-01-01",
    gender: "Male (पुरुष)",
    mobile: "",
    email: "",
    linkedInPortfolio: "",
  },
  address: {
    addressLine: "",
    state: "Delhi",
    district: "New Delhi",
    cityTehsil: "",
    pincode: "",
    alternateMobile: "",
    preferredContact: "Mobile Call (फ़ोन कॉल)",
  },
  litigant: {
    matterType: "जमीन विवाद (Land / Property Dispute)",
    disputeNature: "",
    description: "",
    currentStatus: "Pre-litigation / Notice Stage (प्रारंभिक सूचना चरण)",
    courtJurisdiction: "",
    preferredAssistance: "Legal Consultation & Advisory (परामर्श)",
    urgency: "Normal (सामान्य)",
    existingCaseNumber: "",
    hasAdvocate: "no",
  },
  advocate: {
    lawSchool: "",
    graduationYear: "",
    degreeEarned: "J.D. / LL.M. / LL.B.",
    barAdmissionRegion: "",
    barNumber: "",
    barAdmissionDate: "",
    currentEmployer: "",
    currentJobTitle: "",
    yearsOfExperience: "3-5 Years (Mid-level)",
    practiceAreas: [],
    profileBio: "",
    professionalType: "Advocate (अधिवक्ता)",
    regNumber: "",
    stateBarCouncil: "Bar Council of Delhi",
    practiceArea: "",
    courtJurisdiction: "",
    officeAddress: "",
    professionalEmail: "",
    professionalContact: "",
    languagesKnown: ["Hindi", "English"],
    availability: "Full-time (पूर्णकालिक)",
  },
  franchise: {
    orgName: "",
    authorizedPerson: "",
    operatingDistrict: "New Delhi",
    officeAddress: "",
    businessType: "Sole Proprietorship (एकल स्वामित्व)",
    yearsOfExperience: "3 - 5 Years",
    teamSize: "2 - 5 Members",
    hasInfrastructure: "yes",
    hasEfilingDesk: "yes",
    hasCallCenter: "planned",
    hasLegalAidCenter: "yes",
    expectedServiceArea: "Entire District (संपूर्ण ज़िला)",
    operationalDetails: "",
  },
  documents: {},
  declarationAgreed: false,
};
