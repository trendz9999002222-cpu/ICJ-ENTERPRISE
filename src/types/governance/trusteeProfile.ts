export type TrusteeProfileStepId =
  | "personal"
  | "governing"
  | "contact"
  | "registeredAddress"
  | "correspondenceAddress"
  | "professional"
  | "kyc"
  | "declaration"
  | "system";

export type TrusteeAddressFields = {
  line1: string;
  line2: string;
  landmark: string;
  country: string;
  state: string;
  district: string;
  city: string;
  locality: string;
  pinCode: string;
};

export type TrusteeKycDocumentRow = {
  id: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  fileName: string;
  verificationStatus: string;
  verifiedBy: string;
  verificationDate: string;
  remarks: string;
};

export type TrusteeProfileFormState = {
  fullName: string;
  parentGuardianName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  photographFileName: string;
  panNumber: string;
  governmentIdType: string;
  governmentIdNumber: string;

  organisationTrust: string;
  governingBodyType: string;
  designation: string;
  trusteeSystemId: string;
  dateOfAppointment: string;
  appointmentResolutionRef: string;
  appointmentStatus: string;

  primaryMobile: string;
  primaryMobileCountry: string;
  whatsappNumber: string;
  whatsappCountry: string;
  whatsappSameAsPrimary: boolean;
  email: string;
  alternateMobile: string;
  alternateMobileCountry: string;
  alternateEmail: string;

  registeredAddress: TrusteeAddressFields;
  correspondenceAddress: TrusteeAddressFields;
  correspondenceSameAsRegistered: boolean;

  occupation: string;
  professionalOrganisation: string;
  professionalDesignation: string;
  areasOfExpertise: string[];
  professionalRegistrationType: string;
  professionalRegistrationNumber: string;
  languagesKnown: string[];

  kycDocuments: TrusteeKycDocumentRow[];

  declarationAccepted: boolean;
  signatureFileName: string;
  consentCommunication: boolean;
  consentWhatsapp: boolean;
  consentEmail: boolean;
};

export const EMPTY_ADDRESS: TrusteeAddressFields = {
  line1: "",
  line2: "",
  landmark: "",
  country: "India",
  state: "",
  district: "",
  city: "",
  locality: "",
  pinCode: "",
};

export const INITIAL_TRUSTEE_PROFILE_STATE: TrusteeProfileFormState = {
  fullName: "",
  parentGuardianName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Indian",
  photographFileName: "",
  panNumber: "",
  governmentIdType: "",
  governmentIdNumber: "",

  organisationTrust: "",
  governingBodyType: "",
  designation: "",
  trusteeSystemId: "Auto-generated on save",
  dateOfAppointment: "",
  appointmentResolutionRef: "",
  appointmentStatus: "Pending Verification",

  primaryMobile: "",
  primaryMobileCountry: "+91",
  whatsappNumber: "",
  whatsappCountry: "+91",
  whatsappSameAsPrimary: false,
  email: "",
  alternateMobile: "",
  alternateMobileCountry: "+91",
  alternateEmail: "",

  registeredAddress: { ...EMPTY_ADDRESS },
  correspondenceAddress: { ...EMPTY_ADDRESS },
  correspondenceSameAsRegistered: false,

  occupation: "",
  professionalOrganisation: "",
  professionalDesignation: "",
  areasOfExpertise: [],
  professionalRegistrationType: "",
  professionalRegistrationNumber: "",
  languagesKnown: [],

  kycDocuments: [],

  declarationAccepted: false,
  signatureFileName: "",
  consentCommunication: false,
  consentWhatsapp: false,
  consentEmail: false,
};
