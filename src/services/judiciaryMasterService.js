/**
 * JudiciaryMasterService — ICJ Enterprise Platform (v4.0 Mega Edition)
 * 
 * Comprehensive Master Repository for:
 * 1. 5-Tier Judicial Architecture:
 *    - Tier 1: Supreme Court of India (26 Master Case Types)
 *    - Tier 2: All-India High Courts (37 Master Case Types across 25 High Courts)
 *    - Tier 3: District & Subordinate Courts (25 Establishment Case Types)
 *    - Tier 4: Tehsil & Revenue Department (8-Level Revenue Hierarchy & 6 Case Types)
 *    - Tier 5: Specialized Statutory Tribunals (NCLT, DRT, NGT, CAT, Consumer, ITAT, RERA, AFT, CGIT)
 * 2. 16-Character eCourts CNR (Case Number Record) Live Validation Engine
 * 3. 12 Practice Core Specialties
 */

// ─── 1. TOP-LEVEL JUDICIAL FORUM TIERS ───────────────────────────────────────
export const JUDICIAL_TIERS = [
  { id: "SUPREME_COURT", label: "Supreme Court of India", hindiLabel: "सुप्रीम कोर्ट ऑफ़ इंडिया", icon: "🏛️", description: "Apex Constitutional & Direct Statutory Court (New Delhi)" },
  { id: "HIGH_COURT", label: "High Court of Judicature", hindiLabel: "उच्च न्यायालय (हाई कोर्ट)", icon: "⚖️", description: "25 High Courts across States & UTs (Writs, Appeals & Revisions)" },
  { id: "DISTRICT_COURT", label: "District & Subordinate Courts", hindiLabel: "जिला व सत्र न्यायालय", icon: "🏢", description: "District & Sessions, Commercial, Family, POCSO & CJM Courts" },
  { id: "TEHSIL_REVENUE", label: "Tehsil & Revenue Department", hindiLabel: "तहसील व राजस्व विभाग", icon: "📜", description: "SDM, Tehsildar, Mutation (दाखिल-खारिज), Khasra & चकबंदी Courts" },
  { id: "SPECIAL_TRIBUNAL", label: "Special Statutory Tribunals", hindiLabel: "विशेष अधिकरण व आयोग", icon: "💼", description: "NCLT, DRT, NGT, CAT, Consumer Commissions, ITAT, RERA & AFT" },
];

export const JUDICIAL_FORUMS = [
  { rank: 1, id: "SUPREME_COURT", name: "Supreme Court of India (SLPs, Writs & Constitutional Bench)", badgeColor: "#7c3aed" },
  { rank: 2, id: "HIGH_COURT", name: "High Courts of Judicature (Writs, Appeals, Commercial & Revisions)", badgeColor: "#1d4ed8" },
  { rank: 3, id: "DISTRICT_COURT", name: "District & Subordinate Courts (Civil, Criminal, Sessions & Family)", badgeColor: "#059669" },
  { rank: 4, id: "TEHSIL_SDM", name: "Tehsil & Revenue Courts (Mutation, Khasra, SDM & चकबंदी)", badgeColor: "#d97706" },
  { rank: 5, id: "NCLT_NCLAT", name: "NCLT / NCLAT (Corporate Insolvency IBC 2016 & Mergers)", badgeColor: "#2563eb" },
  { rank: 6, id: "NGT", name: "NGT (National Green Tribunal - Environmental Laws)", badgeColor: "#047857" },
  { rank: 7, id: "DRT_DRAT", name: "DRT / DRAT (Debts Recovery & SARFAESI Banking)", badgeColor: "#b91c1c" },
  { rank: 8, id: "RERA_CONSUMER", name: "RERA & Consumer Protection Commission (NCDRC/SCDRC/DCDRC)", badgeColor: "#c026d3" },
  { rank: 9, id: "CAT", name: "CAT (Central Administrative Tribunal - Service & Pension)", badgeColor: "#4f46e5" },
  { rank: 10, id: "LABOUR_COURT", name: "Labour Court & Central Govt Industrial Tribunal (CGIT)", badgeColor: "#475569" },
];

// ─── 2. SUPREME COURT OF INDIA (26 MASTER CASE TYPES) ────────────────────────
export const SUPREME_COURT_CASE_TYPES = [
  // Group A: Direct to Supreme Court (बिना हाई कोर्ट)
  { id: "SC_WP_CIVIL", group: "Direct Matters (बिना हाई कोर्ट)", code: "W.P.(C)", name: "Writ Petition (Civil) — Art. 32", category: "Constitutional & Civil Fundamental Rights", subCategories: ["Service & Employment", "Educational Admission & Reservation", "Government Policy Challenge", "Civil Liberties & Privacy (Art 21)"] },
  { id: "SC_WP_CRL", group: "Direct Matters (बिना हाई कोर्ट)", code: "W.P.(CRL)", name: "Writ Petition (Criminal) — Art. 32", category: "Personal Liberty & Custodial Protection", subCategories: ["Habeas Corpus (बंदी प्रत्यक्षीकरण)", "Illegal Detention & Custodial Torture", "Police Protection Order", "Independent Investigation (CBI/SIT)"] },
  { id: "SC_WP_PIL", group: "Direct Matters (बिना हाई कोर्ट)", code: "W.P.(PIL)", name: "Public Interest Litigation (PIL) — Art. 32", category: "Public Interest & Environmental Law", subCategories: ["Environmental Protection & Pollution", "Citizen Governance & Transparency", "Electoral Reforms", "Public Health & Safety"] },
  { id: "SC_TP_CIVIL", group: "Direct Matters (बिना हाई कोर्ट)", code: "T.P.(C)", name: "Transfer Petition (Civil) — Sec 25 CPC", category: "Inter-State Civil / Matrimonial Transfer", subCategories: ["Matrimonial Divorce Transfer (HMA)", "Maintenance Case Transfer (125 CrPC)", "Civil Suit Inter-State Transfer", "Custody Matter Transfer"] },
  { id: "SC_TP_CRL", group: "Direct Matters (बिना हाई कोर्ट)", code: "T.P.(CRL)", name: "Transfer Petition (Criminal) — Sec 406 CrPC / 447 BNSS", category: "Inter-State Criminal Trial Transfer", subCategories: ["Criminal Trial Transfer for Fair Trial", "FIR Investigation Inter-State Transfer", "Threat to Witness / Complainant"] },
  { id: "SC_ORIGINAL_SUIT", group: "Direct Matters (बिना हाई कोर्ट)", code: "O.S.", name: "Original Suit — Article 131", category: "Federal Inter-State Disputes", subCategories: ["State Govt vs Union of India", "Inter-State River Water Dispute", "Inter-State Boundary Dispute", "Tax & Revenue Devolution Conflict"] },
  { id: "SC_ARB_PET", group: "Direct Matters (बिना हाई कोर्ट)", code: "ARB.PET.", name: "Arbitration Petition (International) — Sec 11(6)", category: "International Commercial Arbitration", subCategories: ["Appointment of Sole Arbitrator (Foreign Party)", "Appointment of Presiding Arbitrator", "Arbitral Tribunal Constitution"] },
  { id: "SC_CA_NCLAT", group: "Direct Matters (बिना हाई कोर्ट)", code: "C.A.(IBC)", name: "Corporate Insolvency Appeal — Sec 62 IBC 2016", category: "NCLAT Direct Statutory Appeal", subCategories: ["Corporate Insolvency Resolution Process (CIRP)", "Liquidation & Asset Sale Appeal", "Resolution Plan Approval Dispute", "Section 7/9 IBC Admission Challenge"] },
  { id: "SC_CA_NGT", group: "Direct Matters (बिना हाई कोर्ट)", code: "C.A.(NGT)", name: "Environmental Appeal — Sec 22 NGT Act 2010", category: "NGT Direct Statutory Appeal", subCategories: ["Environmental Clearance (EC) Cancellation", "Pollution Penalty / Compensation Order", "Industrial / Construction Closure Order"] },
  { id: "SC_CA_NCDRC", group: "Direct Matters (बिना हाई कोर्ट)", code: "C.A.(NCDRC)", name: "National Consumer Appeal — Sec 67 Consumer Act", category: "NCDRC Direct Statutory Appeal", subCategories: ["Builder-Buyer Delayed Possession Claim", "Medical Negligence Compensation Claim", "Commercial Insurance repudiation Claim"] },
  { id: "SC_CA_SAT", group: "Direct Matters (बिना हाई कोर्ट)", code: "C.A.(SEBI)", name: "Securities Appeal — Sec 15Z SEBI Act 1992", category: "SAT / SEBI Direct Statutory Appeal", subCategories: ["Insider Trading & Market Manipulation", "SEBI Disgorgement / Penalty Order", "Stock Exchange Listing Regulation Dispute"] },
  { id: "SC_CA_TDSAT", group: "Direct Matters (बिना हाई कोर्ट)", code: "C.A.(TDSAT)", name: "Telecom & Broadcasting Appeal — TRAI Act", category: "TDSAT Direct Statutory Appeal", subCategories: ["Spectrum Allocation & License Fee Dispute", "Broadcasting & OTT Interconnect Dispute", "AGR Dues & Telecom Regulatory Order"] },
  { id: "SC_CA_APTEL", group: "Direct Matters (बिना हाई कोर्ट)", code: "C.A.(APTEL)", name: "Electricity Regulatory Appeal — Sec 125 Electricity Act", category: "APTEL Direct Statutory Appeal", subCategories: ["Power Tariff & Change in Law Dispute", "Renewable & Solar PPA Dispute", "Grid Transmission & Discom Tariff Dispute"] },
  { id: "SC_CA_AFT", group: "Direct Matters (बिना हाई कोर्ट)", code: "C.A.(AFT)", name: "Armed Forces Appeal — Sec 30/31 AFT Act 2007", category: "AFT Direct Statutory Appeal", subCategories: ["Court Martial Sentence Challenge", "Disability / Service Pension Appeal", "Military Promotion & Rank Seniority Dispute"] },
  { id: "SC_CA_CCI", group: "Direct Matters (बिना हाई कोर्ट)", code: "C.A.(CCI)", name: "Competition Appeal — Sec 53T Competition Act", category: "CCI / NCLAT Anti-Trust Appeal", subCategories: ["Abuse of Dominant Position Challenge", "Cartelization & Price Fixing Penalty", "Anti-Competitive Merger Regulation"] },
  { id: "SC_ELECTION_PET", group: "Direct Matters (बिना हाई कोर्ट)", code: "E.P.", name: "Presidential Election Dispute — Article 71", category: "Apex Constitutional Election", subCategories: ["Presidential Election Validity Challenge", "Vice-Presidential Election Challenge"] },
  { id: "SC_REF_PRESIDENTIAL", group: "Direct Matters (बिना हाई कोर्ट)", code: "REF.", name: "Presidential Advisory Reference — Article 143", category: "Advisory Jurisdiction", subCategories: ["Constitutional Law Question Reference", "Public Importance Treaty Reference"] },

  // Group B: High Court to Supreme Court & Apex Remedies (हाई कोर्ट के बाद)
  { id: "SC_SLP_CIVIL", group: "Appellate & Apex Remedies (हाई कोर्ट के बाद)", code: "SLP(C)", name: "Special Leave Petition (Civil) — Article 136", category: "Apex Civil Appellate Jurisdiction", subCategories: ["High Court Civil Judgment / Decree Challenge", "High Court Writ Petition Order Challenge", "High Court Interim Injunction / Stay Challenge", "Arbitration Sec 37 High Court Order Challenge"] },
  { id: "SC_SLP_CRL", group: "Appellate & Apex Remedies (हाई कोर्ट के बाद)", code: "SLP(CRL)", name: "Special Leave Petition (Criminal) — Article 136", category: "Apex Criminal Appellate Jurisdiction", subCategories: ["High Court Bail Rejection Challenge (Sec 439)", "High Court Conviction / Sentence Challenge", "High Court Sec 482 Quashing Dismissal Challenge", "High Court Acquittal Reversal Challenge"] },
  { id: "SC_CA_CERTIFIED", group: "Appellate & Apex Remedies (हाई कोर्ट के बाद)", code: "C.A.", name: "Civil Appeal (High Court Certificate) — Art. 132/133", category: "Certified Constitutional Appeal", subCategories: ["Substantial Question of Law as to Constitution", "Civil Fitness Certificate Appeal"] },
  { id: "SC_CRLA_CERTIFIED", group: "Appellate & Apex Remedies (हाई कोर्ट के बाद)", code: "CRL.A.", name: "Criminal Appeal (High Court Certificate) — Art. 134", category: "Certified Criminal Appeal", subCategories: ["Capital Death Sentence Appeal", "Acquittal Reversal to Death/Life Sentence"] },
  { id: "SC_REVIEW_CIVIL", group: "Appellate & Apex Remedies (हाई कोर्ट के बाद)", code: "R.P.(C)", name: "Review Petition (Civil) — Article 137", category: "Supreme Court Review Jurisdiction", subCategories: ["Error Apparent on the Face of the Record", "Discovery of New Critical Evidence"] },
  { id: "SC_REVIEW_CRL", group: "Appellate & Apex Remedies (हाई कोर्ट के बाद)", code: "R.P.(CRL)", name: "Review Petition (Criminal) — Article 137", category: "Supreme Court Criminal Review", subCategories: ["Review of Conviction / Sentence Verdict", "Review of Death Penalty Confirmation (Open Court)"] },
  { id: "SC_CURATIVE_CIVIL", group: "Appellate & Apex Remedies (हाई कोर्ट के बाद)", code: "CURATIVE.PET(C)", name: "Curative Petition (Civil) — Rupa Ashok Hurra", category: "The Absolute Final Legal Remedy", subCategories: ["Violation of Natural Justice", "Undisclosed Judicial Bias"] },
  { id: "SC_CURATIVE_CRL", group: "Appellate & Apex Remedies (हाई कोर्ट के बाद)", code: "CURATIVE.PET(CRL)", name: "Curative Petition (Criminal) — Article 142", category: "Final Capital / Liberty Remedy", subCategories: ["Grave Miscarriage of Justice in Criminal Verdict", "Final Mercy Review before Execution"] },
  { id: "SC_CONTEMPT_PET", group: "Appellate & Apex Remedies (हाई कोर्ट के बाद)", code: "CONT.PET.", name: "Contempt Petition — Art. 129 / Contempt Act", category: "Apex Contempt of Court", subCategories: ["Civil Contempt (Willful Non-Compliance)", "Criminal Contempt (Scandalizing the Court)"] },
];

// ─── 3. ALL-INDIA HIGH COURT MASTER TAXONOMY (37 MASTER CASE TYPES) ──────────
export const ALL_INDIA_HIGH_COURT_CASE_TYPES = [
  // 1. Constitutional & Writ Jurisdiction (Art. 226/227)
  { id: "HC_WP_CIVIL", group: "1. Constitutional & Writs (Art. 226/227)", code: "W.P.(C)", name: "Writ Petition (Civil) — General Civil & Policy", category: "Constitutional & Administrative", subCategories: ["Land Acquisition & Compensation", "Tender & Public Procurement Dispute", "Municipal & Local Authority Grievance", "University & Educational Regulation"] },
  { id: "HC_WP_CRL", group: "1. Constitutional & Writs (Art. 226/227)", code: "W.P.(CRL)", name: "Writ Petition (Criminal) — Police Inaction / Protection", category: "Criminal Writs", subCategories: ["Police Protection for Life & Liberty", "Transfer of Investigation to CBI/CID", "Fair & Independent Police Investigation", "Direction for FIR Registration"] },
  { id: "HC_WP_PIL", group: "1. Constitutional & Writs (Art. 226/227)", code: "W.P.(PIL)", name: "Public Interest Litigation (PIL)", category: "Public Welfare & Policy", subCategories: ["Environmental & Pollution Control", "Citizen Welfare & Public Health", "Road Safety & Municipal Governance", "Judicial & Police Infrastructure"] },
  { id: "HC_WP_HABEAS", group: "1. Constitutional & Writs (Art. 226/227)", code: "W.P.(Habeas)", name: "Writ Petition (Habeas Corpus) — Illegal Custody", category: "Personal Liberty", subCategories: ["Illegal Police Detention", "Missing Person Production in Court", "Illegal Private / Familial Confinement"] },
  { id: "HC_WP_SERVICE", group: "1. Constitutional & Writs (Art. 226/227)", code: "W.P.(Service)", name: "Service & Employment Writ Petition", category: "Service Law", subCategories: ["Government Recruitment & Selection Dispute", "Seniority & Promotion Dispute", "Illegal Suspension / Termination", "Pension & Gratuity Withholding"] },
  { id: "HC_CMM", group: "1. Constitutional & Writs (Art. 226/227)", code: "C.M.(M)", name: "Civil Misc. Main (Supervisory — Art. 227)", category: "Supervisory Jurisdiction", subCategories: ["Challenge to Subordinate Court Order", "Challenge to SDM / Revenue Court Order", "Challenge to Rent Control / Tribunal Order"] },

  // 2. Criminal Jurisdiction (CrPC / BNSS)
  { id: "HC_BAIL", group: "2. Criminal Law (CrPC / BNSS)", code: "BAIL APPLN.", name: "Bail Application (Anticipatory & Regular)", category: "Bail & Personal Liberty", subCategories: ["Anticipatory Bail (Sec 438 CrPC / 482 BNSS)", "Regular Bail (Sec 439 CrPC / 483 BNSS)", "Interim Medical Bail", "Cancellation of Bail by Complainant"] },
  { id: "HC_CRL_MC", group: "2. Criminal Law (CrPC / BNSS)", code: "CRL.M.C.", name: "Criminal Misc. (Sec 482 CrPC / 528 BNSS) — Quashing", category: "Criminal Quashing & Review", subCategories: ["FIR Quashing (False / Matrimonial / Civil Nature)", "Charge-Sheet & Cognizance Order Quashing", "Summoning Order Challenge", "Compounding & Settlement Quashing"] },
  { id: "HC_CRL_A", group: "2. Criminal Law (CrPC / BNSS)", code: "CRL.A.", name: "Criminal Appeal (against Sessions Verdict)", category: "Criminal Appeals", subCategories: ["Appeal against Conviction (7/10/Life Imprisonment)", "Appeal against Acquittal (Sec 378 CrPC)", "Sentence Enhancement Appeal", "PMLA / NDPS / CBI Special Appeal"] },
  { id: "HC_CRL_REV", group: "2. Criminal Law (CrPC / BNSS)", code: "CRL.REV.P.", name: "Criminal Revision Petition (Sec 397/401 CrPC)", category: "Criminal Revision", subCategories: ["Revision against Rejection of Discharge", "Revision against Interim Maintenance Order", "Revision against Charge Framing Order"] },
  { id: "HC_CRL_LP", group: "2. Criminal Law (CrPC / BNSS)", code: "CRL.L.P.", name: "Leave to Appeal (Criminal) — Sec 378(4) CrPC", category: "Criminal Leave", subCategories: ["Leave to Appeal in Cheque Bounce Acquittal", "Leave to Appeal in Private Complaint Acquittal"] },
  { id: "HC_CRL_MA", group: "2. Criminal Law (CrPC / BNSS)", code: "CRL.M.A.", name: "Criminal Misc Application (Stay / Suspension)", category: "Interlocutory Criminal Applications", subCategories: ["Suspension of Sentence pending Appeal (Sec 389)", "Permission to Travel Abroad during Trial", "Modification of Bail Conditions"] },
  { id: "HC_DSR", group: "2. Criminal Law (CrPC / BNSS)", code: "DSR", name: "Death Sentence Reference & Confirmation (Sec 366)", category: "Capital Punishment Reference", subCategories: ["Confirmation of Sessions Court Capital Sentence", "Death Row Appeal Hearing"] },

  // 3. Civil & Appellate Jurisdiction (CPC)
  { id: "HC_RFA", group: "3. Civil & Appellate (CPC)", code: "RFA", name: "Regular First Appeal (Sec 96 CPC)", category: "Civil First Appeals", subCategories: ["Property Title & Injunction Decree Appeal", "Partition Suit Final Decree Appeal", "Money Recovery Decree Appeal", "Specific Performance Decree Appeal"] },
  { id: "HC_RSA", group: "3. Civil & Appellate (CPC)", code: "RSA", name: "Regular Second Appeal (Sec 100 CPC)", category: "Civil Second Appeals", subCategories: ["Substantial Question of Law on Land Title", "Concurrent Findings Challenge", "Adverse Possession Law Challenge"] },
  { id: "HC_FAO", group: "3. Civil & Appellate (CPC)", code: "FAO", name: "First Appeal from Order (Order 43 CPC / FAO(OS))", category: "Interlocutory Order Appeals", subCategories: ["Interim Injunction Rejection (Order 39 R 1/2)", "Receiver Appointment Appeal (Order 40)", "Rejection of Plaint Appeal (Order 7 R 11)"] },
  { id: "HC_CRP", group: "3. Civil & Appellate (CPC)", code: "C.R.P.", name: "Civil Revision Petition (Sec 115 CPC)", category: "Civil Revision", subCategories: ["Jurisdictional Error by Subordinate Judge", "Rejection of Amendment of Pleadings (Order 6 R 17)", "Rejection of Additional Evidence (Order 41 R 27)"] },
  { id: "HC_CS_OS", group: "3. Civil & Appellate (CPC)", code: "C.S.(OS)", name: "Civil Suit (Original Side — High Court Jurisdiction)", category: "Original Civil Suits", subCategories: ["High-Value Property & Title Suit (> 2 Crore)", "Defamation & Damages Original Suit", "Trust & Religious Endowment Suit"] },
  { id: "HC_MAT_APP", group: "3. Civil & Appellate (CPC)", code: "MAT.APP.", name: "Matrimonial Appeal (Sec 19 Family Courts Act)", category: "Family Appeals", subCategories: ["Divorce Decree Challenge", "Child Custody & Visitation Appeal", "Permanent Alimony & Maintenance Appeal"] },
  { id: "HC_MACA", group: "3. Civil & Appellate (CPC)", code: "MACA", name: "Motor Accident Claims Appeal (MACT High Court Appeal)", category: "Accident Compensation Appeals", subCategories: ["Enhancement of Fatal Accident Compensation", "Insurance Liability Denial Challenge", "Permanent Disability Multiplier Challenge"] },
  { id: "HC_TEST_CAS", group: "3. Civil & Appellate (CPC)", code: "TEST.CAS.", name: "Testamentary & Probate Case", category: "Succession & Probate", subCategories: ["Grant of Probate of Disputed Will", "Letters of Administration with Will Annexed", "Revocation of Fraudulent Succession Certificate"] },
  { id: "HC_ELECTION_PET", group: "3. Civil & Appellate (CPC)", code: "E.P.", name: "Election Petition (MLA / MP Election Challenge)", category: "Electoral Disputes", subCategories: ["Assembly Election (MLA) Corrupt Practice Challenge", "Parliamentary Election (Lok Sabha MP) Challenge"] },

  // 4. Commercial, IPR & Arbitration (Commercial Courts Act 2015)
  { id: "HC_CS_COMM", group: "4. Commercial, IPR & Arbitration", code: "CS(COMM)", name: "Commercial Civil Suit (Specified Value > 3 Lakhs)", category: "Commercial Suits", subCategories: ["Breach of Commercial Supply / Service Contract", "Shareholder, JV & Private Equity Dispute", "Commercial Real Estate & Lease Recovery", "Banking & Financial Instrument Suit"] },
  { id: "HC_ARB_P", group: "4. Commercial, IPR & Arbitration", code: "ARB.P.", name: "Arbitration Petition (Sec 11 Arbitration Act)", category: "Arbitrator Appointment", subCategories: ["Appointment of Sole Arbitrator", "Arbitrator Substitute Appointment (Sec 14/15)"] },
  { id: "HC_OMP_COMM", group: "4. Commercial, IPR & Arbitration", code: "O.M.P.(COMM)", name: "Commercial Arbitration Challenge (Sec 34 / 37)", category: "Arbitral Award Challenge", subCategories: ["Setting Aside Arbitral Award (Sec 34)", "Commercial Interim Measure Appeal (Sec 37(1)(b))", "Foreign Arbitral Award Enforcement (Sec 48)"] },
  { id: "HC_IPD", group: "4. Commercial, IPR & Arbitration", code: "C.O.(COMM.IPD)", name: "Intellectual Property Division (IPD)", category: "IPR & Trade Secrets", subCategories: ["Trademark Infringement & Passing Off", "Patent Infringement & Revocation", "Copyright Piracy & Software License Violation", "Trade Secret & Non-Compete Breach"] },
  { id: "HC_CO_PET", group: "4. Commercial, IPR & Arbitration", code: "CO.PET.", name: "Company Petition / Company Application", category: "Corporate Law", subCategories: ["Scheme of Arrangement & Corporate Demerger", "Reduction of Share Capital", "Company Winding-Up Matters (Legacy)"] },

  // 5. Taxation, Revenue & Statutory Appeals
  { id: "HC_ITA", group: "5. Taxation & Revenue", code: "ITA", name: "Income Tax Appeal (Sec 260A IT Act 1961)", category: "Direct Taxation", subCategories: ["Substantial Question of Law on ITAT Order", "Transfer Pricing & International Tax", "Search & Seizure Assessment Order Challenge"] },
  { id: "HC_GSTA", group: "5. Taxation & Revenue", code: "GST.A / CEA", name: "GST & Central Excise Appeal", category: "Indirect Taxation", subCategories: ["GST Input Tax Credit (ITC) Denial Appeal", "Customs Classification & Tariff Appeal", "Central Excise Appellate Tribunal Challenge"] },
  { id: "HC_STRE", group: "5. Taxation & Revenue", code: "STRE / VATAP", name: "Sales Tax / VAT Revision & Appeal", category: "State Taxation", subCategories: ["Commercial Tax Assessment Revision", "VAT Demand & Entry Tax Appeal"] },
  { id: "HC_LPA", group: "5. Taxation & Revenue", code: "LPA", name: "Letters Patent Appeal (Intra-Court Division Bench)", category: "High Court Intra-Court Appeals", subCategories: ["Single Judge Writ Order Appeal to Division Bench", "Original Side Single Judge Order Appeal"] },

  // 6. Contempt, Transfer & Review Remedies
  { id: "HC_CONT_CIVIL", group: "6. Contempt, Transfer & Review", code: "CONT.CAS(C)", name: "Contempt Case (Civil) — Sec 10/12 Contempt Act", category: "Civil Contempt", subCategories: ["Willful Non-Compliance by Govt Officer / IAS", "Breach of Court Undertaking", "Failure to Comply with Status Quo Order"] },
  { id: "HC_CONT_CRL", group: "6. Contempt, Transfer & Review", code: "CONT.CAS(CRL)", name: "Contempt Case (Criminal) — Sec 15 Contempt Act", category: "Criminal Contempt", subCategories: ["Scandalizing High Court Authority", "Obstruction in Court Proceedings / Assault"] },
  { id: "HC_REVIEW_PET", group: "6. Contempt, Transfer & Review", code: "REVIEW PET.", name: "Review Petition (Civil / Criminal)", category: "High Court Review", subCategories: ["Review of High Court Writ / Appeal Judgment", "Correction of Error Apparent on Record"] },
  { id: "HC_TRP_CIVIL", group: "6. Contempt, Transfer & Review", code: "TR.P.(C)", name: "Transfer Petition (Civil) — Sec 24 CPC", category: "Intra-State Civil Transfer", subCategories: ["Transfer of Case from one District to another in State", "Withdrawal of Case to High Court for Trial"] },
  { id: "HC_TRP_CRL", group: "6. Contempt, Transfer & Review", code: "TR.P.(CRL)", name: "Transfer Petition (Criminal) — Sec 407 CrPC", category: "Intra-State Criminal Transfer", subCategories: ["Transfer of Sessions Trial to another District in State", "Transfer due to Local Bias / Security Threat"] },
  { id: "HC_CM_IA", group: "6. Contempt, Transfer & Review", code: "C.M. / I.A.", name: "Misc Application / Interlocutory Stay Application", category: "Interlocutory High Court Applications", subCategories: ["Application for Urgent Early Hearing", "Application for Extension of Interim Stay", "Application for Condonation of Delay (Sec 5)"] },
];

// ─── 4. DISTRICT & SUBORDINATE COURT MASTER (25 CASE TYPES) ─────────────────
export const DISTRICT_ESTABLISHMENT_CASE_TYPES = {
  DISTRICT_SESSIONS: [
    { id: "SESSIONS_CASE", code: "SC", name: "Sessions Case (Murder, Heinous Crimes Trial)", category: "Criminal Trial", subCategories: ["Sessions Trial (BNS/IPC)", "NDPS Special Sessions Trial", "CBI / Anti-Corruption Special Trial", "Armed Robbery / Kidnapping Trial"] },
    { id: "CRIMINAL_APPEAL", code: "CA", name: "Criminal Appeal (against Magistrate Judgment)", category: "Criminal Appeals", subCategories: ["Appeal against Conviction", "Domestic Violence Act Appeal (Sec 29)", "Juvenile Justice Board Appeal"] },
    { id: "CRIMINAL_REVISION", code: "CR", name: "Criminal Revision (Sec 397/401 CrPC)", category: "Criminal Revision", subCategories: ["Revision against Summoning Order", "Revision against Discharge Rejection", "Revision against Interim Maintenance"] },
    { id: "SESSIONS_BAIL", code: "BAIL", name: "Sessions Bail Application (Sec 439 / 438 CrPC)", category: "Bail & Liberty", subCategories: ["Regular Sessions Bail", "Anticipatory Sessions Bail", "Interim Medical Bail", "Surrender & Bail Application"] },
    { id: "CIVIL_SUIT", code: "CS", name: "Original Civil Suit (Title, Injunction, Partition)", category: "Civil Original", subCategories: ["Permanent & Mandatory Injunction (Order 39)", "Declaration of Ownership & Title", "Partition of Ancestral Property", "Money Recovery & Damages Suit"] },
    { id: "CIVIL_APPEAL", code: "RCA", name: "Regular Civil Appeal (against Civil Judge Decree)", category: "Civil Appeals", subCategories: ["Civil Decree First Appeal", "Misc Civil Appeal (Order 43 CPC)", "Eviction & Rent Control Appeal"] },
    { id: "MOTOR_ACCIDENT", code: "MACP", name: "Motor Accident Claims Petition (MACT)", category: "Accident Compensation", subCategories: ["Fatal Road Accident Claim", "Permanent Disability Compensation", "Third Party Insurance Claim"] },
    { id: "EXECUTION_PET", code: "EP", name: "Execution Petition (Order 21 CPC)", category: "Decree Enforcement", subCategories: ["Execution of Civil Decree", "Attachment & Auction of Property", "Warrant of Possession Execution"] },
    { id: "SUCCESSION_CASE", code: "SC", name: "Succession & Probate Certificate (Indian Succession Act)", category: "Succession & Inheritance", subCategories: ["Succession Certificate for Bank / Shares", "Letter of Administration", "Probate of Registered Will"] },
  ],
  FAMILY_COURT: [
    { id: "HMA_DIVORCE", code: "HMA", name: "Hindu Marriage Act Petition (Sec 13 / 13B)", category: "Matrimonial Dissolution", subCategories: ["Mutual Consent Divorce (13B First/Second Motion)", "Contested Divorce (Cruelty/Desertion/Adultery)", "Annulment of Void Marriage (Sec 11/12)"] },
    { id: "HMA_RCR", code: "HMA 9", name: "Restitution of Conjugal Rights (Sec 9 HMA)", category: "Marital Restitution", subCategories: ["Petition to Resume Cohabitation", "Reconciliation Settlement"] },
    { id: "FAMILY_MAINTENANCE", code: "MT", name: "Maintenance Petition (Sec 125 CrPC / 144 BNSS)", category: "Family Maintenance", subCategories: ["Wife Monthly Maintenance Claim", "Minor Children Education & Maintenance", "Elderly Parent Maintenance", "Interim Monthly Maintenance Application"] },
    { id: "CHILD_CUSTODY", code: "GW", name: "Guardians & Wards Petition (Child Custody & Visitation)", category: "Child Welfare", subCategories: ["Permanent Legal Custody", "Weekend & Holiday Visitation Rights", "Passport / Relocation Permission", "Interim Child Access"] },
    { id: "DOMESTIC_VIOLENCE", code: "DV", name: "Domestic Violence Act Petition (PWDVA 2005)", category: "Women Protection", subCategories: ["Protection Order against Violence (Sec 18)", "Shared Household Residence Order (Sec 19)", "Monetary Relief & Medical Expenses (Sec 20)", "Compensation Order for Trauma (Sec 22)"] },
  ],
  COMMERCIAL_COURT: [
    { id: "COMM_SUIT", code: "CS(COMM)", name: "Commercial Civil Suit (Specified Value > 3 Lakhs)", category: "Commercial Pleading", subCategories: ["Commercial Supply & Service Contract Breach", "Intellectual Property / Trademark Infringement", "Shareholder & Joint Venture Dispute", "Commercial Lease & Security Deposit Recovery"] },
    { id: "COMM_ARBITRATION", code: "OMP(COMM)", name: "Commercial Arbitration Execution & Challenge", category: "Commercial Arbitration", subCategories: ["Execution of Arbitral Award (Order 21)", "Interim Relief Petition (Sec 9 Arbitration Act)", "Commercial Summary Suit (Order 37 CPC)"] },
  ],
  POCSO_SPECIAL: [
    { id: "POCSO_CASE", code: "POCSO", name: "Special POCSO Act Trial (Child Protection)", category: "Special POCSO Trial", subCategories: ["Aggravated Sexual Assault Prosecution", "Child Sexual Abuse Trial", "Special POCSO Bail Hearing"] },
    { id: "SC_ST_CASE", code: "SC/ST", name: "Special SC/ST (Prevention of Atrocities) Trial", category: "Special Caste Protection", subCategories: ["Atrocities Act Criminal Trial", "Statutory Appeal under Sec 14A", "Victim Compensation Claim"] },
  ],
  CJM_MAGISTRATE: [
    { id: "CRIMINAL_COMPLAINT", code: "CC", name: "Criminal Complaint Case (Sec 200 CrPC / 223 BNSS)", category: "Magisterial Complaint", subCategories: ["Private Criminal Complaint", "Cheque Bounce (Sec 138 NI Act)", "Criminal Defamation (Sec 499/500)", "Fraud, Cheating & Forgery (Sec 420/467)"] },
    { id: "STATE_CHALLAN", code: "CR", name: "State Police Challan / Charge-Sheet Trial", category: "Police Prosecution", subCategories: ["Magisterial Warrant Trial on Police Report", "Summary Trial (Minor Traffic/Police Offences)", "Police Remand & Bail Hearing"] },
    { id: "MAGISTRATE_BAIL", code: "BAIL", name: "Magistrate Bail Application (Sec 437 CrPC)", category: "Magisterial Bail", subCategories: ["Bailable Offence Surety Application", "Non-Bailable Offence Interim Bail", "Default Statutory Bail (Sec 167(2) CrPC)"] },
  ],
};

// ─── 5. TEHSIL & REVENUE DEPARTMENT MASTER (8-LEVEL HIERARCHY & 8+ CASE TYPES) ───
export const REVENUE_ESTABLISHMENT_LEVELS = [
  { id: "BOARD_OF_REVENUE", name: "Board of Revenue (राजस्व परिषद — Apex State Revenue Court)" },
  { id: "DIVISIONAL_COMMISSIONER", name: "Divisional Commissioner Court (संभागीय आयुक्त / मंडल न्यायालय)" },
  { id: "DM_COLLECTOR", name: "District Magistrate / Collector Court (जिलाधिकारी / कलेक्टर न्यायालय)" },
  { id: "ADM_COURTS", name: "Additional District Magistrate (ADM Revenue / Judicial / Land Acquisition)" },
  { id: "SDM_COURT", name: "Sub-Divisional Magistrate / SDM Court (उप-जिलाधिकारी न्यायालय — Assistant Collector)" },
  { id: "TEHSILDAR_COURT", name: "Tehsildar & Judicial Tehsildar Court (तहसीलदार / न्यायिक तहसीलदार न्यायालय)" },
  { id: "NAIB_TEHSILDAR_COURT", name: "Naib Tehsildar Court (नायब तहसीलदार वृत न्यायालय — Undisputed Mutation)" },
  { id: "CHAKBANDI_COURT", name: "Consolidation Officer Court (चकबंदी न्यायालय — ACO / CO / SOC / DDC Courts)" },
];

export const REVENUE_CASE_TYPES = [
  { id: "REV_MUTATION", code: "MUTATION", name: "Revenue Mutation (दाखिल-खारिज — Sec 34/35 Revenue Code)", category: "Land Title Mutation", subCategories: ["Registered Sale Deed Mutation (बैनामा दाखिल-खारिज)", "Inheritance / Succession Mutation (फौती/वारिसान नाम दर्ज)", "Registered Will Mutation (वसीयत नामांतरण)", "Court Decree Mutation (अदालती डिक्री अमलदारामद)"] },
  { id: "REV_PARTITION", code: "PARTITION (116)", name: "Agricultural Land Partition Suit (खेत का बंटवारा — Sec 116)", category: "Land Partition", subCategories: ["Separation of Agricultural Shares (कुर्रा बंटवारा)", "Joint Khata Division & Separate Khasra Numbering", "Preparation of Preliminary / Final Decree"] },
  { id: "REV_PAIMASH", code: "PAIMASH (24)", name: "Land Boundary Demarcation & Stone Fixing (पैमाइश / पत्थरगड्डी — Sec 24)", category: "Land Demarcation", subCategories: ["Demarcation of Encroached Farm Boundary", "Fixing of Boundary Pillars (पत्थरगड्डी आदेश)", "Measurement of Disturbed Field Boundaries"] },
  { id: "REV_ENCROACHMENT", code: "EVICTION (67)", name: "Gram Sabha & Public Land Eviction (चकरोड/तालाब बेदखली — Sec 67)", category: "Public Land Protection", subCategories: ["Removal of Encroachment on Village Pathway (चकरोड)", "Eviction from Pasture/Pond/Gram Sabha Land", "Damage Compensation Assessment on Encroacher"] },
  { id: "REV_CORRECTION", code: "CORRECTION (38)", name: "Record & Khatauni Correction (खतौनी दुरुस्ती / शुद्धि — Sec 38)", category: "Land Record Rectification", subCategories: ["Correction of Khasra Area Discrepancy", "Correction of Spelling / Name in Khatauni", "Rectification of Erroneous Revenue Entry"] },
  { id: "REV_SEC144", code: "SEC 144/145", name: "Executive Injunction & Land Possession (Sec 144/145 CrPC)", category: "Executive Land Dispute", subCategories: ["Imminent Breach of Peace on Land/House", "Order of Attachment of Disputed Land (Sec 146)", "Restoration of Forcibly Dispossessed Land"] },
  { id: "REV_STAMP", code: "STAMP (47A)", name: "Stamp Deficit Assessment Dispute (स्टाम्प कमी वाद — Sec 47A)", category: "Stamp & Registration Dispute", subCategories: ["Challenge to Circle Rate Value Deficit Notice", "Challenge to Penalty Imposed by Sub-Registrar / ADM", "Appeal against Deficit Stamp Order"] },
  { id: "REV_CHAKBANDI", code: "CHAKBANDI", name: "Consolidation Objections & Appeals (चकबंदी आपत्ति, कुर्रा व अपील)", category: "Consolidation Disputes", subCategories: ["Objection against Unit Valuation (Sec 9 ACO)", "Chak Allocation & Route Dispute before CO (Sec 20)", "Appeal before Settlement Officer Consolidation (SOC - Sec 11)", "Revision before Deputy Director of Consolidation (DDC - Sec 48)"] },
  { id: "REV_APPEAL_REV", code: "REV.APPEAL", name: "Revenue Appeal / Revision (राजस्व अपील व निगरानी)", category: "Revenue Appellate", subCategories: ["Appeal against Tehsildar Mutation Order to SDM", "Revision to Commissioner against SDM Order", "Board of Revenue Second Appeal / Reference"] },
];

// ─── 6. SPECIALIZED STATUTORY TRIBUNALS DIRECTORY ───────────────────────────
export const SPECIAL_TRIBUNALS_DIRECTORY = [
  {
    id: "NCLT",
    name: "National Company Law Tribunal (NCLT / NCLAT)",
    benches: [
      "Principal Bench (New Delhi)", "New Delhi (Court 1 to 6)", "Mumbai (Court 1 to 5)", "Ahmedabad Bench", "Bengaluru Bench", "Chennai Bench", "Kolkata Bench", "Hyderabad Bench", "Allahabad / Prayagraj Bench", "Chandigarh Bench", "Cuttack Bench", "Jaipur Bench", "Kochi Bench", "Indore Bench", "Amaravati Bench", "Guwahati Bench", "NCLAT Appellate Bench (New Delhi)", "NCLAT Southern Bench (Chennai)",
    ],
    caseTypes: [
      { id: "NCLT_IBC_7", code: "CP(IB)-Sec 7", name: "Financial Creditor Insolvency Petition (Sec 7 IBC)", category: "Corporate Insolvency" },
      { id: "NCLT_IBC_9", code: "CP(IB)-Sec 9", name: "Operational Creditor Insolvency Petition (Sec 9 IBC)", category: "Corporate Insolvency" },
      { id: "NCLT_OPP_MIS", code: "CP-Sec 241/242", name: "Oppression & Mismanagement Petition (Companies Act)", category: "Shareholder Dispute" },
      { id: "NCLT_SCHEME", code: "CA-Sec 230-232", name: "Scheme of Merger, Amalgamation & Demerger", category: "Corporate Restructuring" },
    ],
  },
  {
    id: "DRT",
    name: "Debts Recovery Tribunal (DRT / DRAT Banking)",
    benches: [
      "DRAT Delhi", "DRAT Mumbai", "DRAT Kolkata", "DRAT Chennai", "DRAT Allahabad", "DRT-1, 2, 3 Delhi", "DRT-1, 2, 3 Mumbai", "DRT Lucknow", "DRT Allahabad", "DRT Chandigarh", "DRT Jaipur", "DRT Ahmedabad", "DRT Patna", "DRT Cuttack", "DRT Bengaluru", "DRT Hyderabad", "DRT Ernakulam", "DRT Visakhapatnam", "DRT Guwahati", "DRT Ranchi", "DRT Jabalpur", "DRT Pune", "DRT Nagpur", "DRT Coimbatore",
    ],
    caseTypes: [
      { id: "DRT_OA", code: "O.A.", name: "Original Application by Bank (Recovery > 20 Lakhs)", category: "Bank Debt Recovery" },
      { id: "DRT_SA", code: "S.A.", name: "Securitization Application (Sec 17 SARFAESI Act)", category: "Borrower SARFAESI Defense" },
      { id: "DRT_IA", code: "I.A.", name: "Interim Stay on Bank Auction / Possession Notice", category: "Stay Application" },
    ],
  },
  {
    id: "NGT",
    name: "National Green Tribunal (NGT Environment)",
    benches: [
      "Principal Bench (New Delhi - North Zone)", "Central Zonal Bench (Bhopal)", "Western Zonal Bench (Pune)", "Eastern Zonal Bench (Kolkata)", "Southern Zonal Bench (Chennai)",
    ],
    caseTypes: [
      { id: "NGT_OA", code: "O.A.", name: "Original Application for Environmental Protection", category: "Environmental Defense" },
      { id: "NGT_APPEAL", code: "APPEAL", name: "Appeal against Environmental Clearance (EC) / Consent Order", category: "EC Appeal" },
      { id: "NGT_EXEC", code: "EXEC.APP.", name: "Execution Application for Tree/River Protection Orders", category: "NGT Execution" },
    ],
  },
  {
    id: "CAT",
    name: "Central Administrative Tribunal (CAT Service)",
    benches: [
      "Principal Bench (New Delhi)", "Allahabad Bench", "Lucknow Bench", "Mumbai Bench", "Kolkata Bench", "Madras (Chennai) Bench", "Bengaluru Bench", "Hyderabad Bench", "Ahmedabad Bench", "Chandigarh Bench", "Jaipur Bench", "Patna Bench", "Cuttack Bench", "Ernakulam Bench", "Guwahati Bench", "Jabalpur Bench", "Jodhpur Bench", "Jammu Bench", "Srinagar Bench",
    ],
    caseTypes: [
      { id: "CAT_OA", code: "O.A.", name: "Original Application for Central Govt Service / Pension", category: "Service Grievance" },
      { id: "CAT_RA", code: "R.A.", name: "Review Application on CAT Tribunal Order", category: "CAT Review" },
      { id: "CAT_CONT", code: "CP", name: "Contempt Petition for Non-Implementation of CAT Order", category: "Service Contempt" },
    ],
  },
  {
    id: "CONSUMER",
    name: "Consumer Disputes Redressal Commission (NCDRC / SCDRC / DCDRC)",
    benches: [
      "NCDRC National Commission (New Delhi)", "State Commission (SCDRC - Capital City)", "District Consumer Forum (DCDRC - Local District)",
    ],
    caseTypes: [
      { id: "CONS_CC", code: "C.C.", name: "Consumer Complaint (Deficiency in Goods / Service)", category: "Consumer Grievance" },
      { id: "CONS_FA", code: "F.A.", name: "First Appeal against District Forum Order (SCDRC/NCDRC)", category: "Consumer Appeal" },
      { id: "CONS_EA", code: "E.A.", name: "Execution Application (Sec 71/72 Consumer Protection Act)", category: "Compensation Enforcement" },
    ],
  },
  {
    id: "ITAT",
    name: "Income Tax Appellate Tribunal (ITAT)",
    benches: [
      "New Delhi Bench", "Mumbai Bench", "Kolkata Bench", "Chennai Bench", "Ahmedabad Bench", "Bengaluru Bench", "Hyderabad Bench", "Allahabad Bench", "Lucknow Bench", "Agra Bench", "Varanasi Bench", "Chandigarh Bench", "Jaipur Bench", "Jodhpur Bench", "Indore Bench", "Jabalpur Bench", "Patna Bench", "Ranchi Bench", "Cuttack Bench", "Cochin Bench", "Nagpur Bench", "Pune Bench", "Guwahati Bench", "Raipur Bench", "Amritsar Bench", "Panaji (Goa) Bench", "Surat Bench", "Visakhapatnam Bench",
    ],
    caseTypes: [
      { id: "ITAT_ITA", code: "ITA", name: "Income Tax Appeal against CIT(Appeals) Order", category: "Direct Tax Appeal" },
      { id: "ITAT_SA", code: "S.A.", name: "Stay Application on Tax Demand Recovery", category: "Tax Stay Application" },
    ],
  },
  {
    id: "RERA",
    name: "Real Estate Regulatory Authority (RERA & Appellate Tribunal)",
    benches: [
      "UP RERA (Greater Noida & Lucknow)", "MahaRERA (Mumbai & Pune)", "Delhi RERA", "Haryana RERA (HRERA Gurugram & Panchkula)", "Karnataka RERA (Bengaluru)", "Tamil Nadu TNRERA (Chennai)", "Gujarat RERA (Gandhinagar)", "Rajasthan RERA (Jaipur)",
    ],
    caseTypes: [
      { id: "RERA_COMPLAINT", code: "RERA-CMP", name: "Complaint against Builder for Delayed Possession / Refund", category: "RERA Complaint" },
      { id: "RERA_APPEAL", code: "RERA-APP", name: "Appeal to Real Estate Appellate Tribunal (REAT)", category: "RERA Appeal" },
      { id: "RERA_RECOVERY", code: "RC", name: "Recovery Certificate Enforcement by DM (Sec 40 RERA)", category: "RERA Recovery" },
    ],
  },
  {
    id: "AFT",
    name: "Armed Forces Tribunal (AFT Military Justice)",
    benches: [
      "Principal Bench (New Delhi)", "Chandigarh Bench", "Lucknow Bench", "Kolkata Bench", "Mumbai Bench", "Kochi Bench", "Chennai Bench", "Jaipur Bench", "Guwahati Bench", "Jabalpur Bench", "Srinagar / Jammu Bench",
    ],
    caseTypes: [
      { id: "AFT_OA", code: "O.A.", name: "Original Application for Military Service & Disability Pension", category: "Armed Forces Service" },
      { id: "AFT_TA", code: "T.A.", name: "Transferred Application from High Court to AFT", category: "Transferred Petition" },
      { id: "AFT_AT", code: "A.T.", name: "Appeal against Court Martial Verdict & Dismissal", category: "Court Martial Appeal" },
    ],
  },
];

// ─── 7. 25 OFFICIAL HIGH COURTS OF INDIA ────────────────────────────────────
export const OFFICIAL_HIGH_COURTS = [
  { code: "HC-DEL", stateCode: "ST-07", name: "High Court of Delhi", principalSeat: "New Delhi", benches: ["Principal Seat at New Delhi"], cnrPrefix: "DLHC" },
  { code: "HC-ALL", stateCode: "ST-09", name: "Allahabad High Court", principalSeat: "Prayagraj (Allahabad)", benches: ["Prayagraj Principal Seat", "Lucknow Bench"], cnrPrefix: "UPHC" },
  { code: "HC-BOM", stateCode: "ST-27", name: "Bombay High Court", principalSeat: "Mumbai", benches: ["Mumbai Principal Seat", "Nagpur Bench", "Aurangabad Bench", "Panaji (Goa) Bench"], cnrPrefix: "MAHC" },
  { code: "HC-MAD", stateCode: "ST-33", name: "Madras High Court", principalSeat: "Chennai", benches: ["Chennai Principal Seat", "Madurai Bench"], cnrPrefix: "TNHC" },
  { code: "HC-CAL", stateCode: "ST-19", name: "Calcutta High Court", principalSeat: "Kolkata", benches: ["Kolkata Principal Seat", "Jalpaiguri Circuit Bench", "Port Blair Circuit Bench"], cnrPrefix: "WBHC" },
  { code: "HC-KAR", stateCode: "ST-29", name: "High Court of Karnataka", principalSeat: "Bengaluru", benches: ["Bengaluru Principal Seat", "Dharwad Bench", "Kalaburagi (Gulbarga) Bench"], cnrPrefix: "KAHC" },
  { code: "HC-GUJ", stateCode: "ST-24", name: "High Court of Gujarat", principalSeat: "Ahmedabad", benches: ["Principal Seat at Ahmedabad"], cnrPrefix: "GJHC" },
  { code: "HC-PAT", stateCode: "ST-10", name: "Patna High Court", principalSeat: "Patna", benches: ["Principal Seat at Patna"], cnrPrefix: "BRHC" },
  { code: "HC-RAJ", stateCode: "ST-08", name: "Rajasthan High Court", principalSeat: "Jodhpur", benches: ["Jodhpur Principal Seat", "Jaipur Bench"], cnrPrefix: "RJHC" },
  { code: "HC-MP", stateCode: "ST-23", name: "Madhya Pradesh High Court", principalSeat: "Jabalpur", benches: ["Jabalpur Principal Seat", "Indore Bench", "Gwalior Bench"], cnrPrefix: "MPHC" },
  { code: "HC-PNH", stateCode: "ST-03", name: "Punjab and Haryana High Court", principalSeat: "Chandigarh", benches: ["Principal Seat at Chandigarh"], cnrPrefix: "PNHC" },
  { code: "HC-TEL", stateCode: "ST-36", name: "High Court for Telangana", principalSeat: "Hyderabad", benches: ["Principal Seat at Hyderabad"], cnrPrefix: "TSHC" },
  { code: "HC-AP", stateCode: "ST-28", name: "High Court of Andhra Pradesh", principalSeat: "Amaravati", benches: ["Principal Seat at Amaravati"], cnrPrefix: "APHC" },
  { code: "HC-KER", stateCode: "ST-32", name: "High Court of Kerala", principalSeat: "Ernakulam (Kochi)", benches: ["Principal Seat at Ernakulam"], cnrPrefix: "KLHC" },
  { code: "HC-ORI", stateCode: "ST-21", name: "Orissa High Court", principalSeat: "Cuttack", benches: ["Principal Seat at Cuttack"], cnrPrefix: "ODHC" },
  { code: "HC-GAU", stateCode: "ST-18", name: "Gauhati High Court", principalSeat: "Guwahati", benches: ["Guwahati Principal Seat", "Kohima Bench", "Aizawl Bench", "Itanagar Bench"], cnrPrefix: "ASNC" },
  { code: "HC-CHH", stateCode: "ST-22", name: "High Court of Chhattisgarh", principalSeat: "Bilaspur", benches: ["Principal Seat at Bilaspur"], cnrPrefix: "CGHC" },
  { code: "HC-JHR", stateCode: "ST-20", name: "High Court of Jharkhand", principalSeat: "Ranchi", benches: ["Principal Seat at Ranchi"], cnrPrefix: "JHHC" },
  { code: "HC-HP", stateCode: "ST-02", name: "High Court of Himachal Pradesh", principalSeat: "Shimla", benches: ["Principal Seat at Shimla"], cnrPrefix: "HPHC" },
  { code: "HC-UTT", stateCode: "ST-05", name: "High Court of Uttarakhand", principalSeat: "Nainital", benches: ["Principal Seat at Nainital"], cnrPrefix: "UKHC" },
  { code: "HC-JKL", stateCode: "ST-01", name: "High Court of Jammu & Kashmir and Ladakh", principalSeat: "Srinagar / Jammu", benches: ["Srinagar Wing", "Jammu Wing"], cnrPrefix: "JKHC" },
  { code: "HC-MEG", stateCode: "ST-17", name: "High Court of Meghalaya", principalSeat: "Shillong", benches: ["Principal Seat at Shillong"], cnrPrefix: "MLHC" },
  { code: "HC-MAN", stateCode: "ST-14", name: "High Court of Manipur", principalSeat: "Imphal", benches: ["Principal Seat at Imphal"], cnrPrefix: "MNHC" },
  { code: "HC-TRI", stateCode: "ST-16", name: "High Court of Tripura", principalSeat: "Agartala", benches: ["Principal Seat at Agartala"], cnrPrefix: "TRHC" },
  { code: "HC-SIK", stateCode: "ST-11", name: "High Court of Sikkim", principalSeat: "Gangtok", benches: ["Principal Seat at Gangtok"], cnrPrefix: "SKHC" },
];

export const CORE_SPECIALTIES = [
  { id: "CRIMINAL_BAIL", name: "Criminal Law & Midnight Bail / FIR Quashing (Sec 482 CrPC / 528 BNSS)", rankIcon: "🥇" },
  { id: "CIVIL_INJUNCTIONS", name: "Civil Litigation, Injunctions & Property Title Suits (Order 39 CPC)", rankIcon: "🥈" },
  { id: "CONSTITUTIONAL_WRITS", name: "Constitutional & Administrative High Court Writs (Art 226/32)", rankIcon: "🥉" },
  { id: "NCLT_CORPORATE", name: "NCLT Corporate Insolvency, Bankruptcy & Mergers (IBC 2016)", rankIcon: "🏢" },
  { id: "TAX_REVENUE", name: "Income Tax, GST, Customs & Financial Revenue Litigation", rankIcon: "💰" },
  { id: "TEHSIL_KHASRA", name: "Revenue, Tehsil Mutation, Khasra Suits & SDM Executive Court", rankIcon: "📜" },
  { id: "MATRIMONIAL_DV", name: "Matrimonial, Divorce, Maintenance (125 CrPC) & Domestic Violence", rankIcon: "🛡️" },
  { id: "CONSUMER_RERA", name: "Consumer Protection, Medical Negligence & RERA Real Estate", rankIcon: "🏥" },
  { id: "SARFAESI_DRT", name: "SARFAESI, DRT Banking Recovery & Cheque Bounce (Sec 138 NI Act)", rankIcon: "⚖️" },
  { id: "NGT_ENVIRONMENT", name: "NGT Environmental, Pollution & Forest Regulatory Laws", rankIcon: "🌲" },
  { id: "CAT_SERVICE", name: "CAT Service Matters, Government Employee Pension & Appointments", rankIcon: "🏛️" },
  { id: "ARBITRATION", name: "International & Domestic Commercial Arbitration & Conciliation", rankIcon: "🤝" },
];

export const JudiciaryMasterService = {
  getTiers() { return JUDICIAL_TIERS; },
  getForums() { return JUDICIAL_FORUMS; },
  getSpecialties() { return CORE_SPECIALTIES; },
  getHighCourts() { return OFFICIAL_HIGH_COURTS; },
  getHighCourtByCode(code) {
    return OFFICIAL_HIGH_COURTS.find((h) => h.code === code || h.name.toLowerCase().includes(String(code).toLowerCase())) || null;
  },

  getSupremeCourtCaseTypes() { return SUPREME_COURT_CASE_TYPES; },
  getAllIndiaHighCourtCaseTypes() { return ALL_INDIA_HIGH_COURT_CASE_TYPES; },
  getCaseTypesForHighCourt(highCourtCode) { return ALL_INDIA_HIGH_COURT_CASE_TYPES; },

  getCaseTypesForDistrictEstablishment(establishmentType = "DISTRICT_SESSIONS") {
    const key = String(establishmentType).toUpperCase().replace(/[^A-Z_]/g, "_");
    return DISTRICT_ESTABLISHMENT_CASE_TYPES[key] || DISTRICT_ESTABLISHMENT_CASE_TYPES.DISTRICT_SESSIONS;
  },

  getRevenueLevels() { return REVENUE_ESTABLISHMENT_LEVELS; },
  getRevenueCaseTypes() { return REVENUE_CASE_TYPES; },
  getSpecialTribunals() { return SPECIAL_TRIBUNALS_DIRECTORY; },

  validateCNR(cnrNumber = "") {
    if (!cnrNumber || typeof cnrNumber !== "string") {
      return { valid: false, message: "CNR number is required." };
    }
    const clean = cnrNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length !== 16) {
      return {
        valid: false,
        message: `CNR Number must be exactly 16 alphanumeric characters (Current: ${clean.length}).`,
      };
    }
    const regex = /^[A-Z]{4}\d{12}$/;
    if (!regex.test(clean)) {
      return {
        valid: false,
        message: "Invalid CNR Format. Must be: 4 letters (State+District) + 2 digits (Est) + 6 digits (Number) + 4 digits (Year). Example: UPGZ010012342026",
      };
    }
    return {
      valid: true,
      cleanCNR: clean,
      stateDistrictCode: clean.slice(0, 4),
      establishmentCode: clean.slice(4, 6),
      caseNumber: clean.slice(6, 12),
      year: clean.slice(12, 16),
      message: "Valid 16-character eCourts CNR Number.",
    };
  },

  formatSpecialtyBadges(specialtyIdsArray = []) {
    if (!Array.isArray(specialtyIdsArray) || specialtyIdsArray.length === 0) {
      return [{ id: "DEFAULT", name: "General Litigation & Legal Advisory", rankIcon: "⚖️" }];
    }
    return specialtyIdsArray.map((id) => {
      const found = CORE_SPECIALTIES.find((s) => s.id === id || s.name === id);
      if (found) return found;
      return {
        id: String(id || "SPECIALTY"),
        name: String(id || "General Practice"),
        rankIcon: "⚖️",
      };
    });
  },
};

export default JudiciaryMasterService;
