/**
 * ICJ AI Legal Consultation & Case Diagnosis Engine (AI विधिक परामर्श व केस निदान इंजन)
 *
 * Powers:
 *  1. Voice Note & Text Intake ("आप क्या चाहते हैं?")
 *  2. Legal Document Reader & Scanner (FIR, Charge sheet, Deeds, Notices)
 *  3. Instant Legal Diagnosis (Legal Stand, BNS/IPC Sections, Sentence Risk, Bail Prospects, Trial Duration)
 *  4. Advocate Assistance & Auto Pleading Builder (Bail Apps, FIR Quashing, Written Statements)
 */

import ActivityService from "./activityService.js";

const CONSULTATION_STORE_KEY = "icj_ai_legal_consultations";

const getStorage = () => (typeof window !== "undefined" ? window.localStorage : (globalThis.window?.localStorage || globalThis.localStorage));
const readStore = (key) => {
  try { return JSON.parse(getStorage()?.getItem(key) || "[]"); } catch { return []; }
};
const writeStore = (key, val) => getStorage()?.setItem(key, JSON.stringify(val));

export const CASE_CATEGORIES = {
  CRIMINAL_FIR: "Criminal FIR & Arrest / आपराधिक मामला व एफआईआर",
  PROPERTY_DISPUTE: "Property & Land Dispute / संपत्ति विवाद",
  FAMILY_MATRIMONIAL: "Family & Matrimonial / पारिवारिक मामला",
  CIVIL_RECOVERY: "Civil Suit & Money Recovery / सिविल मामला व रिकवरी",
  CHEQUE_BOUNCE: "Section 138 Cheque Bounce / चेक बाउंस",
  CONSUMER_SERVICE: "Consumer Dispute / उपभोक्ता सेवा विवाद",
  GENERAL_LEGAL: "General Legal Problem / सामान्य कानूनी समस्या",
};

export const AiLegalConsultationService = {
  getAll() {
    return readStore(CONSULTATION_STORE_KEY);
  },

  getForClient(clientId) {
    return readStore(CONSULTATION_STORE_KEY).filter((c) => c.clientId === clientId);
  },

  getForAdvocate(advocateId) {
    return readStore(CONSULTATION_STORE_KEY).filter((c) => c.assignedAdvocateId === advocateId || c.status === "ADVOCATE_ASSIGNED");
  },

  /**
   * Run AI Legal Consultation Diagnosis
   */
  diagnoseCase({
    clientId,
    clientName,
    caseCategory = "CRIMINAL_FIR",
    problemText = "",
    voiceNoteSummary = "",
    uploadedDocumentNames = [],
    desiredOutcome = "",
  }) {
    const isCriminal = caseCategory.includes("CRIMINAL") || problemText.toLowerCase().includes("fir") || problemText.toLowerCase().includes("पुलिस") || problemText.toLowerCase().includes("झगड़ा");
    const isProperty = caseCategory.includes("PROPERTY") || problemText.toLowerCase().includes("संपत्ति") || problemText.toLowerCase().includes("ज़मीन") || problemText.toLowerCase().includes("कब्जा");

    let legalStand = "";
    let sectionsApplicable = [];
    let sentenceRisk = "";
    let bailProspects = "";
    let estimatedTrialDuration = "";
    let recommendedActions = [];
    let advocateAutoDraft = "";

    if (isCriminal) {
      legalStand = "आपकी स्थिति: आपराधिक एफआईआर/विवाद श्रेणी। भारतीय नागरिक सुरक्षा संहिता (BNSS 2023) एवं भारतीय न्याय संहिता (BNS 2023) के अंतर्गत प्राथमिक समीक्षा।";
      sectionsApplicable = ["BNS Section 115 (स्वेच्छा से चोट पहुँचाना)", "BNS Section 352 (आपराधिक धमकी)", "BNSS Section 35 (गिरफ्तारी की प्रक्रिया)", "BNSS Section 480/482 (जमानत याचिका)"];
      sentenceRisk = "यदि धाराएँ गैर-जमानती (Non-Bailable) हैं तो 3 से 7 वर्ष तक की संभावित सजा का प्रावधान। धारा 35 BNSS के तहत बिना वारंट गिरफ्तारी पर रोक हेतु अर्जी दी जा सकती है।";
      bailProspects = "उच्च (High Prospect) — यदि पहली बार नाम आया है या धाराएँ 7 साल से कम सजा वाली हैं, तो सत्र न्यायालय (Sessions Court) या उच्च न्यायालय से अग्रिम जमानत (Anticipatory Bail) प्राप्त की जा सकती है।";
      estimatedTrialDuration = "ट्रायल अवधि: लगभग 6 महीने से 1.5 वर्ष (फास्ट ट्रैक अर्जी देने पर 90 दिन)।";
      recommendedActions = [
        "तत्काल पुलिस अधीक्षक (SP) या मजिस्ट्रेट को BNSS धारा 35(3) अनुपालन हेतु प्रार्थना पत्र दें।",
        "सत्र न्यायालय में BNSS 482 (अग्रिम जमानत) याचिका दाखिल करें।",
        "यदि FIR झूठी है, तो उच्च न्यायालय में BNSS 528 (FIR निरस्तीकरण / Quashing) अर्जी की तैयारी करें।",
      ];
      advocateAutoDraft = `IN THE COURT OF THE SESSIONS JUDGE, LUCKNOW\nAPPLICATION FOR ANTIM-JAMANAT (ANTICIPATORY BAIL U/S 482 BNSS 2023)\n\nIn the matter of: State vs ${clientName}\nFIR No: [Auto-Extracted from Uploaded FIR]\nP.S.: [Auto-Extracted Police Station]\n\nMOST RESPECTFULLY SHOWETH:\n1. That the applicant ${clientName} is a respectable citizen with no past criminal antecedents.\n2. That the alleged FIR has been registered with malicious intent due to personal enmity.\n3. That the applicant undertakes to cooperate fully with the investigation.\n\nPRAYER:\nIt is therefore prayed that in the event of arrest, the applicant be released on anticipatory bail.`;
    } else if (isProperty) {
      legalStand = "आपकी स्थिति: संपत्ति व राजस्व विवाद (Civil & Revenue Jurisdiction)। संपत्ति अंतरण अधिनियम 1882 व विशिष्ट अनुतोष अधिनियम 1963 लागू।";
      sectionsApplicable = ["Specific Relief Act Sec 38 (स्थायी निषेधाज्ञा / Permanent Injunction)", "CPC Order 39 Rule 1 & 2 (अस्थाई स्टे)", "Transfer of Property Act Sec 54"];
      sentenceRisk = "सिविल मामला — कोई आपराधिक सजा नहीं। बेदखली या स्टे ऑर्डर का उल्लंघन करने पर सिविल जेल (अधिकतम 3 महीने)।";
      bailProspects = "सिविल मामला होने के कारण जमानत की आवश्यकता नहीं। मुख्य ध्यान 'अस्थाई स्टे (Stay Order)' प्राप्त करने पर होगा।";
      estimatedTrialDuration = "ट्रायल अवधि: स्टे अर्जी 15 से 30 दिन में; मुख्य सिविल वाद 1 से 2 वर्ष।";
      recommendedActions = [
        "सिविल जज (सीनियर डिविजन) के समक्ष सिविल वाद दर्ज कर CPC Order 39 Rule 1&2 के तहत तत्काल स्थगनादेश (Stay Order) मांगें।",
        "राजस्व अभिलेख (खतौनी/खसरा व बैनामा) का सत्यापन कराएं।",
      ];
      advocateAutoDraft = `IN THE COURT OF THE CIVIL JUDGE (SENIOR DIVISION), LUCKNOW\nSUIT FOR PERMANENT INJUNCTION & APPLICATION U/O 39 RULE 1 & 2 CPC\n\nPlaintiff: ${clientName}\nDefendants: [Opposite Party]\n\nSUBJECT: Plaint for restraining defendants from interfering in peaceful possession.\n\nPRAYER:\n1. Pass temporary injunction restraining defendants during suit pendency.`;
    } else {
      legalStand = "आपकी स्थिति: सामान्य विधिक समस्या। भारतीय अनुबंध अधिनियम 1872 व उपभोक्ता संरक्षण अधिनियम 2019 के तहत समीक्षा।";
      sectionsApplicable = ["Indian Contract Act Sec 73 (क्षतिपूर्ति)", "Consumer Protection Act 2019 Sec 35"];
      sentenceRisk = "सिविल/उपभोक्ता विवाद — हर्जाना व मुआवजा (Compensation) देय होगा।";
      bailProspects = "जमानत की आवश्यकता नहीं।";
      estimatedTrialDuration = "उपभोक्ता फोरम: 3 से 6 महीने।";
      recommendedActions = ["विपक्षी दल को 15 दिन का कानूनी नोटिस (Legal Notice) भेजें।", "जवाब न मिलने पर उपभोक्ता आयोग में शिकायत दर्ज करें।"];
      advocateAutoDraft = `LEGAL NOTICE\n\nTo,\n[Opposite Party]\n\nUnder instructions from my client Shri ${clientName}, I hereby call upon you to settle the dispute within 15 days of receipt of this notice, failing which legal proceedings will be initiated at your risk and cost.`;
    }

    const diagnosisRecord = {
      consultationId: `DIAG-${Date.now()}`,
      clientId,
      clientName,
      caseCategory,
      problemText,
      voiceNoteSummary: voiceNoteSummary || (problemText ? "Text Intake Recorded" : "Voice Note Processed"),
      uploadedDocumentNames,
      desiredOutcome: desiredOutcome || "कानूनी समाधान व सलाह",
      diagnosis: {
        legalStand,
        sectionsApplicable,
        sentenceRisk,
        bailProspects,
        estimatedTrialDuration,
        recommendedActions,
      },
      advocateAutoDraft,
      status: "DIAGNOSED_PENDING_ADVOCATE",
      assignedAdvocateId: null,
      assignedAdvocateName: null,
      createdAt: new Date().toISOString(),
      createdDate: new Date().toLocaleDateString("en-IN"),
    };

    const existing = readStore(CONSULTATION_STORE_KEY);
    writeStore(CONSULTATION_STORE_KEY, [diagnosisRecord, ...existing]);

    ActivityService.create({
      title: `AI Consultation Diagnosis generated for ${clientName}`,
      type: "ai_legal",
    });

    return diagnosisRecord;
  },

  /** Assign an empanelled advocate to a diagnosed case */
  assignAdvocate({ consultationId, advocateId, advocateName }) {
    const list = readStore(CONSULTATION_STORE_KEY);
    const updated = list.map((c) => {
      if (c.consultationId === consultationId) {
        return {
          ...c,
          status: "ADVOCATE_ASSIGNED",
          assignedAdvocateId: advocateId,
          assignedAdvocateName: advocateName,
          assignedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    writeStore(CONSULTATION_STORE_KEY, updated);
    return { success: true, consultationId, advocateAssigned: true, advocateName };
  },

  /** Advocate updates and approves the AI draft */
  approveAdvocateDraft({ consultationId, advocateNotes, correctedDraft }) {
    const list = readStore(CONSULTATION_STORE_KEY);
    const updated = list.map((c) => {
      if (c.consultationId === consultationId) {
        return {
          ...c,
          status: "DRAFT_APPROVED_BY_ADVOCATE",
          advocateAutoDraft: correctedDraft || c.advocateAutoDraft,
          advocateNotes,
          approvedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    writeStore(CONSULTATION_STORE_KEY, updated);
    return { success: true };
  },
};

export default AiLegalConsultationService;
