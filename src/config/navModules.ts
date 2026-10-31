export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavModule = {
  key: string;
  /** Accordion / dropdown heading (same on mobile and desktop). */
  title: string;
  /** Compact label shown in the desktop navy bar. */
  navLabel: string;
  activePaths: string[];
  items: NavLink[];
};

export const NAV_DIRECT_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Contact & State Desks", href: "/contact" },
];

export const NAV_VERIFICATION_LINKS: NavLink[] = [
  { label: "Verify Membership Certificate", href: "/verify-certificate" },
  { label: "Verify 80G Donation Receipt", href: "/verify-donation" },
  { label: "Citizen Grievance Desk", href: "/grievance" },
];

/** Single source of truth — used by mobile drawer and desktop nav. */
export const NAV_MODULES: NavModule[] = [
  {
    key: "about",
    title: "About Consortium",
    navLabel: "About",
    activePaths: ["/about"],
    items: [
      { label: "Overview & Mission", href: "/about", description: "Founding charter, history & mission" },
      { label: "Honorable Advisory Board", href: "/about#governance", description: "Senior jurists & executive board" },
      { label: "International Advisory Board", href: "/about#advisory", description: "Global scholars & jurists" },
      { label: "Founding Charter", href: "/about#history", description: "Institutional history and mandate" },
    ],
  },
  {
    key: "services",
    title: "Justice Services",
    navLabel: "Services",
    activePaths: ["/services"],
    items: [
      { label: "All Justice Services", href: "/services", description: "Complete 18+ service catalog" },
      { label: "Property & Real Estate", href: "/services/property-matters", description: "Title search, builder & tenant disputes" },
      { label: "Consumer Grievance", href: "/services/consumer-assistance", description: "E-commerce, insurance, unfair trade" },
      { label: "Mediation & ADR", href: "/services/mediation-arbitration", description: "Fast-track private dispute resolution" },
      { label: "Cyber Law & Digital Fraud", href: "/services/cyber-law", description: "UPI fraud, data privacy, harassment" },
      { label: "Family Matters", href: "/services/family-matters", description: "Custody, maintenance, counseling" },
      { label: "Corporate Governance", href: "/services/corporate-governance", description: "Regulatory compliance, filings" },
    ],
  },
  {
    key: "professionals",
    title: "Jurists & Professionals",
    navLabel: "Jurists",
    activePaths: ["/professionals", "/directory"],
    items: [
      { label: "Find a Professional", href: "/professionals", description: "Search verified advocates & jurists" },
      { label: "Empaneled Advocates", href: "/professionals?profession=advocate", description: "High Court & Supreme Court counsel" },
      { label: "Chartered Accountants", href: "/professionals?profession=chartered+accountant", description: "Taxation & forensic audit experts" },
      { label: "Arbitrators & Mediators", href: "/professionals?profession=mediator", description: "Certified ADR neutral experts" },
      { label: "Public Directory", href: "/directory", description: "Official institutional empanelment roster" },
    ],
  },
  {
    key: "research",
    title: "Research & Academy",
    navLabel: "Research",
    activePaths: ["/research", "/academy", "/knowledge-centre"],
    items: [
      { label: "Legal Research & Law Journal", href: "/research", description: "Peer-reviewed papers, whitepapers" },
      { label: "ICJ Academy CLE Courses", href: "/academy", description: "CLE certifications & masterclasses" },
      { label: "Knowledge Centre & Guides", href: "/knowledge-centre", description: "Acts, judgments, citizen legal guides" },
    ],
  },
  {
    key: "social",
    title: "Social Justice Missions",
    navLabel: "Social Impact",
    activePaths: ["/social-justice", "/nyaya-daan-mudra", "/donate", "/volunteer"],
    items: [
      { label: "Social Justice & Legal Aid", href: "/social-justice", description: "Free clinics for marginalized citizens" },
      { label: "Nyaya Daan Mudra (NDM)", href: "/nyaya-daan-mudra", description: "Digital social assistance credit" },
      { label: "Support Justice / Donate", href: "/donate", description: "Tax-exempt 80G pro bono fund" },
      { label: "Join as Volunteer", href: "/volunteer", description: "Legal aid internships & fellowships" },
    ],
  },
  {
    key: "network",
    title: "Global Network",
    navLabel: "Network",
    activePaths: ["/global-network", "/service-centres"],
    items: [
      { label: "International Chapters", href: "/global-network", description: "Cross-border jurisdictions & forums" },
      { label: "Service Centres", href: "/service-centres", description: "Physical legal aid facilitation clinics" },
      { label: "Empanelment Directory", href: "/directory", description: "Official institutional empanelment roster" },
    ],
  },
];
