import type { TrusteeProfileStepId } from "@/types/governance/trusteeProfile";

export type TrusteeMasterKey =
  | "genders"
  | "nationalities"
  | "countries"
  | "indianStates"
  | "organisations"
  | "governingBodyTypes"
  | "designations"
  | "appointmentStatuses"
  | "governmentIdTypes"
  | "occupations"
  | "areasOfExpertise"
  | "professionalRegistrationTypes"
  | "languages"
  | "documentTypes"
  | "verificationStatuses"
  | "phoneCountryCodes";

export type TrusteeFieldType =
  | "text"
  | "date"
  | "email"
  | "file"
  | "autocomplete"
  | "multiselect"
  | "checkbox"
  | "readonly"
  | "phone"
  | "address-block"
  | "correspondence-block"
  | "kyc-documents"
  | "declaration-block"
  | "system-info";

export type TrusteeFieldConfig = {
  name: string;
  label: string;
  type: TrusteeFieldType;
  required?: boolean;
  masterKey?: TrusteeMasterKey;
  col?: number;
  helperText?: string;
};

export type TrusteeStepConfig = {
  id: TrusteeProfileStepId;
  fields: TrusteeFieldConfig[];
};

/** Config-driven sections — swap master data source later without changing the flow UI. */
export const TRUSTEE_PROFILE_SECTIONS: TrusteeStepConfig[] = [
  {
    id: "personal",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true, col: 6 },
      { name: "parentGuardianName", label: "Father / Husband / Mother Name", type: "text", col: 6 },
      { name: "dateOfBirth", label: "Date of Birth", type: "date", col: 4 },
      { name: "gender", label: "Gender", type: "autocomplete", masterKey: "genders", col: 4 },
      { name: "nationality", label: "Nationality", type: "autocomplete", masterKey: "nationalities", col: 4 },
      { name: "photographFileName", label: "Photograph", type: "file", col: 6 },
      { name: "panNumber", label: "PAN Number", type: "text", col: 6 },
      { name: "governmentIdType", label: "Government ID Type", type: "autocomplete", masterKey: "governmentIdTypes", col: 6 },
      { name: "governmentIdNumber", label: "Government ID Number", type: "text", col: 6 },
    ],
  },
  {
    id: "governing",
    fields: [
      { name: "organisationTrust", label: "Organisation / Trust", type: "autocomplete", masterKey: "organisations", required: true, col: 6 },
      { name: "governingBodyType", label: "Governing Body Type", type: "autocomplete", masterKey: "governingBodyTypes", required: true, col: 6 },
      { name: "designation", label: "Designation / Position", type: "autocomplete", masterKey: "designations", required: true, col: 6 },
      { name: "trusteeSystemId", label: "Trustee / Governing Body ID", type: "readonly", col: 6 },
      { name: "dateOfAppointment", label: "Date of Appointment", type: "date", col: 4 },
      { name: "appointmentResolutionRef", label: "Appointment / Resolution Reference No.", type: "text", col: 4 },
      { name: "appointmentStatus", label: "Appointment Status", type: "autocomplete", masterKey: "appointmentStatuses", col: 4 },
    ],
  },
  {
    id: "contact",
    fields: [
      { name: "primaryMobile", label: "Primary Mobile Number", type: "phone", required: true, col: 8 },
      { name: "whatsappNumber", label: "WhatsApp Number", type: "phone", required: true, col: 8 },
      { name: "whatsappSameAsPrimary", label: "WhatsApp Number Same as Primary Mobile Number", type: "checkbox", col: 12 },
      { name: "email", label: "Email ID", type: "email", required: true, col: 6 },
      { name: "alternateMobile", label: "Alternate Mobile Number", type: "phone", col: 6 },
      { name: "alternateEmail", label: "Alternate Email ID", type: "email", col: 6 },
    ],
  },
  {
    id: "registeredAddress",
    fields: [{ name: "registeredAddress", label: "Registered / Official Address", type: "address-block", col: 12 }],
  },
  {
    id: "correspondenceAddress",
    fields: [{ name: "correspondenceAddress", label: "Correspondence Address", type: "correspondence-block", col: 12 }],
  },
  {
    id: "professional",
    fields: [
      { name: "occupation", label: "Occupation / Profession", type: "autocomplete", masterKey: "occupations", col: 6 },
      { name: "professionalOrganisation", label: "Organisation / Institution", type: "autocomplete", masterKey: "organisations", col: 6 },
      { name: "professionalDesignation", label: "Professional Designation", type: "text", col: 6 },
      { name: "areasOfExpertise", label: "Area of Expertise", type: "multiselect", masterKey: "areasOfExpertise", col: 6 },
      { name: "professionalRegistrationType", label: "Professional Registration Type", type: "autocomplete", masterKey: "professionalRegistrationTypes", col: 6 },
      { name: "professionalRegistrationNumber", label: "Professional Registration Number", type: "text", col: 6 },
      { name: "languagesKnown", label: "Languages Known", type: "multiselect", masterKey: "languages", col: 12 },
    ],
  },
  {
    id: "kyc",
    fields: [{ name: "kycDocuments", label: "KYC / Document Management", type: "kyc-documents", col: 12 }],
  },
  {
    id: "declaration",
    fields: [{ name: "declaration", label: "Declaration & Consent", type: "declaration-block", col: 12 }],
  },
  {
    id: "system",
    fields: [{ name: "system", label: "System / Verification Information", type: "system-info", col: 12 }],
  },
];

export const TRUSTEE_STEP_IDS = TRUSTEE_PROFILE_SECTIONS.map((s) => s.id);
