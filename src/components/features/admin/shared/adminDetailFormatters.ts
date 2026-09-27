const FIELD_LABEL_MAP: Record<string, string> = {
  fullName: "Full Name",
  full_name: "Full Name",
  email: "Email Address",
  mobile: "Mobile Number",
  phone: "Phone Number",
  date_of_birth: "Date of Birth",
  dob: "Date of Birth",
  gender: "Gender",
  profession: "Profession",
  enrolment_id: "Enrolment ID",
  enrollment_number: "Enrollment Number",
  declaration_accepted: "Declaration Accepted",
};

const DOC_KEY_LABELS: Record<string, string> = {
  government_id: "Government ID",
  address_proof: "Address Proof",
  photograph: "Photograph",
  pan_card: "PAN Card",
  aadhaar: "Aadhaar",
};

export function formatFieldKey(key: string): string {
  if (FIELD_LABEL_MAP[key]) return FIELD_LABEL_MAP[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function formatDocKey(key: string): string {
  if (DOC_KEY_LABELS[key]) return DOC_KEY_LABELS[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function isImageUrl(url?: string | null, name?: string): boolean {
  const n = (name || url || "").toLowerCase();
  return /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(n);
}

export function isPdfUrl(url?: string | null, name?: string): boolean {
  const n = (name || url || "").toLowerCase();
  return n.endsWith(".pdf");
}
