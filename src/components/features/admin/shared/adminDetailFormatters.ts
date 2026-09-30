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

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Calendar date from ISO string — identical on server and client (no locale/timezone drift). */
export function formatAdminDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const datePart = iso.includes("T") ? iso.slice(0, 10) : iso.slice(0, 10);
  const [year, month, day] = datePart.split("-");
  const m = Number(month);
  const d = Number(day);
  if (!year || !m || !d || m < 1 || m > 12) return datePart;
  return `${d} ${MONTHS_SHORT[m - 1]} ${year}`;
}
