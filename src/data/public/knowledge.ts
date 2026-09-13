import type {
  ChapterInfo,
  DonationVerification,
  CertificateVerification,
  KnowledgeItem,
  MediaItem,
  MembershipTierInfo,
  SocialImpactProgram,
  VolunteerProgram,
} from "@/types/public";

export const mockKnowledgeItems: KnowledgeItem[] = [
  {
    id: "know-1",
    title: "Guide to Filing Consumer Complaints Online via e-Daakhil Portal",
    category: "Legal Forms & Checklists",
    summary:
      "Step-by-step citizen walkthrough for registration, document verification, payment of nominal fees, and tracking complaints across District, State, and National Consumer Commissions.",
    publishedDate: "2026-01-20",
    tags: ["Consumer Protection", "e-Daakhil", "Online Filing", "Citizen Guide"],
    readingTime: "8 min read",
  },
  {
    id: "know-2",
    title: "Key Changes in Bharatiya Nyaya Sanhita (BNS) vs Indian Penal Code (IPC)",
    category: "Acts & Statutes",
    summary:
      "A structured comparative analysis of redefined offences, community service provisions, digital evidence standards, and organized crime penalties under the new criminal codes.",
    publishedDate: "2025-12-15",
    tags: ["BNS", "Criminal Law", "Statutory Digest", "Legal Update"],
    readingTime: "12 min read",
  },
  {
    id: "know-3",
    title: "Understanding Free Legal Aid Entitlements under Section 12 of NALSA Act",
    category: "Citizen FAQs",
    summary:
      "Who is eligible for free counsel, how to apply at District Legal Services Authorities (DLSA), and how to challenge wrongful denial of legal aid.",
    publishedDate: "2025-10-05",
    tags: ["NALSA", "Legal Aid", "Citizen Rights", "Pro Bono"],
    readingTime: "6 min read",
  },
  {
    id: "know-4",
    title: "RERA Homebuyer Protection: Delay Compensation & Refund Remedies",
    category: "Legal Articles",
    summary:
      "Detailed analysis of statutory interest rates on delayed possession, structural defect liabilities, and enforcement orders passed by Real Estate Regulatory Authorities.",
    publishedDate: "2025-09-18",
    tags: ["RERA", "Property Law", "Homebuyers", "Real Estate"],
    readingTime: "10 min read",
  },
];

export const mockMembershipTiers: MembershipTierInfo[] = [
  {
    tier: "Individual Member",
    targetAudience: "Citizens, Legal Aspirants & Social Advocates",
    description:
      "For individuals committed to advancing justice awareness, accessing community legal workshops, and participating in public interest discussions.",
    benefits: [
      "Access to ICJ Digital Knowledge Base and Legal Digest",
      "Priority invites to National Legal Literacy Webinars",
      "Digital Member ID and Identity Verification Certificate",
      "Quarterly Institutional Newsletter and Policy Briefs",
    ],
    eligibility: ["Citizen of India or International Associate", "Age 18+", "Commitment to ICJ Code of Ethics"],
    digitalCredentials: ["Digital Member Badge", "Certificate of Membership"],
    badgeColor: "#2563eb",
  },
  {
    tier: "Professional Member",
    targetAudience: "Advocates, CAs, CSs, Mediators & Arbitrators",
    description:
      "For verified legal, accounting, secretarial, and dispute resolution practitioners seeking peer networking, pro bono opportunities, and empaneled directory listing.",
    benefits: [
      "Verified Public Listing in Find a Professional Directory",
      "Eligibility for appointment referrals and pro bono facilitation",
      "Access to ICJ Academy Advanced Practice Masterclasses",
      "Participation in ICJ National Policy Working Committees",
      "Official Verified Professional Digital Certificate & Seal",
    ],
    eligibility: [
      "Active Bar Council, ICAI, or ICSI Registration",
      "Minimum 1 year of professional practice",
      "Verification of clean disciplinary record",
    ],
    digitalCredentials: ["Verified Practitioner Badge", "Institutional Empanelment Certificate"],
    badgeColor: "#059669",
  },
  {
    tier: "Student Member",
    targetAudience: "LL.B, LL.M, Commerce & Public Policy Students",
    description:
      "Dedicated membership track designed for future jurists and scholars, providing internship linkages, research mentorship, and moot court guidance.",
    benefits: [
      "Eligibility for ICJ Summer & Winter Research Fellowships",
      "Free access to student webinar series and career guidance",
      "Publication opportunities in ICJ Student Journal",
      "Discounted access to ICJ Academy Certificate Courses",
    ],
    eligibility: ["Enrolled in recognized Law School / University", "Valid Student ID Card"],
    digitalCredentials: ["Student Associate Badge", "Fellowship Eligibility Certificate"],
    badgeColor: "#7c3aed",
  },
  {
    tier: "Institutional Partner",
    targetAudience: "Law Firms, Universities, NGOs & Chambers of Commerce",
    description:
      "Institutional partnership for collaborative legal research, clinical legal education, CSR pro bono initiatives, and international legal symposiums.",
    benefits: [
      "Co-branding on Joint Policy Research and Symposiums",
      "Capacity building for organizational staff and students",
      "Direct representation on ICJ Advisory Advisory Councils",
      "Formal Institutional MoU and Digital Partnership Plaque",
    ],
    eligibility: ["Registered Academic Institution, Law Firm, or Registered NGO", "Board Resolution / MoU Consent"],
    digitalCredentials: ["Institutional Partnership Seal", "Annual Accreditation Plaque"],
    badgeColor: "#d97706",
  },
];

export const mockVolunteerPrograms: VolunteerProgram[] = [
  {
    id: "vol-1",
    category: "Legal Volunteer",
    title: "Community Legal Literacy & Guidance Volunteer",
    description:
      "Assist citizens at local legal assistance clinics, draft basic informational summaries, and guide marginalized applicants on statutory entitlement schemes.",
    commitmentHoursPerWeek: "4 - 8 Hours",
    mode: "Hybrid",
    skillsRequired: ["Law Background or Final Year Student", "Empathetic Communication", "Local Language Proficiency"],
  },
  {
    id: "vol-2",
    category: "Research Volunteer",
    title: "Socio-Legal Policy & Legislative Research Volunteer",
    description:
      "Support senior researchers in analyzing court judgments, compiling statutory digests, and conducting comparative policy research on justice sector reforms.",
    commitmentHoursPerWeek: "5 - 10 Hours",
    mode: "Remote",
    skillsRequired: ["Legal Writing & Citation", "Online Database Research", "Analytical Thinking"],
  },
  {
    id: "vol-3",
    category: "Translation Volunteer",
    title: "Vernacular Legal Translation & Accessibility Associate",
    description:
      "Translate citizen legal guides, consumer rights checklists, and FAQs from English into Hindi, Tamil, Bengali, Telugu, Marathi, and Gujarati to bridge the language divide.",
    commitmentHoursPerWeek: "3 - 6 Hours",
    mode: "Remote",
    skillsRequired: ["Bilingual Proficiency", "Understanding of Legal Terminology", "Proofreading"],
  },
];

export const mockSocialImpactPrograms: SocialImpactProgram[] = [
  {
    id: "soc-1",
    title: "Nyaya Sahayata: Free Legal Counseling for Marginalized Citizens",
    beneficiaryGroup: "Underprivileged Citizens",
    focusArea: "Pre-Litigation Guidance & DLSA Linkages",
    description:
      "Providing dignified, accessible, and structured legal orientation to low-income individuals facing property displacement, wage theft, or administrative injustice.",
    assistanceProvided: [
      "Pre-litigation case evaluation",
      "Drafting representations to district authorities",
      "Direct linkage to statutory free legal aid panels",
    ],
  },
  {
    id: "soc-2",
    title: "Stree Nyaya: Legal Empowerment & Safety for Women",
    beneficiaryGroup: "Women in Distress",
    focusArea: "Domestic Violence, Maintenance & Workplace Safety",
    description:
      "Specialized legal aid and confidential mediation support for women dealing with matrimonial abuse, denial of maintenance, and POSH grievances.",
    assistanceProvided: [
      "Confidential counseling by female legal experts",
      "Interim relief petition preparation",
      "Shelter and one-stop crisis center coordination",
    ],
  },
  {
    id: "soc-3",
    title: "Vridh Nyaya: Legal Protection for Senior Citizens",
    beneficiaryGroup: "Senior Citizens",
    focusArea: "Maintenance and Welfare of Parents Act, 2007",
    description:
      "Dedicated legal facilitation ensuring senior citizens secure rightful maintenance, protection against unlawful eviction from self-acquired homes, and elder care enforcement.",
    assistanceProvided: [
      "Filing before Maintenance Tribunals",
      "Will and gift deed revocability advisory",
      "Doorstep legal literacy workshops in senior homes",
    ],
  },
];

export const mockChapters: ChapterInfo[] = [
  {
    id: "chap-1",
    name: "ICJ National Chapter — Northern Region",
    type: "National Chapter",
    regionOrState: "Delhi NCR, Punjab, Haryana, UP, Rajasthan",
    leadCoordinator: "Adv. Rajesh V. Sharma",
    focusJurisdiction: "Supreme Court, Delhi High Court, Punjab & Haryana HC",
  },
  {
    id: "chap-2",
    name: "ICJ Western Region Chapter",
    type: "Regional Chapter",
    regionOrState: "Maharashtra, Gujarat, Goa",
    leadCoordinator: "Adv. Priya S. Kulkarni",
    focusJurisdiction: "Bombay High Court, Gujarat High Court",
  },
  {
    id: "chap-3",
    name: "ICJ Southern Region Chapter",
    type: "Regional Chapter",
    regionOrState: "Karnataka, Tamil Nadu, Telangana, Kerala",
    leadCoordinator: "Dr. Meenakshi Sundaram",
    focusJurisdiction: "Karnataka HC, Madras HC, Telangana HC",
  },
  {
    id: "chap-4",
    name: "ICJ Eastern Region Chapter",
    type: "Regional Chapter",
    regionOrState: "West Bengal, Odisha, Bihar, Assam",
    leadCoordinator: "Adv. Sunita Banerjee",
    focusJurisdiction: "Calcutta High Court, Patna HC, Orissa HC",
  },
];

export const mockMediaItems: MediaItem[] = [
  {
    id: "med-1",
    type: "Press Release",
    title: "ICJ Launches National Digital Justice Literacy Initiative Across 10 States",
    summary:
      "Consortium announces widespread citizen empowerment campaign in collaboration with state bar councils and universities to make legal knowledge accessible in 6 regional languages.",
    publishedDate: "2026-03-01",
    sourceOrAuthor: "ICJ National Secretariat",
    readOrWatchDuration: "4 min read",
  },
  {
    id: "med-2",
    type: "Announcement",
    title: "Call for Papers: ICJ Annual Journal of Comparative Law & Dispute Resolution 2026",
    summary:
      "Jurists, researchers, and practitioners invited to submit manuscripts on ODR mechanisms, corporate insolvency frameworks, and data protection compliance.",
    publishedDate: "2026-02-18",
    sourceOrAuthor: "Editorial Board",
    readOrWatchDuration: "3 min read",
  },
  {
    id: "med-3",
    type: "Video Briefing",
    title: "Key Constitutional Safeguards Every Citizen Should Know: Video Series",
    summary:
      "Expert discussion covering fundamental rights under Article 21, right against arbitrary arrest, and immediate legal remedies under writ jurisdictions.",
    publishedDate: "2026-01-25",
    sourceOrAuthor: "ICJ Media Cell",
    readOrWatchDuration: "14 min watch",
  },
];

export const mockCertificates: Record<string, CertificateVerification> = {
  "ICJ-CERT-2026-001": {
    certificateNumber: "ICJ-CERT-2026-001",
    recipientName: "Adv. Rajesh V. Sharma",
    recipientDesignation: "Empaneled Senior Advocate & Member",
    certificateType: "Certificate of Professional Empanelment",
    issueDate: "2026-01-15",
    issuingAuthority: "International Consortium of Jurists Secretariat",
    status: "Valid",
    verificationHash: "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  },
  "ICJ-ACAD-2026-104": {
    certificateNumber: "ICJ-ACAD-2026-104",
    recipientName: "Dr. Meenakshi Sundaram",
    recipientDesignation: "Accredited Commercial Mediator",
    certificateType: "ICJ Academy Certification in Commercial Mediation",
    issueDate: "2026-02-20",
    issuingAuthority: "ICJ Academy Academic Council",
    status: "Valid",
    verificationHash: "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
};

export const mockDonationReceipts: Record<string, DonationVerification> = {
  "ICJ-DON-84920": {
    receiptNumber: "ICJ-DON-84920",
    donorInitials: "R. K. S.",
    donationCategory: "Social Legal Aid Sponsorship",
    donationDate: "2026-02-10",
    status: "Verified & Audited",
    taxExemptionEligible: true,
  },
  "ICJ-CSR-99412": {
    receiptNumber: "ICJ-CSR-99412",
    donorInitials: "Apex Legal Foundations LLP",
    donationCategory: "Nyaya Daan Mudra Social Justice Fund",
    donationDate: "2026-01-05",
    status: "Verified & Audited",
    taxExemptionEligible: true,
  },
};
