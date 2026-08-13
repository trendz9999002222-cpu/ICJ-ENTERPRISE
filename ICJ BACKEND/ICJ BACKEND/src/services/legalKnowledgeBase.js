/**
 * ICJ Legal Knowledge Base — Static System Knowledge Layer
 * 
 * LAYER B: Legal Knowledge (System-level, NOT user data)
 * Contains: Required field schemas, intelligent questions, document requirements
 * per matter type and document type.
 * 
 * This is AUTHORITATIVE SYSTEM DATA — NOT case-specific private matter data.
 * Private matter data lives in icj_legal_cases_v2 (legalEcosystemService).
 */

// ─── MATTER TYPE DEFINITIONS ────────────────────────────────────────────────
export const MATTER_TYPES = {
  CIVIL: "Civil Dispute",
  CRIMINAL: "Criminal Matter",
  HIGH_COURT_WRIT: "High Court / Writ",
  DRT: "DRT / DRAT / Banking",
  ARBITRATION: "Arbitration",
  COMMERCIAL: "Commercial Dispute",
  PROPERTY: "Property / Revenue",
  PARTNERSHIP: "Partnership / Business",
  CONSUMER: "Consumer / Regulatory",
  FAMILY: "Family Matter",
  RTI: "RTI / Right to Information",
  REPRESENTATION: "Representation / Application",
};

// ─── DOCUMENT TYPE → REQUIRED FIELDS SCHEMA ──────────────────────────────────
// Each schema defines what data is REQUIRED, OPTIONAL, what documents are needed,
// and what intelligent context-aware questions to ask when data is missing.
// THIS IS NOT USER DATA. These are structural legal requirements.

export const DOCUMENT_SCHEMAS = {
  "Legal Notice": {
    matterType: MATTER_TYPES.CIVIL,
    requiredFields: [
      { key: "petitioner_name", label: "Sender / Petitioner Name", type: "text" },
      { key: "respondent_name", label: "Recipient / Noticee Name", type: "text" },
      { key: "respondent_address", label: "Noticee Address (Full)", type: "text" },
      { key: "subject_matter", label: "Subject / Nature of Dispute", type: "text" },
      { key: "cause_of_action_date", label: "Date When Cause of Action Arose", type: "date" },
      { key: "relief_demanded", label: "Relief / Demand in Notice", type: "text" },
      { key: "response_period_days", label: "Reply Period (days)", type: "number" },
    ],
    optionalFields: [
      { key: "advocate_name", label: "Sending Advocate Name", type: "text" },
      { key: "prior_communication", label: "Prior Correspondence Reference", type: "text" },
    ],
    documentRequirements: ["Original agreement/contract if applicable", "Prior correspondence"],
    intelligentQuestions: {
      respondent_address: "What is the complete address of the person/entity you are sending this notice to?",
      cause_of_action_date: "On what date did the dispute/breach first occur?",
      relief_demanded: "What do you want the other party to do? (e.g., pay ₹X, vacate property, stop activity)",
      response_period_days: "How many days should the noticee be given to respond? (typically 15-30 days)",
    },
    readinessThreshold: 70,
    blockingFields: ["petitioner_name", "respondent_name", "respondent_address", "relief_demanded"],
  },

  "Civil Suit": {
    matterType: MATTER_TYPES.CIVIL,
    requiredFields: [
      { key: "plaintiff_name", label: "Plaintiff Name (Full)", type: "text" },
      { key: "plaintiff_address", label: "Plaintiff Address", type: "text" },
      { key: "defendant_name", label: "Defendant Name (Full)", type: "text" },
      { key: "defendant_address", label: "Defendant Address", type: "text" },
      { key: "court_name", label: "Court Name & Location", type: "text" },
      { key: "cause_of_action", label: "Cause of Action (Brief)", type: "text" },
      { key: "cause_of_action_date", label: "Date of Cause of Action", type: "date" },
      { key: "relief_sought", label: "Relief / Prayer Sought", type: "text" },
      { key: "valuation", label: "Court Fee Valuation (₹)", type: "number" },
    ],
    optionalFields: [
      { key: "jurisdiction_facts", label: "Jurisdictional Facts", type: "text" },
      { key: "previous_notices", label: "Prior Legal Notices Sent", type: "text" },
      { key: "limitation_period_basis", label: "Basis for Limitation Period", type: "text" },
    ],
    documentRequirements: ["Agreement/Contract", "Legal Notice (if sent)", "Prior court orders if any", "Evidence documents"],
    intelligentQuestions: {
      cause_of_action_date: "On what specific date did the cause of action arise? (This is critical for limitation period calculation)",
      valuation: "What is the total value of the suit for court fee purposes?",
      relief_sought: "List all reliefs you want: (1) Declaration (2) Injunction (3) Recovery of money (4) Possession (5) Other?",
      jurisdiction_facts: "Why does this particular court have jurisdiction? (territorial / pecuniary)",
    },
    readinessThreshold: 70,
    blockingFields: ["plaintiff_name", "defendant_name", "court_name", "cause_of_action", "relief_sought"],
  },

  "Written Statement": {
    matterType: MATTER_TYPES.CIVIL,
    requiredFields: [
      { key: "defendant_name", label: "Defendant / Respondent Name", type: "text" },
      { key: "plaintiff_name", label: "Plaintiff Name", type: "text" },
      { key: "case_number", label: "Case/Suit Number", type: "text" },
      { key: "court_name", label: "Court Name", type: "text" },
      { key: "denials", label: "Specific Denials (Para-wise)", type: "textarea" },
      { key: "defence_facts", label: "Positive Defences / Facts", type: "textarea" },
    ],
    optionalFields: [
      { key: "counter_claim", label: "Counter Claim (if any)", type: "text" },
    ],
    documentRequirements: ["Copy of Plaint", "Documents supporting defence"],
    intelligentQuestions: {
      case_number: "What is the Case/Suit Number as shown on the Court Summons?",
      denials: "Which paragraphs of the plaint do you deny, and on what grounds?",
      defence_facts: "What are the key facts supporting your defence?",
    },
    readinessThreshold: 70,
    blockingFields: ["defendant_name", "plaintiff_name", "case_number", "court_name"],
  },

  "Affidavit": {
    matterType: MATTER_TYPES.CIVIL,
    requiredFields: [
      { key: "deponent_name", label: "Deponent Name (Full)", type: "text" },
      { key: "deponent_age", label: "Deponent Age", type: "number" },
      { key: "deponent_address", label: "Deponent Address (Full)", type: "text" },
      { key: "affidavit_purpose", label: "Purpose of Affidavit", type: "text" },
      { key: "statement_facts", label: "Facts to be Affirmed", type: "textarea" },
      { key: "court_or_authority", label: "Court / Authority Before Whom Filed", type: "text" },
    ],
    optionalFields: [
      { key: "case_number", label: "Case Number (if for court)", type: "text" },
    ],
    documentRequirements: ["ID proof of deponent"],
    intelligentQuestions: {
      affidavit_purpose: "What is this affidavit being filed for? (e.g., in support of application, in compliance with court order)",
      statement_facts: "State the facts you wish to affirm under oath.",
    },
    readinessThreshold: 70,
    blockingFields: ["deponent_name", "affidavit_purpose", "statement_facts"],
  },

  "RTI Application": {
    matterType: MATTER_TYPES.RTI,
    requiredFields: [
      { key: "applicant_name", label: "Applicant Name (Full)", type: "text" },
      { key: "applicant_address", label: "Applicant Address", type: "text" },
      { key: "pio_name_office", label: "Public Information Officer / Public Authority Name & Address", type: "text" },
      { key: "information_sought", label: "Information Sought (Specific & Clear)", type: "textarea" },
      { key: "period_of_information", label: "Time Period of Information Required", type: "text" },
    ],
    optionalFields: [
      { key: "purpose", label: "Purpose (Not Mandatory under RTI Act)", type: "text" },
      { key: "preferred_format", label: "Preferred Format of Information", type: "text" },
    ],
    documentRequirements: ["Court fee / application fee (₹10 where applicable)", "BPL certificate if exempt from fee"],
    intelligentQuestions: {
      pio_name_office: "To which Public Information Officer / Public Authority is this RTI being sent? (Specify department and address)",
      information_sought: "What specific information are you seeking? Be precise — vague requests may be rejected.",
      period_of_information: "For what time period do you need the information? (e.g., 01-Apr-2023 to 31-Mar-2024)",
    },
    readinessThreshold: 60,
    blockingFields: ["applicant_name", "pio_name_office", "information_sought"],
  },

  "Appeal Petition": {
    matterType: MATTER_TYPES.CIVIL,
    requiredFields: [
      { key: "appellant_name", label: "Appellant Name", type: "text" },
      { key: "respondent_name", label: "Respondent Name", type: "text" },
      { key: "original_order_date", label: "Date of Impugned Order", type: "date" },
      { key: "original_court_authority", label: "Original Court / Authority that passed the order", type: "text" },
      { key: "grounds_of_appeal", label: "Grounds of Appeal", type: "textarea" },
      { key: "relief_sought", label: "Relief Sought in Appeal", type: "text" },
      { key: "appellate_court", label: "Appellate Court / Forum", type: "text" },
    ],
    optionalFields: [
      { key: "limitation_condonation", label: "Grounds for Condonation of Delay (if filed late)", type: "text" },
    ],
    documentRequirements: ["Certified copy of impugned order", "Original pleadings if available"],
    intelligentQuestions: {
      original_order_date: "On what date was the order you are appealing against passed?",
      grounds_of_appeal: "On what legal or factual grounds are you challenging the order?",
      limitation_condonation: "Is the appeal being filed within the limitation period? If not, what are the reasons for delay?",
    },
    readinessThreshold: 75,
    blockingFields: ["appellant_name", "respondent_name", "original_order_date", "grounds_of_appeal"],
  },

  "Writ Petition": {
    matterType: MATTER_TYPES.HIGH_COURT_WRIT,
    requiredFields: [
      { key: "petitioner_name", label: "Petitioner Name (Full)", type: "text" },
      { key: "respondents", label: "Respondents (State / Authority / Officials)", type: "textarea" },
      { key: "constitutional_right_violated", label: "Constitutional Right Violated (Article No.)", type: "text" },
      { key: "impugned_action", label: "Impugned Action / Order / Notification", type: "text" },
      { key: "relief_sought", label: "Relief Sought (Writ of Mandamus / Certiorari / Prohibition / Quo Warranto / Habeas Corpus)", type: "text" },
      { key: "jurisdiction_basis", label: "Basis for High Court Jurisdiction", type: "text" },
      { key: "statement_of_facts", label: "Concise Statement of Facts", type: "textarea" },
    ],
    optionalFields: [
      { key: "interim_relief", label: "Interim / Ad-Interim Relief Sought", type: "text" },
      { key: "legal_provisions", label: "Relevant Legal Provisions / Statutes", type: "text" },
    ],
    documentRequirements: ["Impugned order/notification (certified)", "Supporting affidavit", "Vakalatnama"],
    intelligentQuestions: {
      constitutional_right_violated: "Which fundamental right under the Constitution has been violated? (e.g., Article 14, 19, 21)",
      impugned_action: "What specific action, order, or notification are you challenging?",
      interim_relief: "Do you need any urgent interim relief (stay/injunction) along with the main petition?",
    },
    readinessThreshold: 75,
    blockingFields: ["petitioner_name", "respondents", "constitutional_right_violated", "relief_sought"],
  },

  "Arbitration Petition": {
    matterType: MATTER_TYPES.ARBITRATION,
    requiredFields: [
      { key: "claimant_name", label: "Claimant Name", type: "text" },
      { key: "respondent_name", label: "Respondent Name", type: "text" },
      { key: "arbitration_clause_ref", label: "Arbitration Clause Reference (contract, clause no.)", type: "text" },
      { key: "dispute_nature", label: "Nature of Dispute", type: "text" },
      { key: "relief_claimed", label: "Relief / Amount Claimed", type: "text" },
      { key: "seat_of_arbitration", label: "Seat of Arbitration", type: "text" },
    ],
    optionalFields: [
      { key: "arbitrator_preference", label: "Arbitrator Preference (if any)", type: "text" },
    ],
    documentRequirements: ["Contract/Agreement with arbitration clause", "Notice invoking arbitration", "Correspondence"],
    intelligentQuestions: {
      arbitration_clause_ref: "Please provide the contract name, date, and clause number that provides for arbitration.",
      seat_of_arbitration: "Where is the seat of arbitration as per the agreement, or where do you propose it to be?",
    },
    readinessThreshold: 70,
    blockingFields: ["claimant_name", "respondent_name", "arbitration_clause_ref", "dispute_nature"],
  },

  "Consumer Complaint": {
    matterType: MATTER_TYPES.CONSUMER,
    requiredFields: [
      { key: "complainant_name", label: "Complainant Name", type: "text" },
      { key: "opposite_party_name", label: "Opposite Party (Seller/Service Provider)", type: "text" },
      { key: "opposite_party_address", label: "Opposite Party Address", type: "text" },
      { key: "product_service", label: "Product / Service Purchased", type: "text" },
      { key: "purchase_date", label: "Date of Purchase / Transaction", type: "date" },
      { key: "amount_paid", label: "Amount Paid (₹)", type: "number" },
      { key: "deficiency_description", label: "Description of Deficiency / Defect / Unfair Trade Practice", type: "textarea" },
      { key: "relief_sought", label: "Relief Sought", type: "text" },
    ],
    optionalFields: [
      { key: "invoice_number", label: "Invoice / Receipt Number", type: "text" },
      { key: "prior_complaint", label: "Prior Complaint to Opposite Party", type: "text" },
    ],
    documentRequirements: ["Invoice/Receipt", "Warranty card (if applicable)", "Correspondence with opposite party"],
    intelligentQuestions: {
      deficiency_description: "Describe specifically what went wrong — defective product, service failure, overcharging, or unfair practice?",
      relief_sought: "What relief do you want? (Refund, replacement, compensation, removal of deficiency, punitive damages?)",
    },
    readinessThreshold: 65,
    blockingFields: ["complainant_name", "opposite_party_name", "product_service", "deficiency_description"],
  },

  "Criminal Complaint": {
    matterType: MATTER_TYPES.CRIMINAL,
    requiredFields: [
      { key: "complainant_name", label: "Complainant Name (Full)", type: "text" },
      { key: "accused_name", label: "Accused Name(s)", type: "text" },
      { key: "accused_address", label: "Accused Address (if known)", type: "text" },
      { key: "offence_date", label: "Date of Offence", type: "date" },
      { key: "offence_place", label: "Place of Offence", type: "text" },
      { key: "offence_description", label: "Description of Offence (Factual, Not Legal Conclusions)", type: "textarea" },
      { key: "fir_number", label: "FIR Number (if already registered)", type: "text" },
      { key: "police_station", label: "Police Station", type: "text" },
      { key: "ipc_sections", label: "Applicable Sections (IPC/BNS/Special Law)", type: "text" },
    ],
    optionalFields: [
      { key: "witnesses", label: "Names of Witnesses (if any)", type: "text" },
      { key: "evidence_available", label: "Evidence Available", type: "text" },
    ],
    documentRequirements: ["FIR copy (if registered)", "Medical reports (if assault)", "CCTV footage reference", "Witness statements"],
    intelligentQuestions: {
      fir_number: "Has an FIR already been registered? If yes, provide FIR number and police station.",
      offence_description: "Describe what happened in chronological order — who did what, when, where, and how.",
      ipc_sections: "Which sections of IPC/BNS apply? (If unsure, describe offence and advocate will identify sections)",
    },
    readinessThreshold: 70,
    blockingFields: ["complainant_name", "accused_name", "offence_date", "offence_description"],
  },

  "Agreement / MOU": {
    matterType: MATTER_TYPES.COMMERCIAL,
    requiredFields: [
      { key: "party1_name", label: "First Party Name (Full)", type: "text" },
      { key: "party1_address", label: "First Party Address", type: "text" },
      { key: "party2_name", label: "Second Party Name (Full)", type: "text" },
      { key: "party2_address", label: "Second Party Address", type: "text" },
      { key: "agreement_purpose", label: "Purpose / Subject of Agreement", type: "text" },
      { key: "agreement_date", label: "Agreement Date", type: "date" },
      { key: "key_terms", label: "Key Terms & Conditions", type: "textarea" },
      { key: "duration", label: "Duration / Term of Agreement", type: "text" },
    ],
    optionalFields: [
      { key: "consideration", label: "Consideration / Payment Terms (₹)", type: "text" },
      { key: "dispute_resolution", label: "Dispute Resolution Clause", type: "text" },
      { key: "governing_law", label: "Governing Law & Jurisdiction", type: "text" },
    ],
    documentRequirements: ["ID proofs of parties", "Prior correspondence (if any)"],
    intelligentQuestions: {
      agreement_purpose: "What is this agreement for? (e.g., Services, Supply, Joint Venture, Collaboration, NDA)",
      key_terms: "List the main obligations of each party.",
      duration: "For how long will this agreement be valid?",
    },
    readinessThreshold: 65,
    blockingFields: ["party1_name", "party2_name", "agreement_purpose", "key_terms"],
  },

  "Lease Deed": {
    matterType: MATTER_TYPES.PROPERTY,
    requiredFields: [
      { key: "lessor_name", label: "Lessor (Owner) Name", type: "text" },
      { key: "lessee_name", label: "Lessee (Tenant) Name", type: "text" },
      { key: "property_description", label: "Property Description (Address, Area, Survey/Khasra No.)", type: "text" },
      { key: "lease_start_date", label: "Lease Start Date", type: "date" },
      { key: "lease_duration", label: "Lease Duration (months/years)", type: "text" },
      { key: "monthly_rent", label: "Monthly Rent (₹)", type: "number" },
      { key: "security_deposit", label: "Security Deposit (₹)", type: "number" },
    ],
    optionalFields: [
      { key: "permitted_use", label: "Permitted Use (Residential/Commercial)", type: "text" },
      { key: "maintenance_terms", label: "Maintenance Terms", type: "text" },
      { key: "renewal_terms", label: "Renewal Terms", type: "text" },
    ],
    documentRequirements: ["Property ownership documents", "ID proofs of parties"],
    intelligentQuestions: {
      property_description: "Provide complete property description including address, Khasra/Survey number, area in sq.ft/sq.m.",
      security_deposit: "What is the security deposit amount? (Usually 1-3 months rent)",
    },
    readinessThreshold: 70,
    blockingFields: ["lessor_name", "lessee_name", "property_description", "monthly_rent"],
  },

  "Sale Deed": {
    matterType: MATTER_TYPES.PROPERTY,
    requiredFields: [
      { key: "seller_name", label: "Seller Name (Full)", type: "text" },
      { key: "buyer_name", label: "Buyer Name (Full)", type: "text" },
      { key: "property_description", label: "Property Description (Survey/Khasra/Plot No., Area, Location)", type: "text" },
      { key: "sale_consideration", label: "Sale Consideration / Price (₹)", type: "number" },
      { key: "execution_date", label: "Date of Execution", type: "date" },
      { key: "property_title_origin", label: "Origin of Title / Chain of Title", type: "text" },
    ],
    optionalFields: [
      { key: "encumbrances", label: "Existing Encumbrances / Mortgages", type: "text" },
    ],
    documentRequirements: ["Original title deed", "Encumbrance certificate", "Revenue records", "NOC if applicable"],
    intelligentQuestions: {
      property_description: "Provide Khasra number, plot number, survey number, area, and complete address of the property.",
      property_title_origin: "How did the seller acquire this property? (Purchase, inheritance, gift, partition?)",
    },
    readinessThreshold: 75,
    blockingFields: ["seller_name", "buyer_name", "property_description", "sale_consideration"],
  },

  "Power of Attorney": {
    matterType: MATTER_TYPES.CIVIL,
    requiredFields: [
      { key: "principal_name", label: "Principal (Grantor) Name", type: "text" },
      { key: "attorney_name", label: "Attorney (Agent) Name", type: "text" },
      { key: "poa_purpose", label: "Purpose / Powers Granted", type: "textarea" },
      { key: "execution_date", label: "Date of Execution", type: "date" },
    ],
    optionalFields: [
      { key: "duration", label: "Duration of POA (or perpetual)", type: "text" },
      { key: "revocation_terms", label: "Revocation Terms", type: "text" },
    ],
    documentRequirements: ["ID proof of principal", "ID proof of attorney"],
    intelligentQuestions: {
      poa_purpose: "What specific powers are you granting? (e.g., property management, court appearances, banking, signing documents)",
    },
    readinessThreshold: 60,
    blockingFields: ["principal_name", "attorney_name", "poa_purpose"],
  },

  "Trust Deed": {
    matterType: MATTER_TYPES.PARTNERSHIP,
    requiredFields: [
      { key: "trust_name", label: "Name of Trust", type: "text" },
      { key: "settlor_name", label: "Settlor / Author Name", type: "text" },
      { key: "trustees", label: "Trustee Names (All)", type: "textarea" },
      { key: "trust_objects", label: "Objects / Purposes of Trust", type: "textarea" },
      { key: "initial_corpus", label: "Initial Corpus / Endowment (₹)", type: "number" },
      { key: "trust_address", label: "Registered Address of Trust", type: "text" },
    ],
    optionalFields: [
      { key: "beneficiaries", label: "Beneficiaries (if specific)", type: "text" },
    ],
    documentRequirements: ["ID proofs of trustees and settlor", "Address proof for trust office"],
    intelligentQuestions: {
      trust_objects: "What are the charitable or specific purposes for which this trust is being created?",
      initial_corpus: "What is the initial amount being transferred to the trust as corpus?",
    },
    readinessThreshold: 70,
    blockingFields: ["trust_name", "settlor_name", "trustees", "trust_objects"],
  },

  "Board Resolution": {
    matterType: MATTER_TYPES.COMMERCIAL,
    requiredFields: [
      { key: "company_name", label: "Company / Organisation Name", type: "text" },
      { key: "cin_registration", label: "CIN / Registration Number", type: "text" },
      { key: "meeting_date", label: "Date of Board Meeting", type: "date" },
      { key: "resolution_subject", label: "Subject / Matter of Resolution", type: "text" },
      { key: "resolution_text", label: "Resolution Text", type: "textarea" },
      { key: "directors_present", label: "Directors / Members Present", type: "textarea" },
    ],
    optionalFields: [
      { key: "quorum_confirmation", label: "Quorum Confirmation", type: "text" },
    ],
    documentRequirements: ["Memorandum of Association", "Articles of Association", "Previous board minutes"],
    intelligentQuestions: {
      resolution_subject: "What decision is the board passing? (e.g., opening bank account, authorizing signatory, approving investment)",
      directors_present: "List all directors/members present with their DIN numbers.",
    },
    readinessThreshold: 70,
    blockingFields: ["company_name", "resolution_subject", "resolution_text", "meeting_date"],
  },
};

// ─── DOCUMENT EXTRACTION FIELD PATTERNS ──────────────────────────────────────
// Regex / keyword patterns used to extract typed fields from raw document text
// These power the OCR extraction pipeline

export const EXTRACTION_PATTERNS = {
  dates: /\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/gi,
  caseNumbers: /\b(?:Case|Suit|Petition|Appeal|Complaint|Application|WP|CWP|FAO|CS|CC|IA|MA|OA|SA|RA|TS|RS|CA|SLP|Arb\.?|Ref\.?)\s*[No.#]*\s*[\d/\-]+(?:\/\d{4})?\b/gi,
  amounts: /₹\s*[\d,]+(?:\.\d{2})?|Rs\.?\s*[\d,]+(?:\.\d{2})?|\bRupees?\s+[\w\s]+(?:only)?/gi,
  sections: /[Ss]ection\s+\d+[A-Za-z]?(?:\s+(?:of|r\/w)\s+[A-Za-z\s]+(?:Act|Code|Rules?)\s*,?\s*\d{4})?/gi,
  khasraNumbers: /[Kk]hasra\s*[Nn]o\.?\s*[\d/\-]+|[Pp]lot\s*[Nn]o\.?\s*[\d/\-]+|[Ss]urvey\s*[Nn]o\.?\s*[\d/\-]+/gi,
  firNumbers: /FIR\s*[Nn]o\.?\s*[\d/\-]+/gi,
  parties: /(?:Petitioner|Plaintiff|Complainant|Appellant|Applicant|Claimant|Versus|Vs\.?|Defendant|Respondent|Accused|Opposite\s+Party)\s*[:\-]?\s*([A-Z][a-zA-Z\s\.]+)/g,
};

// ─── DOCUMENT TYPE PATTERNS (for auto-classification of uploaded documents) ──
export const DOCUMENT_CLASSIFICATION_PATTERNS = [
  { type: "FIR", patterns: ["first information report", "fir no", "police station", "ipc section"] },
  { type: "Court Order", patterns: ["hereby ordered", "dismissed", "allowed", "writ of", "the court"] },
  { type: "Agreement/Contract", patterns: ["this agreement", "parties agree", "terms and conditions", "memorandum of understanding"] },
  { type: "Legal Notice", patterns: ["legal notice", "take notice", "hereby called upon", "within days"] },
  { type: "Property Document", patterns: ["khasra", "khatauni", "registry", "sale deed", "lease deed", "rent agreement"] },
  { type: "Affidavit", patterns: ["solemnly affirm", "do hereby declare", "sworn before", "notary"] },
  { type: "RTI Application", patterns: ["right to information", "public information officer", "section 6", "rti"] },
];

export default {
  MATTER_TYPES,
  DOCUMENT_SCHEMAS,
  EXTRACTION_PATTERNS,
  DOCUMENT_CLASSIFICATION_PATTERNS,
};
