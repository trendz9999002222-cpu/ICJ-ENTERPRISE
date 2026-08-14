/**
 * StageAwareButtonService — ICJ Enterprise Platform
 * Provides dynamic 1-Click Action Buttons based on current legal case stage:
 * Adjournment / Next Date, Exemption (Sec 205/317), Certified Copy, Inspection, RTI, Stay.
 */

export const StageAwareButtonService = {
  /**
   * Get 1-Click Action Buttons for current case stage
   */
  getStageButtons(stageId = "STAGE-02_WRITTEN_STATEMENT") {
    const commonButtons = [
      {
        id: "BTN_ADJOURNMENT",
        label: "📅 Adjournment / Next Date Petition (तारीख पेशी अर्जी)",
        icon: "CalendarMonth",
        color: "warning",
        promptText: "तारीख बढ़ाने का कारण चुनें (उदा. अस्वस्थता / वरिष्ठ वकील हाईकोर्ट में व्यस्त / आवश्यक दस्तावेज़ अप्राप्त):",
        defaultReason: "Counsel engaged in High Court / Sickness of Party",
      },
      {
        id: "BTN_EXEMPTION",
        label: "🙋‍♂️ Exemption Application (हाजिरी माफी अर्जी - Sec 205/317)",
        icon: "PersonOff",
        color: "info",
        promptText: "व्यक्तिगत अनुपस्थिति का कारण दर्ज करें:",
        defaultReason: "Deponent out of station on urgent official duty",
      },
      {
        id: "BTN_CERTIFIED_COPY",
        label: "📜 Certified Copy Application (नकल अर्जी)",
        icon: "Description",
        color: "primary",
        promptText: "किस आदेश / कागज़ की प्रमाणित प्रति (Certified Copy) चाहिए?",
        defaultReason: "Certified Copy of Order Sheet & Plaint",
      },
      {
        id: "BTN_INSPECTION",
        label: "🔍 Court File Inspection Application (मुआयना अर्जी)",
        icon: "Search",
        color: "secondary",
        promptText: "मुआयना (Inspection) करने वाले व्यक्ति का नाम:",
        defaultReason: "Inspection of trial court records by empanelled counsel",
      },
      {
        id: "BTN_RTI_INQUIRY",
        label: "ℹ️ RTI Status Inquiry Application (आरटीआई अर्जी)",
        icon: "Info",
        color: "success",
        promptText: "किस विभाग/कोर्ट रजिस्ट्री से जानकारी चाहिए?",
        defaultReason: "RTI Application under Section 6(1) for delay inquiry",
      },
    ];

    if (stageId.includes("STAGE-01") || stageId.includes("STAGE-04")) {
      commonButtons.unshift({
        id: "BTN_STAY_INJUNCTION",
        label: "🛑 Urgent Stay / Injunction Petition (Order 39 Rule 1/2)",
        icon: "Block",
        color: "error",
        promptText: "स्थगन (Stay) मांगने का मुख्य आधार दर्ज करें:",
        defaultReason: "Irreparable injury will be caused if ex-parte stay is not granted",
      });
    }

    return commonButtons;
  },

  /**
   * 1-Click Instant Petition Generator for Procedural Buttons
   */
  generateProceduralPetition({ buttonId, caseTitle, clientName, courtName, reasonText }) {
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const reason = reasonText || "Reason stated in application";

    if (buttonId === "BTN_ADJOURNMENT") {
      return `IN THE COURT OF: ${courtName || "Hon'ble Court"}
IN RE: ${caseTitle || "Legal Matter"}

APPLICATION FOR ADJOURNMENT / NEXT DATE OF HEARING

MOST RESPECTFULLY SHOWETH:
1. That the present matter is fixed for hearing today.
2. That the applicant/counsel Sh. ${clientName || "Litigant"} is unable to attend/proceed today due to sufficient cause: "${reason}".
3. That the delay is neither intentional nor deliberate.

PRAYER:
It is respectfully prayed that this Hon'ble Court may be pleased to adjourn the matter and fix a next date of hearing in the interest of justice.

DATE: ${dateStr}
APPLICANT / ADVOCATE FOR APPLICANT`;
    }

    if (buttonId === "BTN_EXEMPTION") {
      return `BEFORE THE HON'BLE COURT OF: ${courtName || "Hon'ble Court"}
APPLICATION FOR EXEMPTION FROM PERSONAL APPEARANCE
(UNDER SECTION 317 / 205 OF BNSS / CrPC / CPC)

MOST RESPECTFULLY SHOWETH:
1. That the applicant Sh. ${clientName || "Litigant"} is a law-abiding citizen and deeply respects the authority of this Hon'ble Court.
2. That the applicant is unable to appear in person today due to: "${reason}".
3. That the applicant is represented by counsel today and no prejudice will be caused to the proceedings.

PRAYER:
It is humbly prayed that the personal appearance of the applicant be exempted for today only.

DATE: ${dateStr}
APPLICANT THROUGH COUNSEL`;
    }

    if (buttonId === "BTN_CERTIFIED_COPY") {
      return `IN THE COURT OF: ${courtName || "Hon'ble Court"}
APPLICATION FOR ISSUE OF CERTIFIED COPIES

MOST RESPECTFULLY SHOWETH:
1. That the applicant Sh. ${clientName || "Litigant"} requires certified copies of: "${reason}".
2. That the applicant is a party to the aforesaid proceedings.

PRAYER:
It is prayed that urgent certified copies be issued to the applicant upon payment of prescribed fee.

DATE: ${dateStr}
APPLICANT / ADVOCATE`;
    }

    return `IN THE COURT OF: ${courtName || "Hon'ble Court"}
IN RE: ${caseTitle || "Legal Matter"}
APPLICATION FOR PROCEDURAL RELIEF

REASON: ${reason}
DATE: ${dateStr}
APPLICANT THROUGH ADVOCATE`;
  },
};

export default StageAwareButtonService;
