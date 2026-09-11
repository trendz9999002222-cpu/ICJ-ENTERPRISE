export type OnboardingRole = "citizen" | "advocate" | "franchise";

export type OnboardingStep = {
  id: number;
  titleHi: string;
  titleEn: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1, titleHi: "रोल चयन", titleEn: "Role Selection" },
  { id: 2, titleHi: "पहचान व नाम", titleEn: "Applicant Identity" },
  { id: 3, titleHi: "संपर्क व पासवर्ड", titleEn: "Contact & Password" },
  { id: 4, titleHi: "विधिक विशेषज्ञता", titleEn: "Practice & Registration" },
  { id: 5, titleHi: "अधिकार क्षेत्र", titleEn: "Jurisdiction & Address" },
  { id: 6, titleHi: "अंतिम समीक्षा", titleEn: "Review & Verification" },
];

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

/** Colors aligned with GATEWAY_CARDS in home.ts */
export const ONBOARDING_ROLES: OnboardingRoleOption[] = [
  {
    id: "citizen",
    stepLabel: "1",
    titleHi: "नागरिक विधिक सहायता",
    titleEn: "Litigant Client",
    descriptionHi: "ज़मीन विवाद, क्रिमिनल बेल, चेक बाउंस, सर्विस मैटर, पारिवारिक व उपभोक्ता विवाद",
    color: "#059669",
    border: "#10b981",
    bg: "#d1fae5",
    chipBg: "#064e3b",
    chipColor: "#6ee7b7",
    icon: "citizen",
  },
  {
    id: "advocate",
    stepLabel: "2",
    titleHi: "अधिवक्ता व विशेषज्ञ पैनल",
    titleEn: "Advocate Partner",
    descriptionHi: "बार काउंसिल पंजीकृत अधिवक्ता, सीए, सीएस, फोरेंसिक एक्सपर्ट व लीगल कंसल्टेंट",
    color: "#1d4ed8",
    border: "#3b82f6",
    bg: "#dbeafe",
    chipBg: "#1e3a8a",
    chipColor: "#93c5fd",
    icon: "advocate",
  },
  {
    id: "franchise",
    stepLabel: "3",
    titleHi: "ज़िला फ्रेंचाइज़ी पार्टनर",
    titleEn: "District Franchise",
    descriptionHi: "ज़िला स्तर पर विधिक सहायता केंद्र, ई-फाइलिंग डेस्क व कॉल सेंटर एजेंसी",
    color: "#b45309",
    border: "#f59e0b",
    bg: "#fef3c7",
    chipBg: "#78350f",
    chipColor: "#fde68a",
    icon: "franchise",
  },
];

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

export const PREFIX_OPTIONS = [
  "Adv. (अधिवक्ता)",
  "Sr. Adv. (वरिष्ठ अधिवक्ता)",
  "Dr. (डॉक्टर)",
  "Mr. (श्री)",
  "Mrs. (श्रीमती)",
  "Ms. (सुश्री)",
];

export const GENDER_OPTIONS = [
  "Male (पुरुष)",
  "Female (महिला)",
  "Other (अन्य)",
];

/** Years of birth from 2007 down to 1945 */
export const YEAR_OF_BIRTH_OPTIONS = Array.from({ length: 63 }, (_, i) => String(2007 - i));

/** Entity types for Organisation / Firm */
export const ENTITY_TYPE_OPTIONS = [
  "Law Firm (लॉ फर्म)",
  "LLP (सीमित देयता भागीदारी)",
  "Sole Proprietorship (एकल स्वामित्व)",
  "Partnership Firm (साझेदारी फर्म)",
  "Legal Chamber / Associates (लीगल चैंबर)",
  "Private Limited (प्रा. लि.)",
];

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

export const PROFESSIONAL_CATEGORIES = [
  "Core Legal & Court Practitioners",
  "Corporate & Commercial Legal Advisors",
  "Tax, GST & Financial Advocates",
  "Civil, Property & Revenue Specialists",
  "Criminal Defense & Trial Counsel",
  "Family, Matrimonial & Mediation Experts",
  "Constitutional & Appellate Advocates",
  "Cyber Law, IPR & Tech Specialists",
];

export const EXPERIENCE_LEVELS = [
  "Junior Professional (0 - 2 Years)",
  "Practicing Associate (2 - 5 Years)",
  "Senior Professional (5 - 10 Years)",
  "Distinguished Counsel (10 - 20 Years)",
  "Veteran / Senior Advocate (20+ Years)",
];

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

export const INDIAN_STATES = [
  "Delhi",
  "Uttar Pradesh",
  "Maharashtra",
  "Bihar",
  "Rajasthan",
  "Madhya Pradesh",
  "Haryana",
  "Punjab",
  "Gujarat",
  "West Bengal",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Andhra Pradesh",
  "Kerala",
  "Odisha",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Assam",
  "Chandigarh",
  "Goa",
];

export const STATE_DISTRICTS_MAP: Record<string, string[]> = {
  Delhi: [
    "New Delhi",
    "Central Delhi",
    "South Delhi",
    "North Delhi",
    "East Delhi",
    "West Delhi",
    "South West Delhi",
    "North West Delhi",
    "Shahdara",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Noida / Gautam Buddha Nagar",
    "Ghaziabad",
    "Kanpur Nagar",
    "Varanasi",
    "Prayagraj",
    "Agra",
    "Meerut",
    "Gorakhpur",
    "Bareilly",
    "Aligarh",
  ],
  Maharashtra: [
    "Mumbai",
    "Mumbai Suburban",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Aurangabad / Chhatrapati Sambhajinagar",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Muzaffarpur",
    "Bhagalpur",
    "Araria",
    "Purnia",
    "Darbhanga",
    "Begusarai",
  ],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Panchkula"],
  Punjab: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
};


