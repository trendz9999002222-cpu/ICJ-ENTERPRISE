/**
 * STAGE-AWARE LEGAL WORKFLOW SERVICE
 * Infers active court stage from judgments, order sheets, past pleadings, or spoken voice commands,
 * and dynamically computes the exact stage-specific legal action options required.
 */

export const COURT_STAGES = {
  INITIAL_FILING: {
    id: "INITIAL_FILING",
    label: "शुरुआती याचिका व नोटिस चरण (Initial Filing & Legal Notice Stage)",
    badgeColor: "#3b82f6",
    description: "केस की शुरुआत: विधिक नोटिस, याचिका (Order 7 CPC / Writ) एवं केविएट दाखिल करना।",
    actions: [
      { id: "ACT_WRIT_PLAINT", label: "📄 1-क्लिक रिट याचिका / मुख्य दावा पत्र (Plaint Order 7)", templateType: "WRIT_PETITION", priority: "HIGH" },
      { id: "ACT_LEGAL_NOTICE", label: "✉️ 1-क्लिक 15-दिवसीय विधिक नोटिस (Pre-Litigation Notice)", templateType: "LEGAL_NOTICE", priority: "MEDIUM" },
      { id: "ACT_CAVEAT", label: "🛡️ 1-क्लिक केविएट याचिका (Caveat Petition Sec 148A)", templateType: "CAVEAT", priority: "MEDIUM" },
    ],
  },
  INTERIM_RELIEF: {
    id: "INTERIM_RELIEF",
    label: "अंतरिम राहत व स्टे चरण (Interim Injunction & Emergency Relief Stage)",
    badgeColor: "#ef4444",
    description: "आपातकालीन स्थिति: कोर्ट से तत्काल स्टे, अंतरिम आदेश (Order 39) या अंतरिम जमानत हेतु।",
    actions: [
      { id: "ACT_STAY_INJUNCTION", label: "🚨 1-क्लिक तत्काल स्टे व अंतरिम आदेश (Order 39 Rule 1 & 2)", templateType: "STAY_APPLICATION", priority: "URGENT" },
      { id: "ACT_INTERIM_BAIL", label: "⚖️ 1-क्लिक अंतरिम जमानत याचिका (Interim Bail Application)", templateType: "INTERIM_BAIL", priority: "URGENT" },
      { id: "ACT_STATUS_QUO", label: "📌 1-क्लिक यथास्थिति बनाए रखने की याचिका (Status Quo Application)", templateType: "STATUS_QUO", priority: "HIGH" },
    ],
  },
  WRITTEN_STATEMENT: {
    id: "WRITTEN_STATEMENT",
    label: "जवाब दावा व प्रतिरक्षण चरण (Written Statement & Defense Stage)",
    badgeColor: "#f59e0b",
    description: "विपक्षी दल हेतु: दावे का औपचारिक जवाब (Order 8), रीजॉइंडर एवं प्राथमिक आपत्तियां।",
    actions: [
      { id: "ACT_WRITTEN_STATEMENT", label: "🛡️ 1-क्लिक जवाब दावा व काउंटर क्लेम (Written Statement Order 8)", templateType: "WRITTEN_STATEMENT", priority: "HIGH" },
      { id: "ACT_REJOINDER", label: "📝 1-क्लिक रीजॉइंडर शपथ पत्र (Rejoinder Affidavit)", templateType: "REJOINDER", priority: "HIGH" },
      { id: "ACT_REJECT_PLAINT", label: "❌ 1-क्लिक दावा निरस्त करने का प्रार्थना पत्र (Order 7 Rule 11)", templateType: "REJECT_PLAINT", priority: "MEDIUM" },
    ],
  },
  BSA_EVIDENCE: {
    id: "BSA_EVIDENCE",
    label: "साक्ष्य व साक्ष्य अधिनियम 2023 चरण (Evidence & BSA 2023 Stage)",
    badgeColor: "#10b981",
    description: "साक्ष्य पेश करना: धारा 63 BSA (इलेक्ट्रॉनिक डिजिटल हैश प्रमाण पत्र) व मुख्य परीक्षा शपथ पत्र।",
    actions: [
      { id: "ACT_SEC63_BSA", label: "🔐 1-क्लिक धारा 63 BSA डिजिटल साक्ष्य प्रमाण पत्र शपथ पत्र", templateType: "SEC63_BSA_CERTIFICATE", priority: "HIGH" },
      { id: "ACT_EVIDENCE_AFFIDAVIT", label: "📜 1-क्लिक मुख्य परीक्षा साक्ष्य शपथ पत्र (Chief Examination)", templateType: "EVIDENCE_AFFIDAVIT", priority: "HIGH" },
      { id: "ACT_DOC_SUBMISSION", label: "📁 1-क्लिक अतिरिक्त दस्तावेज़ दाखिल करने का आवेदन (Order 13)", templateType: "DOC_SUBMISSION", priority: "MEDIUM" },
    ],
  },
  FINAL_ARGUMENTS: {
    id: "FINAL_ARGUMENTS",
    label: "अंतिम बहस व निर्णय/अपील चरण (Final Arguments, Judgment & Appeal Stage)",
    badgeColor: "#8b5cf6",
    description: "अंतिम सुनवाई: लिखित बहस का पुलिंदा, उच्च न्यायालय में सिविल रिवीजन व अपील।",
    actions: [
      { id: "ACT_WRITTEN_ARGUMENTS", label: "📜 1-क्लिक लिखित बहस का डोजियर (Written Submissions)", templateType: "WRITTEN_ARGUMENTS", priority: "HIGH" },
      { id: "ACT_HC_APPEAL", label: "⚖️ 1-क्लिक उच्च न्यायालय अपील व रिवीजन (Civil Revision Petition)", templateType: "HC_APPEAL", priority: "HIGH" },
      { id: "ACT_EXECUTION", label: "🏛️ 1-क्लिक डिग्री निष्पादन याचिका (Execution Application Order 21)", templateType: "EXECUTION", priority: "MEDIUM" },
    ],
  },
};

export const StageAwareLegalWorkflowService = {
  /**
   * Infer current stage from text (e.g. spoken voice command, uploaded court order/judgment)
   */
  inferStageFromContext(inputText = "", existingCase = {}) {
    const text = String(inputText + " " + JSON.stringify(existingCase)).toLowerCase();

    if (text.includes("स्टे") || text.includes("stay") || text.includes("injunction") || text.includes("order 39") || text.includes("bail") || text.includes("जमानत")) {
      return COURT_STAGES.INTERIM_RELIEF;
    }
    if (text.includes("जवाब दावा") || text.includes("written statement") || text.includes("order 8") || text.includes("rejoinder") || text.includes("रीजॉइंडर")) {
      return COURT_STAGES.WRITTEN_STATEMENT;
    }
    if (text.includes("साक्ष्य") || text.includes("evidence") || text.includes("bsa 63") || text.includes("65b") || text.includes("affidavit")) {
      return COURT_STAGES.BSA_EVIDENCE;
    }
    if (text.includes("बहस") || text.includes("arguments") || text.includes("appeal") || text.includes("अपील") || text.includes("judgment") || text.includes("निर्णय")) {
      return COURT_STAGES.FINAL_ARGUMENTS;
    }

    return COURT_STAGES.INITIAL_FILING;
  },

  getAllStages() {
    return Object.values(COURT_STAGES);
  },
};

export default StageAwareLegalWorkflowService;
