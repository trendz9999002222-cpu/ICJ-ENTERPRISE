import onboardingData from "@/data/onboarding.json";

/** Placeholder master data — future admin-managed API source. */
export const TRUSTEE_PROFILE_STEPS = [
  { id: "personal" as const, title: "Personal Information", subtitle: "Official identity & KYC basics" },
  { id: "governing" as const, title: "Governing Body Details", subtitle: "Trust, designation & appointment" },
  { id: "contact" as const, title: "Contact Information", subtitle: "Phone, email & communication" },
  { id: "registeredAddress" as const, title: "Registered / Official Address", subtitle: "Structured official address" },
  {
    id: "correspondenceAddress" as const,
    title: "Correspondence Address",
    subtitle: "Mailing address (if different)",
  },
  { id: "professional" as const, title: "Professional Information", subtitle: "Occupation & expertise" },
  { id: "kyc" as const, title: "KYC & Documents", subtitle: "Uploads & verification metadata" },
  { id: "declaration" as const, title: "Declaration & Consent", subtitle: "Statutory declaration" },
  { id: "system" as const, title: "System Information", subtitle: "Audit & verification (read-only)" },
];

export const GENDERS = ["Male", "Female", "Transgender", "Prefer Not to Say", "Other"];

export const NATIONALITIES = ["Indian", "Nepalese", "Bhutanese", "Other"];

export const COUNTRIES = ["India", "United States", "United Kingdom", "United Arab Emirates", "Other"];

export const INDIAN_STATES_UT: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman & Nicobar Islands",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Lakshadweep",
];

const onboardingDistricts = onboardingData.stateDistrictsMap as Record<string, string[]>;

export function districtsForState(state: string): string[] {
  const fromMaster = onboardingDistricts[state];
  if (fromMaster?.length) return [...fromMaster, "Other"];
  if (!state) return [];
  return ["Other"];
}

export const ORGANISATIONS_TRUST = [
  "International Consortium of Jurists (ICJ) Trust",
  "ICJ Legal Aid Foundation",
  "ICJ Research & Policy Trust",
  "Other",
];

export const GOVERNING_BODY_TYPES = [
  "Board of Trustees",
  "Governing Body",
  "Executive Committee",
  "Managing Committee",
  "Other",
];

export const DESIGNATIONS = [
  "Founder",
  "Settlor",
  "Managing Trustee",
  "Trustee",
  "Chairperson",
  "President",
  "Vice President",
  "Secretary",
  "Joint Secretary",
  "General Secretary",
  "Treasurer",
  "Joint Treasurer",
  "Governing Body Member",
  "Executive Member",
  "Director",
  "Member",
  "Other",
];

export const APPOINTMENT_STATUSES = [
  "Active",
  "Pending Verification",
  "Inactive",
  "Resigned",
  "Removed",
  "Expired",
  "Deceased",
];

export const GOVERNMENT_ID_TYPES = [
  "Aadhaar",
  "Passport",
  "Voter ID",
  "Driving Licence",
  "Other Government ID",
];

export const OCCUPATIONS = [
  "Advocate / Lawyer",
  "Chartered Accountant",
  "Company Secretary",
  "Cost Accountant",
  "Doctor",
  "Engineer",
  "Architect",
  "Teacher / Professor",
  "Researcher",
  "Consultant",
  "Businessperson",
  "Entrepreneur",
  "Government Service",
  "Private Sector",
  "Social Worker",
  "NGO / Non-Profit Professional",
  "Retired",
  "Student",
  "Homemaker",
  "Other",
];

export const AREAS_OF_EXPERTISE = [
  "Constitutional Law",
  "Corporate Law",
  "Taxation",
  "Criminal Law",
  "Family Law",
  "Arbitration & ADR",
  "Human Rights",
  "Public Policy",
  "Governance & Compliance",
  "Education",
  "Other",
];

export const PROFESSIONAL_REGISTRATION_TYPES = [
  "Bar Council Enrolment",
  "ICAI Membership",
  "ICSI Membership",
  "Medical Council",
  "Engineering Council",
  "Not Applicable",
  "Other",
];

export const LANGUAGES = [
  "Hindi",
  "English",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Urdu",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Other",
];

export const DOCUMENT_TYPES = [
  "Photograph",
  "PAN Card",
  "Aadhaar",
  "Passport",
  "Voter ID",
  "Driving Licence",
  "Address Proof",
  "Appointment Letter",
  "Appointment Resolution",
  "Trustee Declaration",
  "Consent / Acceptance",
  "Resignation Letter",
  "Removal Resolution",
  "Other",
];

export const VERIFICATION_STATUSES = ["Pending", "Verified", "Rejected", "Expired"];

export const PHONE_COUNTRY_CODES = ["+91", "+1", "+44", "+971", "+977"];
