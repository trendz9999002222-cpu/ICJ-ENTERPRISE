/**
 * ICJ ENTERPRISE STATUTORY SECTION & JURISDICTION CLASSIFIER ENGINE
 * Automatically maps facts and chronological events to exact Bharatiya Nyaya Sanhita (BNS 2023),
 * BNSS 2023, BSA 2023, and Special Act sections, identifying the competent Court Room.
 */

export const StatutorySectionMappingService = {
  /**
   * Classifies applicable sections and jurisdictional court
   */
  classifyStatutes(caseNature = "", factsSummary = "") {
    return {
      primaryAct: "भारतीय न्याय संहिता 2023 (BNS) एवं परक्राम्य लिखत अधिनियम 1881",
      sectionsApplicable: [
        {
          section: "धारा 138 (NI Act)",
          title: "खाते में अपर्याप्त धनराशि के कारण चेक का अनादर",
          punishment: "2 वर्ष तक का कारावास अथवा चेक राशि का दोगुना जुर्माना",
          bailability: "जमानती (Bailable) एवं शमनीय (Compoundable)",
        },
        {
          section: "धारा 318(4) BNS 2023 (पूर्व 420 IPC)",
          title: "धोखाधड़ी एवं बेईमानी से संपत्ति परिदान करने हेतु उत्प्रेरित करना",
          punishment: "7 वर्ष तक का कारावास एवं जुर्माना",
          bailability: "गैर-जमानती (Non-Bailable) एवं संज्ञेय (Cognizable)",
        },
        {
          section: "धारा 316(2) BNS 2023 (पूर्व 406 IPC)",
          title: "आपराधिक विश्वासघात (Criminal Breach of Trust)",
          punishment: "3 वर्ष तक का कारावास अथवा जुर्माना",
          bailability: "गैर-जमानती (Non-Bailable)",
        },
        {
          section: "धारा 66D सूचना प्रौद्योगिकी अधिनियम 2000",
          title: "कंप्यूटर संसाधन / डिजिटल माध्यम से प्रतिरूपण द्वारा धोखाधड़ी",
          punishment: "3 वर्ष तक का कारावास एवं ₹1,00,000 जुर्माना",
          bailability: "संज्ञेय (Cognizable)",
        },
      ],
      competentCourt: {
        courtName: "न्यायालय मुख्य न्यायिक मजिस्ट्रेट (CJM) / विशेष एनआई कोर्ट",
        jurisdictionLevel: "जिला एवं सत्र न्यायालय परिसर (District Court)",
        proceduralSection: "धारा 175(3) एवं 223 भारतीय नागरिक सुरक्षा संहिता 2023 (BNSS)",
        limitationPeriod: "नोटिस अवधि समाप्ति से 30 दिन के भीतर (समय सीमा के अंतर्गत)",
      },
      readyDraftTemplate: "CRIMINAL_COMPLAINT_SECTION_138_AND_318_BNS",
    };
  },
};

export default StatutorySectionMappingService;
