// =============================================================================
// ICJ Public Platform — Strict TypeScript Domain Types
// =============================================================================

export type ISODateString = string;

// ---------------------------------------------------------------------------
// Pagination (Django REST Framework compatible)
// ---------------------------------------------------------------------------

export type PublicPaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type PublicPaginationParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  sort?: string;
  [key: string]: string | number | boolean | undefined;
};

// ---------------------------------------------------------------------------
// Justice Services
// ---------------------------------------------------------------------------

export type ServiceCategory =
  | "legal_information"
  | "assistance"
  | "dispute_resolution"
  | "specialized_law"
  | "governance_schemes";

export type JusticeService = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: ServiceCategory;
  categoryLabel: string;
  iconName: string;
  whoItIsFor: string[];
  howIcjHelps: string[];
  availableAssistance: string[];
  nextSteps: string[];
  relatedProfessionals: string[];
  featured?: boolean;
};

// ---------------------------------------------------------------------------
// Find a Professional
// ---------------------------------------------------------------------------

export type ProfessionType =
  | "Advocate"
  | "Chartered Accountant"
  | "Company Secretary"
  | "Cost Accountant"
  | "Tax Professional"
  | "Mediator"
  | "Arbitrator"
  | "Legal Researcher"
  | "Consultant";

export type PublicProfessional = {
  id: string;
  fullName: string;
  profession: ProfessionType | string;
  categoryName?: string;
  photoUrl?: string | null;
  barOrRegNumber?: string;
  stateBarCouncil?: string;
  specialisations: string[];
  experienceYears: number;
  state: string;
  city: string;
  district?: string;
  languages: string[];
  isVerified: boolean;
  profileBio: string;
  availability: "Online" | "Offline" | "Both" | string;
  qualifications: string[];
  courtsOrJurisdiction: string[];
};

// ---------------------------------------------------------------------------
// Legal Research & Publications
// ---------------------------------------------------------------------------

export type ResearchCategory =
  | "Research Paper"
  | "Journal"
  | "White Paper"
  | "Policy Paper"
  | "Case Study"
  | "Legal Update";

export type ResearchPaper = {
  id: string;
  title: string;
  category: ResearchCategory;
  authors: string[];
  abstract: string;
  publishedYear: number;
  publishedDate: ISODateString;
  downloadUrl?: string;
  tags: string[];
  readTimeMinutes: number;
};

// ---------------------------------------------------------------------------
// ICJ Academy
// ---------------------------------------------------------------------------

export type AcademyCourse = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Professional";
  duration: string;
  mode: "Online" | "Hybrid" | "Self-Paced";
  instructor: string;
  instructorTitle: string;
  description: string;
  modulesCount: number;
  certificateProvided: boolean;
  upcomingBatchDate: ISODateString;
  featured?: boolean;
};

export type TrainingEvent = {
  id: string;
  title: string;
  eventType: "Webinar" | "Workshop" | "Seminar" | "Symposium";
  eventDate: ISODateString;
  timeString: string;
  locationOrPlatform: string;
  speaker: string;
  speakerDesignation: string;
  description: string;
  registrationOpen: boolean;
};

// ---------------------------------------------------------------------------
// Knowledge Centre
// ---------------------------------------------------------------------------

export type KnowledgeCategory =
  | "Acts & Statutes"
  | "Judgment Digest"
  | "Legal Articles"
  | "Citizen FAQs"
  | "Legal Forms & Checklists"
  | "Government Schemes";

export type KnowledgeItem = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  publishedDate: ISODateString;
  tags: string[];
  fileUrl?: string;
  readingTime: string;
};

// ---------------------------------------------------------------------------
// Membership & Join ICJ
// ---------------------------------------------------------------------------

export type MembershipTier =
  | "Individual Member"
  | "Professional Member"
  | "Student Member"
  | "Research Fellow"
  | "Institutional Partner"
  | "Corporate Associate";

export type MembershipTierInfo = {
  tier: MembershipTier;
  targetAudience: string;
  description: string;
  benefits: string[];
  eligibility: string[];
  digitalCredentials: string[];
  badgeColor: string;
};

// ---------------------------------------------------------------------------
// Volunteer Hub
// ---------------------------------------------------------------------------

export type VolunteerCategory =
  | "Legal Volunteer"
  | "Research Volunteer"
  | "Technical Volunteer"
  | "Documentation Volunteer"
  | "Education Volunteer"
  | "Translation Volunteer"
  | "Community Outreach";

export type VolunteerProgram = {
  id: string;
  category: VolunteerCategory;
  title: string;
  description: string;
  commitmentHoursPerWeek: string;
  mode: "Remote" | "Field" | "Hybrid";
  skillsRequired: string[];
};

// ---------------------------------------------------------------------------
// Social Justice & Beneficiary Initiatives
// ---------------------------------------------------------------------------

export type SocialImpactProgram = {
  id: string;
  title: string;
  beneficiaryGroup:
    | "Underprivileged Citizens"
    | "Women in Distress"
    | "Children & Juveniles"
    | "Senior Citizens"
    | "Persons with Disabilities"
    | "Rural Communities";
  focusArea: string;
  description: string;
  assistanceProvided: string[];
};

// ---------------------------------------------------------------------------
// Global Network & Chapters
// ---------------------------------------------------------------------------

export type ChapterInfo = {
  id: string;
  name: string;
  type: "National Chapter" | "State Chapter" | "Regional Chapter" | "Partner Institution";
  regionOrState: string;
  leadCoordinator: string;
  focusJurisdiction: string;
};

// ---------------------------------------------------------------------------
// Verification & Audit Tools
// ---------------------------------------------------------------------------

export type CertificateVerification = {
  certificateNumber: string;
  recipientName: string;
  recipientDesignation: string;
  certificateType: string;
  issueDate: ISODateString;
  issuingAuthority: string;
  status: "Valid" | "Invalid" | "Revoked" | "Expired";
  verificationHash: string;
};

export type DonationVerification = {
  receiptNumber: string;
  donorInitials: string;
  donationCategory: string;
  donationDate: ISODateString;
  status: "Verified & Audited" | "Under Processing" | "Invalid Receipt";
  taxExemptionEligible: boolean;
};

// ---------------------------------------------------------------------------
// Media & Announcements
// ---------------------------------------------------------------------------

export type MediaItem = {
  id: string;
  type: "Press Release" | "Announcement" | "Photo Gallery" | "Video Briefing" | "Success Story";
  title: string;
  summary: string;
  publishedDate: ISODateString;
  sourceOrAuthor: string;
  readOrWatchDuration: string;
};
