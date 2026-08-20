/**
 * TrustGovernanceDirectiveService — ICJ Enterprise Platform
 * Provides Trust Guidelines Oversight, Litigant Rights Protection Engine,
 * Advisory Directives for Delayed Cases, and Auto Legal Aid Re-assignment.
 */

const TRUST_DIRECTIVES_KEY = "icj_trust_directives";

export const TrustGovernanceDirectiveService = {
  /**
   * Get all active Trust Directives issued to Advocates
   */
  getDirectives() {
    try {
      const raw = localStorage.getItem(TRUST_DIRECTIVES_KEY);
      return raw ? JSON.parse(raw) : [
        {
          id: "DIR-3001",
          advocateName: "Empaneled Legal Counsel",
          advocateRegNo: "D/1024/2012",
          clientName: "Empaneled Litigant",
          caseTitle: "Civil Revision Petition #2026/41",
          issue: "केस याचिका दाखिल करने में 14 दिन का विलंब (Delay in Filing)",
          directiveText: "नागरिक के कानूनी अधिकारों की रक्षा हेतु आगामी 48 घंटे के अंदर ड्राफ्टिंग पूर्ण कर कोर्ट में याचिका दाखिल करें।",
          status: "ISSUED",
          deadline: new Date(Date.now() + 172800000).toISOString(),
          issuedDate: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  },

  /**
   * Issue a Binding Trust Directive to an Advocate
   */
  issueDirective({ advocateName, advocateRegNo, clientName, caseTitle, issue, directiveText }) {
    const directives = this.getDirectives();
    const newDirective = {
      id: `DIR-${Date.now()}`,
      advocateName: advocateName || "Advocate",
      advocateRegNo: advocateRegNo || "D/VERIFIED",
      clientName: clientName || "Litigant Client",
      caseTitle: caseTitle || "Legal Matter",
      issue: issue || "केस की कार्यवाही में विलंब या दिशा-निर्देश उल्लंघन",
      directiveText: directiveText || "नागरिक के अधिकारों को क्षति से बचाने हेतु 48 घंटे में आवश्यक कार्यवाही पूर्ण करें।",
      status: "ISSUED",
      deadline: new Date(Date.now() + 172800000).toISOString(),
      issuedDate: new Date().toISOString(),
    };

    directives.unshift(newDirective);
    localStorage.setItem(TRUST_DIRECTIVES_KEY, JSON.stringify(directives));
    return newDirective;
  },

  /**
   * Litigant Rights Protection Guarantee Document
   */
  getLitigantRightsGuarantee() {
    return {
      title: "ICJ Enterprise नागरिक अधिकार संरक्षण गारंटी (Litigant Rights Guarantee)",
      guaranteePoints: [
        "1. समयबद्ध विधिक कार्यवाही: किसी भी केस में वकील द्वारा अनावश्यक विलंब नहीं किया जाएगा।",
        "2. निष्पक्ष फीस व पारदर्शिता: तय की गई फीस के अतिरिक्त कोई अन्य अन-अकाउंटेड मांग नहीं की जाएगी।",
        "3. ट्रस्ट संरक्षण व सहायता: वकील द्वारा लापरवाही किए जाने पर ट्रस्ट हस्तक्षेप कर त्वरित दिशा-निर्देश जारी करेगा।",
        "4. केस री-असाइनमेंट: वकील के विफल रहने पर केस स्वतः वरिष्ठ अधिवक्ता / लीगल ऐड सेल को स्थानांतरित होगा।",
      ],
    };
  },
};

export default TrustGovernanceDirectiveService;
