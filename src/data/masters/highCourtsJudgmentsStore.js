// ICJ ENTERPRISE — PAN-INDIA 25 HIGH COURTS LANDMARK PRECEDENTS STORE
// Contains High Court Rulings with Neutral Citations (e.g. 2024:DHC:1234, 2023:AHC:5678), Benches & Section Links

export const HIGH_COURT_JUDGMENTS_STORE = [
  // =========================================================================
  // 1. DELHI HIGH COURT (DHC)
  // =========================================================================
  {
    case_id: "HC_DHC_2024_1520",
    hc_code: "DHC",
    court_name: "High Court of Delhi",
    bench_location: "New Delhi",
    case_number: "CRL.M.C. 1420/2024",
    neutral_citation: "2024:DHC:1520",
    parallel_citation: "2024 DHC 1520",
    title: "Rajesh Sharma & Anr. v. State (NCT of Delhi) & Ors.",
    cause_title: "Rajesh Sharma & Another Versus State of NCT of Delhi & Others",
    party_petitioner: "Rajesh Sharma & Anr.",
    party_respondent: "State of NCT of Delhi & Ors.",
    coram: ["Justice Anoop Kumar Mendiratta"],
    judgment_date: "2024-02-18",
    year: 2024,
    legal_domain: "Criminal Law & Procedure",
    disposal_nature: "Quashed (Allowed)",
    linked_sections: [
      { act_id: "ACT_BNSS_2023", section_number: "528" },
      { act_id: "ACT_CRPC_1973", section_number: "482" },
      { act_id: "ACT_BNS_2023", section_number: "318" },
      { act_id: "ACT_IPC_1860", section_number: "420" },
    ],
    ratio_decidendi_en: "Held that purely commercial/civil breach of contract cannot be given a criminal cloak to harass parties. When dispute arises out of civil transaction and arbitration clause exists, criminal proceedings under Section 420 IPC / 318 BNS are liable to be quashed under Section 482 CrPC / 528 BNSS.",
    ratio_decidendi_hi: "व्यावसायिक संविदा के उल्लंघन को आपराधिक रंग देकर 420 IPC / 318 BNS के तहत केस दर्ज नहीं कराया जा सकता। धारा 482 / 528 के तहत ऐसी दुर्भावनापूर्ण आपराधिक कार्यवाही निरस्त की जाएगी।",
    headnotes: [
      "Quashing of FIR - Civil breach of contract cannot be converted into criminal cheating.",
      "Section 482 CrPC / Section 528 BNSS - Abuse of process of law.",
    ],
    practice_takeaway: "High-value precedent in Delhi High Court commercial quashing petitions where civil dispute has been turned into criminal FIR.",
  },
  {
    case_id: "HC_DHC_2023_4890",
    hc_code: "DHC",
    court_name: "High Court of Delhi",
    bench_location: "New Delhi",
    case_number: "BAIL APPLN. 2890/2023",
    neutral_citation: "2023:DHC:4890",
    parallel_citation: "2023 DHC 4890",
    title: "Vikas Aggarwal v. Directorate of Enforcement (ED)",
    cause_title: "Vikas Aggarwal Versus Directorate of Enforcement",
    party_petitioner: "Vikas Aggarwal",
    party_respondent: "Directorate of Enforcement",
    coram: ["Justice Dinesh Kumar Sharma"],
    judgment_date: "2023-07-25",
    year: 2023,
    legal_domain: "Special Criminal Statutes (POCSO, NDPS, PMLA)",
    disposal_nature: "Bail Granted",
    linked_sections: [
      { act_id: "ACT_PMLA_2002", section_number: "45" },
      { act_id: "ACT_BNSS_2023", section_number: "483" },
      { act_id: "ACT_CRPC_1973", section_number: "439" },
      { act_id: "ACT_CONSTITUTION_1950", section_number: "21" },
    ],
    ratio_decidendi_en: "Adjudicated Section 45 PMLA twin conditions. Held that prolonged pre-trial incarceration without completion of trial violates Article 21, and the rigours of Section 45 PMLA must yield to the fundamental right to speedy trial.",
    ratio_decidendi_hi: "PMLA की धारा 45 की कठोर शर्तों के बावजूद, यदि मुकदमा लंबा खिंचता है तो अनुच्छेद 21 के तहत त्वरित न्याय का अधिकार सर्वोपरि है और अभियुक्त को नियमित जमानत मिल सकती है।",
    headnotes: [
      "PMLA Bail - Twin conditions under Section 45 vs Article 21 Right to Speedy Trial.",
      "Incarceration - Indefinite custody without trial violates liberty.",
    ],
    practice_takeaway: "Leading authority in ED / PMLA bail applications citing prolonged custody and volume of documents.",
  },

  // =========================================================================
  // 2. ALLAHABAD HIGH COURT (AHC)
  // =========================================================================
  {
    case_id: "HC_AHC_2023_9210",
    hc_code: "AHC",
    court_name: "High Court of Judicature at Allahabad",
    bench_location: "Prayagraj (Allahabad)",
    case_number: "CRIMINAL MISC. BAIL APPLICATION No. 18230 of 2023",
    neutral_citation: "2023:AHC:9210",
    parallel_citation: "2023 AHC 9210",
    title: "Mohd. Aslam v. State of U.P.",
    cause_title: "Mohd. Aslam Versus State of Uttar Pradesh",
    party_petitioner: "Mohd. Aslam",
    party_respondent: "State of U.P.",
    coram: ["Justice Siddharth"],
    judgment_date: "2023-05-12",
    year: 2023,
    legal_domain: "Criminal Law & Procedure",
    disposal_nature: "Anticipatory Bail Granted",
    linked_sections: [
      { act_id: "ACT_BNSS_2023", section_number: "482" },
      { act_id: "ACT_CRPC_1973", section_number: "438" },
      { act_id: "ACT_CONSTITUTION_1950", section_number: "21" },
    ],
    ratio_decidendi_en: "Held that an anticipatory bail application under Section 438 CrPC / 482 BNSS is maintainable directly before the High Court without first approaching the Court of Session if exceptional or special circumstances are shown.",
    ratio_decidendi_hi: "विशेष या असाधारण परिस्थितियों में सत्र न्यायालय (Sessions Court) जाए बिना सीधे इलाहाबाद उच्च न्यायालय में अग्रिम जमानत याचिका (438 CrPC / 482 BNSS) पोषणीय (Maintainable) है।",
    headnotes: [
      "Direct Anticipatory Bail - High Court jurisdiction without exhausting Sessions Court.",
      "Section 438 CrPC / 482 BNSS - Concurrent jurisdiction of High Court and Sessions Court.",
    ],
    practice_takeaway: "Frequently relied upon in Uttar Pradesh when filing urgent anticipatory bail directly in Allahabad / Lucknow bench.",
  },
  {
    case_id: "HC_AHC_2024_3421",
    hc_code: "AHC",
    court_name: "High Court of Judicature at Allahabad",
    bench_location: "Lucknow Bench",
    case_number: "APPLICATION U/S 482 No. 3421 of 2024",
    neutral_citation: "2024:AHC:3421-DB",
    parallel_citation: "2024 AHC 3421",
    title: "Surya Prakash Shukla v. State of U.P. & Anr.",
    cause_title: "Surya Prakash Shukla Versus State of U.P. and Another",
    party_petitioner: "Surya Prakash Shukla",
    party_respondent: "State of U.P. & Anr.",
    coram: ["Justice Shamim Ahmed"],
    judgment_date: "2024-03-05",
    year: 2024,
    legal_domain: "Banking, Negotiable Instruments & Finance",
    disposal_nature: "Quashed (Allowed)",
    linked_sections: [
      { act_id: "ACT_NI_1881", section_number: "138" },
      { act_id: "ACT_NI_1881", section_number: "141" },
      { act_id: "ACT_BNSS_2023", section_number: "528" },
      { act_id: "ACT_CRPC_1973", section_number: "482" },
    ],
    ratio_decidendi_en: "Held that independent non-executive directors cannot be vicariously prosecuted under Section 141 of NI Act for cheque bounce unless specific role in day-to-day conduct of company business is averred in the complaint.",
    ratio_decidendi_hi: "कंपनी के चेक बाउंस मामले में धारा 141 के तहत गैर-कार्यकारी निदेशकों (Non-Executive Directors) के खिलाफ केवल सामान्य आरोप लगाकर मुकदमा नहीं चलाया जा सकता।",
    headnotes: [
      "Section 138 / 141 NI Act - Vicarious liability of Directors.",
      "Quashing - Non-executive directors immune without specific day-to-day management averments.",
    ],
    practice_takeaway: "Master precedent in quashing 138 proceedings initiated against sleeping directors, independent directors, or nominee directors.",
  },

  // =========================================================================
  // 3. BOMBAY HIGH COURT (BHC)
  // =========================================================================
  {
    case_id: "HC_BHC_2023_8120",
    hc_code: "BHC",
    court_name: "High Court of Judicature at Bombay",
    bench_location: "Mumbai (Principal Bench)",
    case_number: "COMMERCIAL ARBITRATION PETITION No. 450 of 2023",
    neutral_citation: "2023:BHC-OS:8120",
    parallel_citation: "2023 BHC-OS 8120",
    title: "Lodha Developers Ltd. v. Municipal Corporation of Greater Mumbai",
    cause_title: "Lodha Developers Limited Versus MCGM",
    party_petitioner: "Lodha Developers Ltd.",
    party_respondent: "Municipal Corporation of Greater Mumbai",
    coram: ["Justice G.S. Kulkarni"],
    judgment_date: "2023-09-14",
    year: 2023,
    legal_domain: "Arbitration & Alternative Dispute Resolution (ADR)",
    disposal_nature: "Interim Injunction Granted",
    linked_sections: [
      { act_id: "ACT_ARBITRATION_1996", section_number: "9" },
      { act_id: "ACT_ARBITRATION_1996", section_number: "17" },
      { act_id: "ACT_CONTRACT_1872", section_number: "73" },
    ],
    ratio_decidendi_en: "Laid down principles for grant of pre-arbitration protective relief under Section 9 of Arbitration and Conciliation Act, 1996. Held that court can restrain encashment of bank guarantees if fraud or irretrievable injustice is demonstrated.",
    ratio_decidendi_hi: "मध्यस्थता अधिनियम की धारा 9 के तहत अंतरिम राहत: यदि धोखाधड़ी या अपूरणीय अन्याय साबित हो, तो अदालत बैंक गारंटी को इनकैश कराने पर रोक लगा सकती है।",
    headnotes: [
      "Section 9 Arbitration Act - Scope of interim measures by Commercial Court.",
      "Bank Guarantee - Restraint permissible in cases of egregious fraud.",
    ],
    practice_takeaway: "Standard authority in commercial division of Bombay High Court for Section 9 Arbitration Injunction Petitions.",
  },

  // =========================================================================
  // 4. MADRAS HIGH COURT (MHC)
  // =========================================================================
  {
    case_id: "HC_MHC_2023_3310",
    hc_code: "MHC",
    court_name: "High Court of Judicature at Madras",
    bench_location: "Chennai",
    case_number: "C.R.P. (MD) No. 1290 of 2023",
    neutral_citation: "2023:MHC:3310",
    parallel_citation: "2023 MHC 3310",
    title: "K. Ramasamy v. S. Venkatachalam & Ors.",
    cause_title: "K. Ramasamy Versus S. Venkatachalam and Others",
    party_petitioner: "K. Ramasamy",
    party_respondent: "S. Venkatachalam & Ors.",
    coram: ["Justice P.T. Asha"],
    judgment_date: "2023-06-20",
    year: 2023,
    legal_domain: "Civil Law & Procedure",
    disposal_nature: "Revision Allowed",
    linked_sections: [
      { act_id: "ACT_CPC_1908", section_number: "115" },
      { act_id: "ACT_CPC_1908", section_number: "Order 39" },
      { act_id: "ACT_TPA_1882", section_number: "54" },
    ],
    ratio_decidendi_en: "Adjudicated Civil Revision under Section 115 CPC regarding temporary injunction in suit for declaration of title. Held that injunction cannot be granted against a true owner in possession without establishing prima facie legal title.",
    ratio_decidendi_hi: "सिविल प्रक्रिया संहिता धारा 115 व ऑर्डर 39: वैध कानूनी मालिकाना हक स्थापित किए बिना वास्तविक कब्जेदार स्वामी के खिलाफ निषेधाज्ञा (Stay) नहीं दी जा सकती।",
    headnotes: [
      "Order 39 Rules 1 & 2 CPC - Injunction against true title holder impermissible.",
      "Section 115 CPC - High Court revisional jurisdiction over trial court interim orders.",
    ],
    practice_takeaway: "Key precedent in property suits and civil revisions against interlocutory injunction orders.",
  },

  // =========================================================================
  // 5. CALCUTTA HIGH COURT (CHC)
  // =========================================================================
  {
    case_id: "HC_CHC_2024_1180",
    hc_code: "CHC",
    court_name: "High Court of Judicature at Calcutta",
    bench_location: "Kolkata (Appellate Side)",
    case_number: "W.P.A. 1180 of 2024",
    neutral_citation: "2024:CHC-AS:1180",
    parallel_citation: "2024 CHC 1180",
    title: "Siddhartha Ghosh v. State of West Bengal & Ors.",
    cause_title: "Siddhartha Ghosh Versus State of West Bengal and Others",
    party_petitioner: "Siddhartha Ghosh",
    party_respondent: "State of West Bengal & Ors.",
    coram: ["Justice Jay Sengupta"],
    judgment_date: "2024-01-29",
    year: 2024,
    legal_domain: "Constitutional & Administrative Law",
    disposal_nature: "Writ Allowed",
    linked_sections: [
      { act_id: "ACT_CONSTITUTION_1950", section_number: "226" },
      { act_id: "ACT_BNSS_2023", section_number: "173" },
      { act_id: "ACT_CRPC_1973", section_number: "154" },
    ],
    ratio_decidendi_en: "High Court exercised Article 226 writ jurisdiction to order independent police investigation and security protection where state police failed to register FIR in political assault case.",
    ratio_decidendi_hi: "संविधान के अनुच्छेद 226 के तहत रिट याचिका: पुलिस द्वारा FIR दर्ज न करने और निष्पक्ष जांच न करने पर उच्च न्यायालय ने स्वतंत्र जांच और पुलिस सुरक्षा का आदेश दिया।",
    headnotes: [
      "Article 226 Writs - Directing police registration of FIR in serious cognizable cases.",
      "Police Protection - Duty of state to protect witness and victim.",
    ],
    practice_takeaway: "Cited in Calcutta High Court Writ Mandamus petitions for police inaction and non-registration of FIR.",
  },
];

export const getHighCourtJudgmentsForSection = (actId, sectionNumber, hcCode = null) => {
  if (!actId || !sectionNumber) return [];
  const secClean = String(sectionNumber).trim().toLowerCase().replace(/[^0-9a-z]/g, "");

  return HIGH_COURT_JUDGMENTS_STORE.filter((j) => {
    const hcMatch = !hcCode || hcCode === "ALL" || j.hc_code === hcCode;
    const secMatch = j.linked_sections.some((s) => {
      const actMatches = s.act_id === actId;
      const sNumeric = String(s.section_number).trim().toLowerCase().replace(/[^0-9a-z]/g, "");
      return actMatches && (sNumeric === secClean || sNumeric.startsWith(secClean) || secClean.startsWith(sNumeric));
    });
    return hcMatch && secMatch;
  });
};

export default {
  HIGH_COURT_JUDGMENTS_STORE,
  getHighCourtJudgmentsForSection,
};
