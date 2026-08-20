/**
 * TacticalLegalAdvisoryService — ICJ Enterprise Platform
 * Provides 3-Tier Tactical Guidance for Junior Advocates & Litigants:
 * 1. 🛡️ Threat Shield & Danger Identification (Ex-Parte Risk, Arrest, Attachment)
 * 2. ⚔️ Counter-Attack Recommender (Counter Claim Order 8 R6A, Perjury Sec 340, Commission Complaints)
 * 3. 🏆 100% Victory Step-by-Step Tactical Roadmap
 */

export const TacticalLegalAdvisoryService = {
  /**
   * Analyze loaded case dossier & current stage to generate 3-tier tactical guidance
   */
  generateTacticalAdvice({ caseId, caseType = "civil", currentStage = "STAGE-02_WRITTEN_STATEMENT", disputeSummary = "" }) {
    const isCriminal = caseType.toLowerCase().includes("criminal") || disputeSummary.toLowerCase().includes("fir") || disputeSummary.toLowerCase().includes("police");

    // 1. Threat Shield Analysis
    const threats = [
      {
        id: "THREAT_EX_PARTE",
        title: "⚠️ Risk of Ex-Parte Order (एकतरफा आदेश का खतरा)",
        severity: "HIGH",
        description: "If appearance or WS/Reply is delayed beyond statutory deadline, court may proceed ex-parte.",
        suggestedPetition: "Order 39 Rule 1/2 Stay / Time Extension Petition",
        actionButtonText: "🛡️ File Time Extension & Stay Application",
      },
      {
        id: "THREAT_PERJURY_UNCHECKED",
        title: "⚠️ Opposing Party False Affidavit Risk (झूठे हलफनामे का खतरा)",
        severity: "MEDIUM",
        description: "Opposing party may present fabricated evidence or false statements to mislead court.",
        suggestedPetition: "Section 340 CrPC / BNSS 379 Perjury Application",
        actionButtonText: "🛡️ File Perjury & False Evidence Petition",
      },
    ];

    if (isCriminal) {
      threats.unshift({
        id: "THREAT_ARREST_WARRANT",
        title: "🚨 Risk of Coercive Process / Arrest Warrant (वारंट या गिरफ्तारी का खतरा)",
        severity: "CRITICAL",
        description: "Failure to attend hearing or non-appearance may trigger bailable/non-bailable warrants.",
        suggestedPetition: "Exemption under Sec 317/205 BNSS / Anticipatory Stay",
        actionButtonText: "🚨 File Emergency Exemption & Recall Warrant Application",
      });
    }

    // 2. Counter-Attack & Complaint Recommendations
    const counterAttacks = [
      {
        id: "COUNTER_CLAIM",
        title: "⚔️ Option A: File Counter-Claim (काउंटर दावा - Order 8 Rule 6A CPC)",
        applicableFor: "Civil / Property / Commercial",
        rationale: "Filing a counter-claim shifts the burden of proof onto the opposing party and puts them on defence.",
        actionButtonText: "⚔️ Generate Counter-Claim Draft",
      },
      {
        id: "PERJURY_PETITION",
        title: "⚔️ Option B: File Perjury Petition (झूठे गवाह पर केस - Sec 340 CrPC / BNSS 379)",
        applicableFor: "All Cases with False Affidavits",
        rationale: "Initiating prosecution against opposing party for false oath deters frivolous litigation.",
        actionButtonText: "⚔️ Generate Sec 340 Perjury Complaint",
      },
      {
        id: "COMMISSION_COMPLAINT",
        title: "⚔️ Option C: File Complaint in Statutory Commission (मानवाधिकार / महिला आयोग / RERA)",
        applicableFor: "Arbitrary State / Builder / Police Action",
        rationale: "Parallel complaint in NHRC, NCW, or Consumer Commission builds administrative pressure.",
        actionButtonText: "⚔️ Generate Statutory Commission Complaint",
      },
    ];

    // 3. 100% Victory Roadmap
    const victoryRoadmap = [
      {
        step: 1,
        title: "Step 1: Secure Immediate Status Quo / Interim Protection",
        actionText: "Obtain ex-parte stay or personal appearance exemption to neutralize immediate threat.",
      },
      {
        step: 2,
        title: "Step 2: File Detailed Para-wise Specific Denials & Counter-Attack",
        actionText: "Submit Written Statement / Reply along with Sec 340 Perjury application against false allegations.",
      },
      {
        step: 3,
        title: "Step 3: Execute Precise Cross-Examination of Opposing Witness",
        actionText: "Use ICJ Cross-Exam Interrogation Plan to expose contradictions in opposing testimony.",
      },
    ];

    return {
      caseId,
      currentStage,
      threats,
      counterAttacks,
      victoryRoadmap,
    };
  },
};

export default TacticalLegalAdvisoryService;
