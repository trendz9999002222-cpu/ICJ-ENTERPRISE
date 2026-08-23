// ICJ ENTERPRISE PLATFORM — LEGAL & PROFESSIONAL TAXONOMY MASTER (100% ENGLISH)
// Two-Tier Hierarchical Classification for All Legal, Financial, Quasi-Judicial & Field Professionals

export const LEGAL_TAXONOMY_CATEGORIES = [
  {
    id: "CAT_LEGAL_PRACTITIONERS",
    categoryName: "Core Legal & Court Practitioners",
    description: "Advocates, Senior Counsels, Government Pleaders & Legal Aid Counsels practicing in Courts",
    icon: "Gavel",
    color: "#1e3a8a",
    bg: "#eff6ff",
    regFieldLabel: "Bar Council Enrollment Number (e.g. D/1234/2020, UP/5678/2018)",
    subCategories: [
      {
        id: "SC_HC_ADVOCATE",
        title: "Supreme Court & High Court Senior / Standing Counsel",
        targetRole: "advocate",
        defaultSpecialization: "Constitutional Law, Writs, Civil & Criminal Appeals",
      },
      {
        id: "DISTRICT_COURT_ADVOCATE",
        title: "District & Sessions Court Advocate",
        targetRole: "advocate",
        defaultSpecialization: "Civil Suits, Criminal Defense, Family Law & Bail Matters",
      },
      {
        id: "PUBLIC_PROSECUTOR",
        title: "Public Prosecutor / Government Pleader / APP",
        targetRole: "advocate",
        defaultSpecialization: "State Prosecutions, Criminal Trials & Government Litigation",
      },
      {
        id: "LEGAL_AID_COUNSEL",
        title: "Amicus Curiae / Legal Aid Defense Counsel (DLSA / SLSA)",
        targetRole: "advocate",
        defaultSpecialization: "Indigent Defense, Pro-Bono Litigation & Public Rights",
      },
    ],
  },
  {
    id: "CAT_CORPORATE_FINANCE_TAX",
    categoryName: "Corporate, Finance & Tax Experts",
    description: "Chartered Accountants, Company Secretaries, CMAs, Insolvency Professionals & Valuers",
    icon: "AccountBalance",
    color: "#0369a1",
    bg: "#f0f9ff",
    regFieldLabel: "ICAI / ICSI / ICMAI / IBBI Membership Number",
    subCategories: [
      {
        id: "CHARTERED_ACCOUNTANT",
        title: "Chartered Accountant (CA) — Direct/Indirect Tax, Audit & GST",
        targetRole: "advocate",
        defaultSpecialization: "Income Tax, GST, Statutory Audit & Corporate Tax Planning",
      },
      {
        id: "COMPANY_SECRETARY",
        title: "Company Secretary (CS) — Corporate Governance, ROC & NCLT",
        targetRole: "advocate",
        defaultSpecialization: "Companies Act Compliance, ROC Filings, Mergers & NCLT Matters",
      },
      {
        id: "COST_MANAGEMENT_ACCOUNTANT",
        title: "Cost and Management Accountant (CMA) — Cost Audit & Valuation",
        targetRole: "advocate",
        defaultSpecialization: "Cost Audit, Product Costing & Financial Due Diligence",
      },
      {
        id: "INSOLVENCY_PROFESSIONAL",
        title: "Insolvency Resolution Professional (IRP / Liquidator under IBC)",
        targetRole: "advocate",
        defaultSpecialization: "Corporate Insolvency Resolution (CIRP) & Liquidation",
      },
      {
        id: "REGISTERED_VALUER",
        title: "Registered Valuer — Land, Building, Plant & Financial Securities",
        targetRole: "advocate",
        defaultSpecialization: "Asset Valuation under IBC and Companies Act 2013",
      },
    ],
  },
  {
    id: "CAT_ADR_DISPUTE_RESOLUTION",
    categoryName: "Alternative Dispute Resolution (ADR)",
    description: "Empaneled Arbitrators, Certified Mediators, Conciliators & Lok Adalat Panelists",
    icon: "Handshake",
    color: "#4338ca",
    bg: "#eef2ff",
    regFieldLabel: "ADR Empanelment / High Court Accreditation ID",
    subCategories: [
      {
        id: "EMPANELED_ARBITRATOR",
        title: "Empaneled Arbitrator (Commercial & Contractual Disputes)",
        targetRole: "advocate",
        defaultSpecialization: "Domestic & International Commercial Arbitration",
      },
      {
        id: "CERTIFIED_MEDIATOR",
        title: "Certified Mediator & Conciliator (Family, Matrimonial & Civil)",
        targetRole: "advocate",
        defaultSpecialization: "Pre-Litigation Mediation & Mutual Settlement Conciliation",
      },
      {
        id: "LOK_ADALAT_PANELIST",
        title: "Lok Adalat Panelist / Dispute Resolution Member",
        targetRole: "advocate",
        defaultSpecialization: "Speedy Compoundable Dispute Resolution",
      },
    ],
  },
  {
    id: "CAT_COURT_APPOINTEES",
    categoryName: "Court Appointees & Quasi-Judicial Officers",
    description: "Notaries Public, Oath Commissioners, Court Commissioners & Court Receivers",
    icon: "Verified",
    color: "#b45309",
    bg: "#fffbeb",
    regFieldLabel: "Government / High Court Appointment Certificate Reference No.",
    subCategories: [
      {
        id: "NOTARY_PUBLIC",
        title: "Notary Public (Appointed by Central / State Government)",
        targetRole: "advocate",
        defaultSpecialization: "Affidavits Attestation, Deeds Notarization & Legal Contracts",
      },
      {
        id: "OATH_COMMISSIONER",
        title: "Oath Commissioner (Authorized for Affidavits Verification)",
        targetRole: "advocate",
        defaultSpecialization: "Affidavit Verification for District Courts & High Court",
      },
      {
        id: "COURT_COMMISSIONER",
        title: "Court Commissioner / Local Commissioner (Spot Inspection)",
        targetRole: "advocate",
        defaultSpecialization: "Spot Demarcation, Local Inspection & Evidence Recording",
      },
      {
        id: "COURT_RECEIVER",
        title: "Court Receiver / Asset Administrator",
        targetRole: "advocate",
        defaultSpecialization: "Judicial Custody & Management of Disputed Properties",
      },
    ],
  },
  {
    id: "CAT_SPECIALIZED_CONSULTANTS",
    categoryName: "Specialized Legal Consultants",
    description: "IPR Attorneys, Cyber Law Experts, RERA Consultants & Labour Advisors",
    icon: "Security",
    color: "#0f766e",
    bg: "#f0fdfa",
    regFieldLabel: "Specialization License / Council Registration No.",
    subCategories: [
      {
        id: "IPR_ATTORNEY",
        title: "Intellectual Property Attorney (Patent, Trademark, Copyright & Design)",
        targetRole: "advocate",
        defaultSpecialization: "Trademark Registration, Patent Prosecution & Infringement Suits",
      },
      {
        id: "CYBER_LAW_CONSULTANT",
        title: "Cyber Law & Data Protection Consultant (IT Act & DPDP Act 2023)",
        targetRole: "advocate",
        defaultSpecialization: "Cyber Crime Defense, Online Financial Fraud & Data Privacy",
      },
      {
        id: "RERA_CONSULTANT",
        title: "Real Estate & RERA Regulatory Consultant",
        targetRole: "advocate",
        defaultSpecialization: "Builder-Buyer Disputes, 30-Year Property Title Search & RERA Litigations",
      },
      {
        id: "LABOUR_LAW_ADVISOR",
        title: "Labour, Industrial & Employment Law Advisor",
        targetRole: "advocate",
        defaultSpecialization: "Industrial Disputes, Labour Courts, EPF & ESI Compliance",
      },
      {
        id: "CUSTOMS_FEMA_CONSULTANT",
        title: "Customs, FEMA, Foreign Trade & Banking Consultant",
        targetRole: "advocate",
        defaultSpecialization: "Cross-Border Trade Compliance, Customs Adjudication & FEMA",
      },
    ],
  },
  {
    id: "CAT_DOCUMENTATION_SUPPORT",
    categoryName: "Documentation & Field Support Services",
    description: "Licensed Deed Writers, Stamp Vendors, Court Drafters & Advocate Clerks",
    icon: "Description",
    color: "#7c2d12",
    bg: "#fff7ed",
    regFieldLabel: "Deed Writer License / Bar Association Clerk ID / Vendor License No.",
    subCategories: [
      {
        id: "DEED_WRITER",
        title: "Licensed Deed Writer / Legal Document Writer (Vasika Navees)",
        targetRole: "advocate",
        defaultSpecialization: "Sale Deeds, Gift Deeds, Wills, Agreements to Sell & GPA",
      },
      {
        id: "STAMP_VENDOR",
        title: "Stamp Vendor / Authorized e-Stamp Provider",
        targetRole: "advocate",
        defaultSpecialization: "Physical & Digital Judicial / Non-Judicial e-Stamp Papers",
      },
      {
        id: "LEGAL_TYPIST_DRAFTER",
        title: "Legal Typist & Court Drafting Specialist",
        targetRole: "advocate",
        defaultSpecialization: "Pleadings, Petitions, Applications & Legal Notice Formats",
      },
      {
        id: "ADVOCATE_CLERK",
        title: "Advocate Clerk / Registered Munshi (Bar Association Member)",
        targetRole: "advocate",
        defaultSpecialization: "Court Filing, Cause List Tracking, Summons Service & Certified Copies",
      },
      {
        id: "REVENUE_PARALEGAL",
        title: "Tehsil Revenue & Land Records (Bhulekh) Paralegal",
        targetRole: "advocate",
        defaultSpecialization: "Khasra, Khatauni, Land Mutation (Dakhil Kharij) & Demarcation",
      },
    ],
  },
];

export const EXPERIENCE_LEVELS = [
  "Entry Level (0 - 2 Years)",
  "Mid Level (2 - 5 Years)",
  "Senior Professional (5 - 10 Years)",
  "Veteran / Expert (10+ Years)",
  "Distinguished Counsel / Senior Partner (15+ Years)",
];

export default {
  LEGAL_TAXONOMY_CATEGORIES,
  EXPERIENCE_LEVELS,
};
