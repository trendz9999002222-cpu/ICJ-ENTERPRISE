/**
 * ICJ Universal Search Index
 * All searchable content on the public website.
 * Structure is translation-ready — strings are isolated for future i18n API.
 */

export type SearchCategory =
  | "service"
  | "professional"
  | "faq"
  | "research"
  | "course"
  | "assistance"
  | "page"
  | "form";

export interface SearchEntry {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle?: string;
  keywords: string[];
  href: string;
}

export const SEARCH_INDEX: SearchEntry[] = [
  // ─── SERVICES ───────────────────────────────────────────────────
  {
    id: "svc-property",
    category: "service",
    title: "Property & Real Estate Disputes",
    subtitle: "Title verification, builder disputes, tenant eviction, possession matters",
    keywords: ["property", "real estate", "builder", "tenant", "title", "plot", "flat", "land", "possession", "registry", "sampatti", "zameen"],
    href: "/services/property-matters",
  },
  {
    id: "svc-consumer",
    category: "service",
    title: "Consumer Grievance & Protection",
    subtitle: "E-commerce fraud, insurance, product defects, unfair trade practices",
    keywords: ["consumer", "fraud", "cheating", "refund", "amazon", "flipkart", "insurance", "product", "warranty", "defect", "complaint"],
    href: "/services/consumer-assistance",
  },
  {
    id: "svc-adr",
    category: "service",
    title: "Mediation & Arbitration (ADR)",
    subtitle: "Fast-track private dispute resolution, commercial arbitration",
    keywords: ["mediation", "arbitration", "adr", "dispute", "settlement", "compromise", "samjhauta", "vivad"],
    href: "/services/mediation-arbitration",
  },
  {
    id: "svc-cyber",
    category: "service",
    title: "Cyber Law & Digital Fraud",
    subtitle: "UPI fraud, OTP scam, data privacy, online harassment, phishing",
    keywords: ["cyber", "upi", "otp", "fraud", "hacking", "digital", "online", "phishing", "scam", "privacy", "instagram", "whatsapp", "bank fraud"],
    href: "/services/cyber-law",
  },
  {
    id: "svc-family",
    category: "service",
    title: "Family Law & Matrimonial Matters",
    subtitle: "Divorce, child custody, maintenance, domestic violence, matrimonial counseling",
    keywords: ["family", "divorce", "custody", "maintenance", "alimony", "domestic violence", "matrimonial", "talaaq", "bachche", "separation"],
    href: "/services/family-matters",
  },
  {
    id: "svc-corporate",
    category: "service",
    title: "Corporate Governance & Compliance",
    subtitle: "Regulatory compliance, company law, SEBI, MCA filings, contracts",
    keywords: ["corporate", "company", "compliance", "mca", "sebi", "gst", "contract", "legal notice", "business", "startup", "roc"],
    href: "/services/corporate-governance",
  },
  {
    id: "svc-all",
    category: "service",
    title: "All Justice Services",
    subtitle: "Complete catalog of 18+ legal services",
    keywords: ["services", "all", "legal help", "court", "advocate", "lawyer"],
    href: "/services",
  },

  // ─── PROFESSIONALS ───────────────────────────────────────────────
  {
    id: "pro-advocate",
    category: "professional",
    title: "Find an Advocate",
    subtitle: "Search verified advocates: High Court, Supreme Court, District Court",
    keywords: ["advocate", "lawyer", "vakeel", "attorney", "barrister", "counsel", "high court", "supreme court"],
    href: "/professionals?profession=advocate",
  },
  {
    id: "pro-ca",
    category: "professional",
    title: "Chartered Accountant",
    subtitle: "Taxation, audit, forensic accounting, GST experts",
    keywords: ["ca", "chartered accountant", "tax", "gst", "audit", "income tax", "itr", "accountant"],
    href: "/professionals?profession=chartered+accountant",
  },
  {
    id: "pro-mediator",
    category: "professional",
    title: "Arbitrator / Mediator",
    subtitle: "Certified ADR neutral experts for dispute resolution",
    keywords: ["arbitrator", "mediator", "adr", "neutral", "dispute resolution"],
    href: "/professionals?profession=mediator",
  },
  {
    id: "pro-all",
    category: "professional",
    title: "Professional Directory",
    subtitle: "Browse all empaneled jurists and professionals",
    keywords: ["directory", "professionals", "find", "search", "empaneled", "registered"],
    href: "/professionals",
  },

  // ─── FAQs ─────────────────────────────────────────────────────────
  {
    id: "faq-membership",
    category: "faq",
    title: "How do I become an ICJ member?",
    subtitle: "Membership eligibility, documents, fees and process",
    keywords: ["membership", "join", "member", "registration", "enroll", "advocate membership", "fee", "documents"],
    href: "/membership",
  },
  {
    id: "faq-probono",
    category: "faq",
    title: "Can I get free legal help?",
    subtitle: "Pro bono eligibility, Nyaya Daan Mudra, social justice programs",
    keywords: ["free legal", "pro bono", "muft", "free help", "poor", "nyaya daan", "ndm", "scholarship", "assist"],
    href: "/social-justice",
  },
  {
    id: "faq-certificate",
    category: "faq",
    title: "Verify ICJ Membership Certificate",
    subtitle: "Check authenticity of ICJ issued membership or training certificate",
    keywords: ["verify", "certificate", "check", "authentic", "membership card", "certificate number"],
    href: "/verify-certificate",
  },
  {
    id: "faq-grievance",
    category: "faq",
    title: "File a Complaint / Grievance",
    subtitle: "Ombudsman escalation, professional misconduct, unresolved disputes",
    keywords: ["complaint", "grievance", "complain", "misconduct", "ombudsman", "escalate", "shikayat"],
    href: "/grievance",
  },

  // ─── RESEARCH ────────────────────────────────────────────────────
  {
    id: "res-journal",
    category: "research",
    title: "ICJ Law Journal & Research Papers",
    subtitle: "Peer-reviewed papers, policy whitepapers, open-access legal research",
    keywords: ["research", "paper", "journal", "whitepaper", "legal", "academic", "publication", "pdf"],
    href: "/research",
  },
  {
    id: "res-knowledge",
    category: "research",
    title: "Knowledge Centre",
    subtitle: "Acts, judgments, legal guides for citizens and practitioners",
    keywords: ["knowledge", "acts", "judgment", "guide", "ipc", "crpc", "constitution", "law", "legal literacy"],
    href: "/knowledge-centre",
  },

  // ─── COURSES ──────────────────────────────────────────────────────
  {
    id: "crs-academy",
    category: "course",
    title: "ICJ Academy — CLE Courses",
    subtitle: "Continuing legal education, certifications, masterclasses",
    keywords: ["course", "academy", "training", "certificate", "cle", "education", "class", "learn", "webinar", "workshop"],
    href: "/academy",
  },

  // ─── ASSISTANCE PROGRAMMES ────────────────────────────────────────
  {
    id: "ast-citizen",
    category: "assistance",
    title: "Seek Legal Assistance (Citizen Triage)",
    subtitle: "Submit your matter for free assessment and professional referral",
    keywords: ["help", "assist", "triage", "refer", "free", "consultation", "problem", "issue", "pareshani", "madad"],
    href: "/assistance",
  },
  {
    id: "ast-ndm",
    category: "assistance",
    title: "Nyaya Daan Mudra (NDM) Programme",
    subtitle: "Social credit legal sponsorship for underprivileged citizens",
    keywords: ["ndm", "nyaya daan", "sponsor", "fund", "social credit", "poor", "underprivileged", "donate for legal"],
    href: "/nyaya-daan-mudra",
  },
  {
    id: "ast-volunteer",
    category: "assistance",
    title: "Volunteer / Legal Aid Internship",
    subtitle: "Join ICJ as a volunteer advocate, intern, or legal aid fellow",
    keywords: ["volunteer", "intern", "internship", "fellowship", "seva", "join", "contribute"],
    href: "/volunteer",
  },

  // ─── PAGES ────────────────────────────────────────────────────────
  {
    id: "pg-about",
    category: "page",
    title: "About ICJ",
    subtitle: "Founding charter, mission, history and governance",
    keywords: ["about", "icj", "history", "mission", "vision", "council", "founded", "charter"],
    href: "/about",
  },
  {
    id: "pg-contact",
    category: "page",
    title: "Contact Us",
    subtitle: "Reach ICJ secretariat, departments and regional desks",
    keywords: ["contact", "phone", "email", "address", "office", "secretariat", "helpline", "sampark"],
    href: "/contact",
  },
  {
    id: "pg-donate",
    category: "page",
    title: "Donate to Justice Fund",
    subtitle: "Tax-exempt 80G pro bono legal aid donations",
    keywords: ["donate", "donation", "fund", "80g", "tax exempt", "contribution", "daan"],
    href: "/donate",
  },
  {
    id: "pg-global",
    category: "page",
    title: "Global Network & International Chapters",
    subtitle: "ICJ chapters across jurisdictions globally",
    keywords: ["global", "international", "chapter", "network", "foreign", "abroad", "nri"],
    href: "/global-network",
  },

  // ─── FORMS ────────────────────────────────────────────────────────
  {
    id: "frm-verify-cert",
    category: "form",
    title: "Verify Certificate Number",
    subtitle: "Enter a certificate number to check authenticity",
    keywords: ["verify certificate", "check certificate", "certificate number", "fake certificate"],
    href: "/verify-certificate",
  },
  {
    id: "frm-verify-donation",
    category: "form",
    title: "Verify Donation Receipt",
    subtitle: "Confirm 80G donation receipt issued by ICJ",
    keywords: ["verify donation", "receipt", "80g", "confirm donation"],
    href: "/verify-donation",
  },
  {
    id: "frm-track",
    category: "form",
    title: "Track Your Case / Matter",
    subtitle: "Check status of submitted matter or assistance request",
    keywords: ["track", "case", "status", "matter", "follow up"],
    href: "/track-case",
  },
];

/** Category display config (label, icon name, color) for rendering */
export const CATEGORY_CONFIG: Record<SearchCategory, { label: string; color: string }> = {
  service: { label: "Service", color: "#1d4ed8" },
  professional: { label: "Professional", color: "#059669" },
  faq: { label: "FAQ", color: "#7c3aed" },
  research: { label: "Research", color: "#b45309" },
  course: { label: "Course", color: "#0891b2" },
  assistance: { label: "Assistance", color: "#dc2626" },
  page: { label: "Page", color: "#475569" },
  form: { label: "Tool", color: "#64748b" },
};

/**
 * Search the index with a query string.
 * Returns top 8 results sorted by relevance.
 */
export function searchContent(query: string): SearchEntry[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];

  const scored = SEARCH_INDEX.map((entry) => {
    let score = 0;
    const titleLower = entry.title.toLowerCase();
    const subtitleLower = (entry.subtitle ?? "").toLowerCase();

    if (titleLower.includes(q)) score += 10;
    if (titleLower.startsWith(q)) score += 5;
    if (subtitleLower.includes(q)) score += 4;
    entry.keywords.forEach((kw) => {
      if (kw.includes(q)) score += 3;
      if (q.includes(kw)) score += 2;
    });

    return { entry, score };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.entry);
}
